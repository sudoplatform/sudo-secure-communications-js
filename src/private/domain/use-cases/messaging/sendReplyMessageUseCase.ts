/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { DefaultLogger, Logger } from '@sudoplatform/sudo-common'
import { HandleId, Recipient } from '../../../../public'
import { MatrixMessagingService } from '../../../data/messaging/matrixMessagingService'
import { SessionManager } from '../../../data/session/sessionManager'
import { MessageMentionEntity } from '../../entities/messaging/messageEntity'

/**
 * Input for `SendReplyMessageUseCase`.
 *
 * @interface SendReplyMessageUseCaseInput
 */
interface SendReplyMessageUseCaseInput {
  handleId: HandleId
  recipient: Recipient
  message: string
  replyToMessageId: string
  mentions: MessageMentionEntity[]
  clientMessageDuration?: number
  serverMessageDuration?: number
}

/**
 * Application business logic for sending a reply message to a recipient.
 */
export class SendReplyMessageUseCase {
  private readonly log: Logger

  public constructor(private readonly sessionManager: SessionManager) {
    this.log = new DefaultLogger(this.constructor.name)
  }

  async execute(input: SendReplyMessageUseCaseInput): Promise<void> {
    this.log.debug(this.constructor.name, {
      input,
    })
    await this.sendReply(input)
  }

  private async sendReply(input: SendReplyMessageUseCaseInput): Promise<void> {
    {
      const matrixClient = await this.sessionManager.getMatrixClient(
        input.handleId,
      )
      const matrixMessagingService = new MatrixMessagingService(matrixClient)
      await matrixMessagingService.sendReply({
        recipient: input.recipient,
        message: input.message,
        replyToMessageId: input.replyToMessageId,
        mentions: input.mentions,
        clientMessageDuration: input.clientMessageDuration,
        serverMessageDuration: input.serverMessageDuration,
      })
    }
  }
}
