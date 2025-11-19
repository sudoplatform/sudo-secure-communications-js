/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { DefaultLogger, Logger } from '@sudoplatform/sudo-common'
import { HandleId } from '../../../../public'
import { SecureCommsServiceConfig } from '../../../data/common/config'
import { S3Client } from '../../../data/common/s3Client'
import { MatrixMediaService } from '../../../data/media/matrixMediaService'
import { MediaCredentialManager } from '../../../data/media/mediaCredentialManager'
import { SessionManager } from '../../../data/session/sessionManager'
import { extractPublicMediaType, extractRoomId } from '../../../util/mediaUtil'
import { FileEncryptionInfoEntity } from '../../entities/media/fileEncryptionInfoEntity'
import {
  MediaCredentialEntity,
  PublicMediaType,
} from '../../entities/media/mediaCredentialEntity'

/**
 * Input for `DownloadMediaFileUseCase`.
 *
 * @interface DownloadMediaFileUseCaseInput
 */
export interface DownloadMediaFileUseCaseInput {
  handleId: HandleId
  uri: string
  filename?: string
  encryptionInfo?: FileEncryptionInfoEntity
}

/**
 * Application business logic for downloading a media file.
 */
export class DownloadMediaFileUseCase {
  private readonly log: Logger

  public constructor(
    private readonly sessionManager: SessionManager,
    private readonly mediaCredentialManager: MediaCredentialManager,
    private readonly secureCommsServiceConfig: SecureCommsServiceConfig,
  ) {
    this.log = new DefaultLogger(this.constructor.name)
  }

  async execute(input: DownloadMediaFileUseCaseInput): Promise<ArrayBuffer> {
    this.log.debug(this.constructor.name, {
      input,
    })
    return await this.downloadMediaFile(input)
  }

  private async downloadMediaFile(
    input: DownloadMediaFileUseCaseInput,
  ): Promise<ArrayBuffer> {
    const matrixClient = await this.sessionManager.getMatrixClient(
      input.handleId,
    )
    const mediaCredential = await this.getMediaCredential(
      input.handleId,
      input.uri,
    )
    const s3Client = new S3Client(mediaCredential)
    const matrixMediaService = new MatrixMediaService(matrixClient, s3Client)
    return await matrixMediaService.downloadMediaFile({
      uri: input.uri,
      filename: input.filename,
      encryptionInfo: input.encryptionInfo,
      mediaCredential,
    })
  }

  private async getMediaCredential(
    handleId: HandleId,
    uri: string,
  ): Promise<MediaCredentialEntity> {
    const config = this.secureCommsServiceConfig
    if (uri.includes(config.roomMediaBucket)) {
      // Private room media in S3
      const roomId = extractRoomId(uri, config.homeServer)
      const credential =
        await this.mediaCredentialManager.getRoomMediaCredential(
          handleId,
          false,
          roomId,
        )
      return credential
    }
    if (uri.includes(config.publicMediaBucket)) {
      // Public avatar or other media in S3
      const publicMediaType = extractPublicMediaType(uri)
      const credential =
        await this.mediaCredentialManager.getPublicMediaCredential(
          false,
          publicMediaType,
        )
      return credential
    }
    // Legacy media with homeserver mxc paths. Assumed to be migrated to public bucket under the /media prefix
    const credential =
      await this.mediaCredentialManager.getPublicMediaCredential(
        false,
        PublicMediaType.MEDIA,
      )
    return credential
  }
}
