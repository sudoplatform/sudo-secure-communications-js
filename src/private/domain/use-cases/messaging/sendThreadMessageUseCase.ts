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
 * Input for `SendThreadMessageUseCase`.
 *
 * @interface SendThreadMessageUseCaseInput
 */
interface SendThreadMessageUseCaseInput {
  handleId: HandleId
  recipient: Recipient
  message: string
  threadId: string
  mentions: MessageMentionEntity[]
  clientMessageDuration?: number
  serverMessageDuration?: number
}

/**
 * Application business logic for sending a thread message to a recipient.
 */
export class SendThreadMessageUseCase {
  private readonly log: Logger

  public constructor(private readonly sessionManager: SessionManager) {
    this.log = new DefaultLogger(this.constructor.name)
  }

  async execute(input: SendThreadMessageUseCaseInput): Promise<void> {
    this.log.debug(this.constructor.name, {
      input,
    })
    await this.sendThread(input)
  }

  private async sendThread(
    input: SendThreadMessageUseCaseInput,
  ): Promise<void> {
    {
      const matrixClient = await this.sessionManager.getMatrixClient(
        input.handleId,
      )
      const matrixMessagingService = new MatrixMessagingService(matrixClient)
      await matrixMessagingService.sendThread({
        recipient: input.recipient,
        message: input.message,
        mentions: input.mentions,
        threadId: input.threadId,
        clientMessageDuration: input.clientMessageDuration,
        serverMessageDuration: input.serverMessageDuration,
      })
    }
  }
}
