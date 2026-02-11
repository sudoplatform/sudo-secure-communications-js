/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { encode } from 'blurhash'
import { MsgType } from 'matrix-js-sdk/lib/matrix'
import { v4 } from 'uuid'
import { FileEncryptionInfoEntity } from '../../domain/entities/media/fileEncryptionInfoEntity'
import {
  DownloadMediaFileInput,
  MediaService,
  UploadMediaFileInput,
} from '../../domain/entities/media/mediaService'
import { MatrixClientManager } from '../common/matrixClientManager'
import { S3Client } from '../common/s3Client'

/**
 * Input for `MediaService.generateThumbnailAndBlurHash` method.
 *
 * @property {ArrayBuffer} file The file to generate a thumbnail and blurhash for.
 * @property {string} mimeType The MIME type of the file.
 * @property {number} maxThumbWidth The maximum width of the thumbnail in pixels.
 * @property {number} maxThumbHeight The maximum height of the thumbnail in pixels.
 */
interface GenerateThumbnailAndBlurhashInput {
  file: ArrayBuffer
  mimeType: string
  maxThumbWidth?: number
  maxThumbHeight?: number
}

/**
 * Output for `MediaService.generateThumbnailAndBlurHash` method.
 *
 * @property {ArrayBuffer} file The file containing the thumbnail.
 * @property {string} mimeType The MIME type of the file.
 * @property {number} width The width of the thumbnail in pixels.
 * @property {number} height The height of the thumbnail in pixels.
 * @property {number} size The size of the thumbnail in bytes.
 * @property {string} blurHash The blurhash value.
 */
interface ThumbnailAndBlurhashOutput {
  thumbnail: ArrayBuffer
  mimeType: string
  width: number
  height: number
  size: number
  blurHash: string
}

export class MatrixMediaService implements MediaService {
  constructor(
    private readonly matrixClient: MatrixClientManager,
    private readonly s3Client: S3Client,
  ) {}

  public async uploadMediaFile(input: UploadMediaFileInput): Promise<string> {
    const mediaId = v4()
    const objectKeyPrefix = input.mediaCredential.keyPrefix ?? ''
    const key = `${objectKeyPrefix}${mediaId}`

    const url = await this.s3Client.upload({
      bucket: input.mediaCredential.bucket,
      region: input.mediaCredential.region,
      key,
      body: input.file,
      contentType: input.fileType,
    })
    const sanitizedMediaId = url.replace(/^\/+/, '').replace(/\//g, '_')
    const mxcUrl = `mxc://${input.mediaCredential.bucket}.s3.${input.mediaCredential.region}.amazonaws.com/${sanitizedMediaId}`
    return mxcUrl
  }

  public async downloadMediaFile(
    input: DownloadMediaFileInput,
  ): Promise<ArrayBuffer> {
    const uriParts = input.uri.split('/')
    let mediaIdPart = uriParts[uriParts.length - 1]
    if (mediaIdPart.indexOf('_') === -1) {
      // handle legacy media ids without avatar/media prefix
      mediaIdPart = `media_${mediaIdPart}`
    }
    const key = mediaIdPart.replace('_', '/')

    const file = await this.s3Client.download({
      bucket: input.mediaCredential.bucket,
      region: input.mediaCredential.region,
      key,
    })
    if (input.encryptionInfo) {
      return await this.decryptFile(file, input.encryptionInfo)
    }
    return file
  }

  public async decryptFile(
    file: ArrayBuffer,
    encryptionInfo: FileEncryptionInfoEntity,
  ): Promise<ArrayBuffer> {
    return await this.matrixClient.decryptFile(file, {
      key: encryptionInfo.key,
      iv: encryptionInfo.iv,
      v: encryptionInfo.v,
      hashes: encryptionInfo.hashes,
    })
  }

  /**
   * Determines the message type based on the MIME type of the file.
   *
   * @param {string} mimeType The MIME type of the file.
   * @returns {MsgType} The message type.
   */
  public getMsgType(
    mimeType: string,
  ): MsgType.File | MsgType.Image | MsgType.Video | MsgType.Audio {
    let msgType: MsgType = MsgType.File // default to generic file
    if (mimeType.startsWith('image')) {
      msgType = MsgType.Image
    } else if (mimeType.startsWith('video')) {
      msgType = MsgType.Video
    } else if (mimeType.startsWith('audio')) {
      msgType = MsgType.Audio
    }
    return msgType
  }

  /**
   * Generates a thumbnail and blurhash for a given file.
   *
   * **Note:** Only works for browsers. If client is using Node.js, this method will throw an error.
   *
   * @param {GenerateThumbnailAndBlurhashInput} input Parameters used to generate a thumbnail and blur hash.
   * @returns {ThumbnailAndBlurhashOutput} An object containing the thumbnail, blurhash, width, height, size, and MIME type.
   */
  public async generateThumbnailAndBlurHash({
    file,
    mimeType,
    maxThumbWidth = 300,
    maxThumbHeight = 300,
  }: GenerateThumbnailAndBlurhashInput): Promise<ThumbnailAndBlurhashOutput> {
    const blob = new Blob([file], { type: mimeType })
    const url = URL.createObjectURL(blob)

    const drawAndEncode = async (
      source: HTMLImageElement | HTMLVideoElement,
      width: number,
      height: number,
    ): Promise<ThumbnailAndBlurhashOutput> => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        throw new Error('Failed to get canvas context')
      }
      const scale = Math.min(maxThumbWidth / width, maxThumbHeight / height, 1)
      const scaledWidth = Math.round(width * scale)
      const scaledHeight = Math.round(height * scale)

      canvas.width = scaledWidth
      canvas.height = scaledHeight
      ctx.drawImage(source, 0, 0, scaledWidth, scaledHeight)

      // Create smaller canvas for blurhash
      const blurCanvas = document.createElement('canvas')
      const blurCtx = blurCanvas.getContext('2d')
      if (!blurCtx) {
        throw new Error('Failed to get blur canvas context')
      }
      const blurWidth = 100
      const blurHeight = Math.round((scaledHeight / scaledWidth) * blurWidth)

      blurCanvas.width = blurWidth
      blurCanvas.height = blurHeight
      blurCtx.drawImage(source, 0, 0, blurWidth, blurHeight)

      const blurImageData = blurCtx.getImageData(0, 0, blurWidth, blurHeight)
      const blurHash = encode(
        new Uint8ClampedArray(blurImageData.data),
        blurWidth,
        blurHeight,
        4,
        4,
      )
      const thumbBlob = await new Promise<Blob>((res, rej) =>
        canvas.toBlob(
          (b) => (b ? res(b) : rej(new Error('Failed to create blob'))),
          'image/jpeg',
        ),
      )
      const thumbBuffer = await thumbBlob.arrayBuffer()
      return {
        thumbnail: thumbBuffer,
        blurHash,
        width: scaledWidth,
        height: scaledHeight,
        size: thumbBuffer.byteLength,
        mimeType: thumbBlob.type,
      }
    }

    const loadMedia = <T extends HTMLImageElement | HTMLVideoElement>(
      element: T,
      url: string,
    ): Promise<T> =>
      new Promise((resolve, reject) => {
        element.crossOrigin = 'Anonymous'
        element.onerror = () => reject(new Error('Failed to load media'))
        element.src = url
        if (element instanceof HTMLVideoElement) {
          element.muted = true
          element.onloadedmetadata = () => {
            element.currentTime = Math.min(
              1,
              Math.max(0, element.duration - 0.1),
            )
          }
          element.onseeked = () => resolve(element as T)
        } else {
          element.onload = () => resolve(element)
        }
      })

    if (mimeType.startsWith('image')) {
      const img = await loadMedia(new Image(), url)
      return drawAndEncode(img, img.width, img.height)
    }
    if (mimeType.startsWith('video')) {
      const video = await loadMedia(document.createElement('video'), url)
      return drawAndEncode(video, video.videoWidth, video.videoHeight)
    }
    throw new Error(`Unsupported MIME type: ${mimeType}`)
  }
}
