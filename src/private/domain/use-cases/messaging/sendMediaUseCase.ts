/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { DefaultLogger, Logger } from '@sudoplatform/sudo-common'
import { HandleId, Recipient, ThumbnailInfo } from '../../../../public'
import { S3Client } from '../../../data/common/s3Client'
import { MatrixMediaService } from '../../../data/media/matrixMediaService'
import { MediaCredentialManager } from '../../../data/media/mediaCredentialManager'
import { MatrixMessagingService } from '../../../data/messaging/matrixMessagingService'
import { SessionManager } from '../../../data/session/sessionManager'

/**
 * Input for `SendMediaUseCase`.
 *
 * @interface SendMediaUseCaseInput
 */
interface SendMediaUseCaseInput {
  handleId: HandleId
  recipient: Recipient
  file: ArrayBuffer
  fileName: string
  fileType: string
  fileSize: number
  thumbnail?: ArrayBuffer
  thumbnailInfo?: ThumbnailInfo
  threadId?: string
  replyToMessageId?: string
  clientMessageDuration?: number
  serverMessageDuration?: number
}

/**
 * Application business logic for sending a media message to a recipient.
 */
export class SendMediaUseCase {
  private readonly log: Logger

  public constructor(
    private readonly sessionManager: SessionManager,
    private readonly mediaCredentialManager: MediaCredentialManager,
  ) {
    this.log = new DefaultLogger(this.constructor.name)
  }

  async execute(input: SendMediaUseCaseInput): Promise<void> {
    this.log.debug(this.constructor.name, {
      input,
    })
    await this.sendMedia(input)
  }

  async sendMedia(input: SendMediaUseCaseInput): Promise<void> {
    const matrixClient = await this.sessionManager.getMatrixClient(
      input.handleId,
    )
    const mediaCredential =
      await this.mediaCredentialManager.getRoomMediaCredential(
        input.handleId,
        true,
        input.recipient.value,
      )
    const s3Client = new S3Client(mediaCredential)
    const matrixMediaService = new MatrixMediaService(matrixClient, s3Client)
    const matrixMessagingService = new MatrixMessagingService(
      matrixClient,
      matrixMediaService,
    )
    await matrixMessagingService.sendMedia({
      recipient: input.recipient,
      file: input.file,
      fileName: input.fileName,
      fileType: input.fileType,
      fileSize: input.fileSize,
      mediaCredential,
      thumbnail: input.thumbnail,
      thumbnailInfo: input.thumbnailInfo,
      threadId: input.threadId,
      replyToMessageId: input.replyToMessageId,
      clientMessageDuration: input.clientMessageDuration,
      serverMessageDuration: input.serverMessageDuration,
    })
  }
}
