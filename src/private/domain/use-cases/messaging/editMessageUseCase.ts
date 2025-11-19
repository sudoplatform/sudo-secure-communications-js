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
 * Input for `EditMessageUseCase`.
 *
 * @interface EditMessageUseCaseInput
 */
interface EditMessageUseCaseInput {
  handleId: HandleId
  recipient: Recipient
  messageId: string
  message: string
}

/**
 * Application business logic for editing a message.
 */
export class EditMessageUseCase {
  private readonly log: Logger

  public constructor(private readonly sessionManager: SessionManager) {
    this.log = new DefaultLogger(this.constructor.name)
  }

  async execute(input: EditMessageUseCaseInput): Promise<void> {
    this.log.debug(this.constructor.name, {
      input,
    })
    await this.editMessage(input)
  }

  private async editMessage(input: EditMessageUseCaseInput): Promise<void> {
    {
      const matrixClient = await this.sessionManager.getMatrixClient(
        input.handleId,
      )
      const matrixMessagingService = new MatrixMessagingService(matrixClient)
      await matrixMessagingService.edit({
        recipient: input.recipient,
        messageId: input.messageId,
        message: input.message,
      })
    }
  }
}
