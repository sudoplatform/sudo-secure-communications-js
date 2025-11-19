/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { IEncryptedFile } from 'matrix-encrypt-attachment'
import {
  anything,
  capture,
  instance,
  mock,
  reset,
  verify,
  when,
} from 'ts-mockito'
import { v4 } from 'uuid'
import { MatrixClientManager } from '../../../../../src/private/data/common/matrixClientManager'
import { S3Client } from '../../../../../src/private/data/common/s3Client'
import { MatrixMediaService } from '../../../../../src/private/data/media/matrixMediaService'
import { EntityDataFactory } from '../../../../data-factory/entity'

describe('MatrixMediaService Test Suite', () => {
  const mockMatrixClientManager = mock<MatrixClientManager>()
  const mockS3Client = mock<S3Client>()
  const mockConfiguration = EntityDataFactory.secureCommsConfig

  let instanceUnderTest: MatrixMediaService

  beforeEach(() => {
    reset(mockMatrixClientManager)
    reset(mockS3Client)

    instanceUnderTest = new MatrixMediaService(
      instance(mockMatrixClientManager),
      instance(mockS3Client),
    )
  })

  describe('uploadMediaFile', () => {
    it('calls s3Client and returns result correctly', async () => {
      const mediaArrayBuffer = new ArrayBuffer(0)
      const keyPrefix = 'media'
      const mediaId = v4()
      const key = `${keyPrefix}/${mediaId}`
      const fileType = 'application/pdf'
      when(mockS3Client.upload(anything())).thenResolve(key)

      const mediaCredential = EntityDataFactory.mediaCredential
      const result = await instanceUnderTest.uploadMediaFile({
        file: mediaArrayBuffer,
        fileName: 'fileName.pdf',
        fileType,
        mediaCredential,
      })
      expect(result).toStrictEqual(
        `mxc://${mediaCredential.bucket}.s3.${mediaCredential.region}.amazonaws.com/${keyPrefix}_${mediaId}`,
      )
      const [argUpload] = capture(mockS3Client.upload).first()
      expect(argUpload).toStrictEqual<typeof argUpload>({
        bucket: mediaCredential.bucket,
        region: mediaCredential.region,
        key: expect.stringContaining(mediaCredential.keyPrefix!),
        body: new ArrayBuffer(0),
        contentType: fileType,
      })
      verify(mockS3Client.upload(anything())).once()
    })
  })

  describe('downloadMediaFile', () => {
    it('calls s3Client and returns result correctly', async () => {
      const mediaArrayBuffer = new ArrayBuffer(0)
      when(mockS3Client.download(anything())).thenResolve(mediaArrayBuffer)

      const uri = `mxc://${mockConfiguration.homeServer}/media_123456`
      const mediaCredential = EntityDataFactory.mediaCredential
      const result = await instanceUnderTest.downloadMediaFile({
        uri,
        mediaCredential,
      })

      expect(result).toStrictEqual(mediaArrayBuffer)
      const [argDownload] = capture(mockS3Client.download).first()
      expect(argDownload).toStrictEqual<typeof argDownload>({
        bucket: mediaCredential.bucket,
        region: mediaCredential.region,
        key: 'media/123456',
      })
      verify(mockS3Client.download(anything())).once()
    })

    it('calls s3Client and matrixClient and decrypts file if encryption info is provided', async () => {
      const encryptedFile: ArrayBuffer = new Uint8Array([1, 2]).buffer
      const decryptedFile: ArrayBuffer = new Uint8Array([3, 4]).buffer
      when(mockS3Client.download(anything())).thenResolve(encryptedFile)
      when(
        mockMatrixClientManager.decryptFile(anything(), anything()),
      ).thenResolve(decryptedFile)

      const uri = `mxc://${mockConfiguration.homeServer}/media_123456`
      const mediaCredential = EntityDataFactory.mediaCredential
      const encryptionInfo = EntityDataFactory.fileEncryptionInfo
      const matrixEncryptionInfo: IEncryptedFile = {
        ...encryptionInfo,
      } as IEncryptedFile
      const result = await instanceUnderTest.downloadMediaFile({
        uri,
        mediaCredential,
        encryptionInfo,
      })

      expect(result).toStrictEqual(decryptedFile)
      const [argDownload] = capture(mockS3Client.download).first()
      expect(argDownload).toStrictEqual<typeof argDownload>({
        bucket: mediaCredential.bucket,
        region: mediaCredential.region,
        key: 'media/123456',
      })
      verify(mockS3Client.download(anything())).once()
      const [argFile, argEncryptInfo] = capture(
        mockMatrixClientManager.decryptFile,
      ).first()
      expect(argFile).toStrictEqual<typeof argFile>(encryptedFile)
      expect(argEncryptInfo).toStrictEqual<typeof argEncryptInfo>(
        matrixEncryptionInfo,
      )
      verify(mockMatrixClientManager.decryptFile(anything(), anything())).once()
    })
  })

  describe('getMsgType', () => {
    it('should return correct MsgType based on input MIME-type', async () => {
      expect(instanceUnderTest.getMsgType('image/webp')).toEqual('m.image')
      expect(instanceUnderTest.getMsgType('video/webm')).toEqual('m.video')
      expect(instanceUnderTest.getMsgType('audio/weba')).toEqual('m.audio')
      expect(instanceUnderTest.getMsgType('application/pdf')).toEqual('m.file')
    })
  })

  describe('generateThumbnailAndBlurHash', () => {
    global.URL.createObjectURL = jest.fn(() => 'blob:mock-url')
    it('should throw an error for unsupported MIME type', async () => {
      await expect(
        instanceUnderTest.generateThumbnailAndBlurHash({
          file: new ArrayBuffer(10),
          mimeType: 'application/pdf',
        }),
      ).rejects.toThrow('Unsupported MIME type')
    })
  })
})
