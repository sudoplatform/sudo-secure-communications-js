/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { DefaultLogger, Logger } from '@sudoplatform/sudo-common'
import { HandleId, Recipient } from '../../../../public'
import { S3Client } from '../../../data/common/s3Client'
import { MatrixMediaService } from '../../../data/media/matrixMediaService'
import { MediaCredentialManager } from '../../../data/media/mediaCredentialManager'
import { MatrixMessagingService } from '../../../data/messaging/matrixMessagingService'
import { SessionManager } from '../../../data/session/sessionManager'
import { MessageMentionEntity } from '../../entities/messaging/messageEntity'

/**
 * Input for `EditMediaCaptionUseCase`.
 *
 * @interface EditMediaCaptionUseCaseInput
 */
interface EditMediaCaptionUseCaseInput {
  handleId: HandleId
  recipient: Recipient
  messageId: string
  caption: string
  mentions?: MessageMentionEntity[]
}

/**
 * Application business logic for editing a caption for a media message to a recipient.
 */
export class EditMediaCaptionUseCase {
  private readonly log: Logger

  public constructor(
    private readonly sessionManager: SessionManager,
    private readonly mediaCredentialManager: MediaCredentialManager,
  ) {
    this.log = new DefaultLogger(this.constructor.name)
  }

  async execute(input: EditMediaCaptionUseCaseInput): Promise<void> {
    this.log.debug(this.constructor.name, {
      input,
    })
    await this.editMediaCaption(input)
  }

  async editMediaCaption(input: EditMediaCaptionUseCaseInput): Promise<void> {
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
    await matrixMessagingService.editMediaCaption({
      recipient: input.recipient,
      messageId: input.messageId,
      message: input.caption,
      mentions: input.mentions ?? [],
    })
  }
}
