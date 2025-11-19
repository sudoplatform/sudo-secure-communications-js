/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { FileEncryptionInfoEntity } from './fileEncryptionInfoEntity'
import { MediaCredentialEntity } from './mediaCredentialEntity'

/**
 * Input for `MediaService.uploadMediaFile` method.
 *
 * @interface UploadMediaFileInput
 * @property {ArrayBuffer} file The file to upload.
 * @property {string} fileName The name associated with the file to upload.
 * @property {string} fileType The MIME type of the file.
 * @property {MediaCredentialEntity} mediaCredential The media credential for granting client S3 bucket access.
 */
export interface UploadMediaFileInput {
  file: ArrayBuffer
  fileName: string
  fileType: string
  mediaCredential: MediaCredentialEntity
}

/**
 * Input for `MediaService.downloadMediaFile` method.
 *
 * @interface DownloadMediaFileInput
 * @property {string} uri URI of the media to download.
 * @property {string} filename The optional file name of the media.
 * @property {FileEncryptionInfoEntity} encryptionInfo The optional encryption material used to
 *  decrypt the media file.
 * @property {MediaCredentialEntity} mediaCredential The media credential for granting client S3 bucket access.
 */
export interface DownloadMediaFileInput {
  uri: string
  filename?: string
  encryptionInfo?: FileEncryptionInfoEntity
  mediaCredential: MediaCredentialEntity
}

/**
 * Core entity representation of a media service used in business logic.
 *
 * @interface MediaService
 */
export interface MediaService {
  /**
   * Upload a media file.
   *
   * @param {UploadMediaFileInput} input Parameters used to download a media file.
   * @returns {Promise<string>} The file containing the media as an array buffer.
   */
  uploadMediaFile(input: UploadMediaFileInput): Promise<string>

  /**
   * Download a media file.
   *
   * @param {DownloadMediaFileInput} input Parameters used to download a media file.
   * @returns {Promise<ArrayBuffer>} The file containing the media as an array buffer.
   */
  downloadMediaFile(input: DownloadMediaFileInput): Promise<ArrayBuffer>
}
