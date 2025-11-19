/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { DefaultLogger, Logger } from '@sudoplatform/sudo-common'
import { HandleId, Recipient } from '../../../../public'
import { MatrixMessagingService } from '../../../data/messaging/matrixMessagingService'
import { SessionManager } from '../../../data/session/sessionManager'

/**
 * Input for `SendTypingNotificationUseCase`.
 *
 * @interface SendTypingNotificationUseCaseInput
 */
interface SendTypingNotificationUseCaseInput {
  handleId: HandleId
  recipient: Recipient
  isTyping: boolean
}

/**
 * Application business logic for sending a typing notification to a recipient.
 */
export class SendTypingNotificationUseCase {
  private readonly log: Logger

  public constructor(private readonly sessionManager: SessionManager) {
    this.log = new DefaultLogger(this.constructor.name)
  }

  async execute(input: SendTypingNotificationUseCaseInput): Promise<void> {
    this.log.debug(this.constructor.name, {
      input,
    })
    await this.sendTypingNotification(input)
  }

  private async sendTypingNotification(
    input: SendTypingNotificationUseCaseInput,
  ): Promise<void> {
    {
      const matrixClient = await this.sessionManager.getMatrixClient(
        input.handleId,
      )
      const matrixMessagingService = new MatrixMessagingService(matrixClient)
      await matrixMessagingService.sendTypingNotification({
        recipient: input.recipient,
        isTyping: input.isTyping,
      })
    }
  }
}
