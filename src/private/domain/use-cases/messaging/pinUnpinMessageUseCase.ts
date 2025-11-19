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
 * Input for `PinUnpinMessageUseCase`.
 *
 * @interface PinUnpinMessageUseCaseInput
 */
interface PinUnpinMessageUseCaseInput {
  handleId: HandleId
  recipient: Recipient
  messageId: string
}

/**
 * Application business logic to pin or unpin an existing message for a given recipient.
 * Depends on whether said message is already pinned.
 *
 * NOTE: This use case is used for both `messagingModule.pinMessage` and `messagingModule.unpinMessage`
 */
export class PinUnpinMessageUseCase {
  private readonly log: Logger

  public constructor(private readonly sessionManager: SessionManager) {
    this.log = new DefaultLogger(this.constructor.name)
  }

  async execute(input: PinUnpinMessageUseCaseInput): Promise<void> {
    this.log.debug(this.constructor.name, {
      input,
    })
    await this.pinUnpinMessage(input)
  }

  async pinUnpinMessage(input: PinUnpinMessageUseCaseInput): Promise<void> {
    const matrixClient = await this.sessionManager.getMatrixClient(
      input.handleId,
    )
    const matrixMessagingService = new MatrixMessagingService(matrixClient)
    await matrixMessagingService.pinUnpinMessage({
      recipient: input.recipient,
      messageId: input.messageId,
    })
  }
}
