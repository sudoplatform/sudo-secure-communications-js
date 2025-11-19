/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { DefaultLogger, Logger } from '@sudoplatform/sudo-common'
import { SecureCommsServiceConfig } from '../../private/data/common/config'
import { MediaCredentialManager } from '../../private/data/media/mediaCredentialManager'
import { FileEncryptionInfoTransformer } from '../../private/data/media/transformer/fileEncryptionInfoTransformer'
import { SessionManager } from '../../private/data/session/sessionManager'
import { DownloadMediaFileUseCase } from '../../private/domain/use-cases/media/downloadMediaFileUseCase'
import { HandleId } from '../typings'
import { FileEncryptionInfo } from '../typings/fileEncryptionInfo'

/**
 * Input for downloading a media file.
 *
 * @interface DownloadMediaFileInput
 * @property {HandleId} handleId Identifier of the handle owned by this client.
 * @property {string} uri URI of the media to download.
 * @property {string} filename The optional file name of the media.
 * @property {FileEncryptionInfo} encryptionInfo The optional encryption material used to decrypt
 *  the media file.
 */
export interface DownloadMediaFileInput {
  handleId: HandleId
  uri: string
  filename?: string
  encryptionInfo?: FileEncryptionInfo
}

/**
 * Media management for the Secure Communications Service.
 */
export interface MediaModule {
  /**
   * Downloads media to a file. Use for downloading and sharing media, or for loading
   * animated media like GIFs to display.
   *
   * @param {DownloadMediaFileInput} input Parameters used to download a media file.
   * @returns {ArrayBuffer} The file containing the media as an array buffer.
   */
  downloadMediaFile(input: DownloadMediaFileInput): Promise<ArrayBuffer>
}

export class DefaultMediaModule implements MediaModule {
  private readonly log: Logger

  public constructor(
    private readonly sessionManager: SessionManager,
    private readonly mediaCredentialManager: MediaCredentialManager,
    private readonly secureCommsServiceConfig: SecureCommsServiceConfig,
  ) {
    this.log = new DefaultLogger(this.constructor.name)
  }

  public async downloadMediaFile(
    input: DownloadMediaFileInput,
  ): Promise<ArrayBuffer> {
    this.log.debug(this.downloadMediaFile.name, { input })
    const fileEncryptionInfoTransformer = new FileEncryptionInfoTransformer()
    const useCase = new DownloadMediaFileUseCase(
      this.sessionManager,
      this.mediaCredentialManager,
      this.secureCommsServiceConfig,
    )
    return await useCase.execute({
      handleId: input.handleId,
      uri: input.uri,
      filename: input.filename,
      encryptionInfo: input.encryptionInfo
        ? fileEncryptionInfoTransformer.fromAPIToEntity(input.encryptionInfo)
        : undefined,
    })
  }
}
