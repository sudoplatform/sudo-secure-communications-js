/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { DefaultLogger, Logger } from '@sudoplatform/sudo-common'
import { HandleId, Recipient } from '../../../../public'
import { MatrixMessagingService } from '../../../data/messaging/matrixMessagingService'
import { SessionManager } from '../../../data/session/sessionManager'
import { RedactReasonEntity } from '../../entities/messaging/messageEntity'

/**
 * Input for `DeleteMessageUseCase`.
 *
 * @interface DeleteMessageUseCaseInput
 */
interface DeleteMessageUseCaseInput {
  handleId: HandleId
  recipient: Recipient
  messageId: string
  reason?: RedactReasonEntity
}

/**
 * Application business logic for deleting a message.
 */
export class DeleteMessageUseCase {
  private readonly log: Logger

  public constructor(private readonly sessionManager: SessionManager) {
    this.log = new DefaultLogger(this.constructor.name)
  }

  async execute(input: DeleteMessageUseCaseInput): Promise<void> {
    this.log.debug(this.constructor.name, {
      input,
    })
    await this.deleteMessage(input)
  }

  private async deleteMessage(input: DeleteMessageUseCaseInput): Promise<void> {
    {
      const matrixClient = await this.sessionManager.getMatrixClient(
        input.handleId,
      )
      const matrixMessagingService = new MatrixMessagingService(matrixClient)
      await matrixMessagingService.delete({
        recipient: input.recipient,
        messageId: input.messageId,
        reason: input.reason,
      })
    }
  }
}
