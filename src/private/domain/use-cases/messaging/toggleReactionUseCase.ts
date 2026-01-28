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
 * Input for `ToggleReactionUseCase`.
 *
 * @interface ToggleReactionUseCaseInput
 */
interface ToggleReactionUseCaseInput {
  handleId: HandleId
  recipient: Recipient
  messageId: string
  content: string
  customFields?: Record<string, any>
}

/**
 * Application business logic for toggling a reaction on a message.
 */
export class ToggleReactionUseCase {
  private readonly log: Logger

  public constructor(private readonly sessionManager: SessionManager) {
    this.log = new DefaultLogger(this.constructor.name)
  }

  async execute(input: ToggleReactionUseCaseInput): Promise<void> {
    this.log.debug(this.constructor.name, {
      input,
    })
    await this.toggleReaction(input)
  }

  async toggleReaction(input: ToggleReactionUseCaseInput): Promise<void> {
    const matrixClient = await this.sessionManager.getMatrixClient(
      input.handleId,
    )
    const matrixMessagingService = new MatrixMessagingService(matrixClient)
    await matrixMessagingService.toggleReaction({
      recipient: input.recipient,
      messageId: input.messageId,
      content: input.content,
      customFields: input.customFields,
    })
  }
}
