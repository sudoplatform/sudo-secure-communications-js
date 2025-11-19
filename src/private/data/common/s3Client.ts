/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  S3Client as AWSS3Client,
  GetObjectCommand,
  PutObjectCommand,
} from '@aws-sdk/client-s3'
import { DefaultLogger, Logger } from '@sudoplatform/sudo-common'
import { S3DownloadError, S3UploadError } from '../../../public'
import { MediaCredentialEntity } from '../../domain/entities/media/mediaCredentialEntity'
import { getBase64EncodedMd5Hash } from '../../util/cryptoUtil'

/**
 * Properties required to perform an S3 upload.
 *
 * @interface S3ClientUploadInput
 * @property {string} bucket The name of the S3 bucket where the object will be uploaded.
 * @property {string} region The region in which the bucket resides.
 * @property {string} key The object key under which the object will be stored.
 * @property {ArrayBuffer} body The content to upload.
 * @property {string} contentType The MIME type of the object being uploaded.
 */
interface S3ClientUploadInput {
  bucket: string
  region: string
  key: string
  body: ArrayBuffer
  contentType: string
}

/**
 * Properties requried to perform an S3 download.
 *
 * @interface S3ClientDownloadInput
 * @property {string} bucket The name of the S3 bucket where the object will be downloaded.
 * @property {string} region The region in which the bucket resides.
 * @property {string} key The object key of the object to download.
 */
interface S3ClientDownloadInput {
  bucket: string
  region: string
  key: string
}

export class S3Client {
  private readonly log: Logger

  constructor(private readonly mediaCredential: MediaCredentialEntity) {
    this.log = new DefaultLogger(this.constructor.name)
  }

  async upload(input: S3ClientUploadInput): Promise<string> {
    this.log.debug('Uploading to S3', { input })

    const awsS3 = this.getAWSS3(input.region)
    try {
      const putObjectCommand = new PutObjectCommand({
        Bucket: input.bucket,
        Key: input.key,
        Body: new Uint8Array(input.body),
        ContentType: input.contentType,
        ContentMD5: getBase64EncodedMd5Hash(input.body),
      })
      await awsS3.send(putObjectCommand)
      return input.key
    } catch (err) {
      const error = err as Error
      const msg = `${error.name}: ${error.message}`
      this.log.error(msg)
      throw new S3UploadError(msg)
    }
  }

  async download(input: S3ClientDownloadInput): Promise<ArrayBuffer> {
    this.log.debug('Downloading from S3', { input })

    const awsS3 = this.getAWSS3(input.region)
    try {
      const getObjectCommand = new GetObjectCommand({
        Bucket: input.bucket,
        Key: input.key,
      })
      const response = await awsS3.send(getObjectCommand)
      if (!response.Body) {
        throw new S3DownloadError('Did not find the file to download')
      }
      const bytes = await response.Body.transformToByteArray()
      return bytes.buffer as ArrayBuffer
    } catch (err) {
      const error = err as Error
      const msg = `${error.name}: ${error.message}`
      this.log.error(msg)
      throw new S3DownloadError(msg)
    }
  }

  private getAWSS3(region: string): AWSS3Client {
    const s3Client = new AWSS3Client({
      region,
      credentials: {
        accessKeyId: this.mediaCredential.accessKeyId,
        secretAccessKey: this.mediaCredential.secretAccessKey,
        sessionToken: this.mediaCredential.sessionToken,
      },
    })
    return s3Client
  }
}
