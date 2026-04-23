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
 * Input for `MarkAsUnreadUseCase`.
 *
 * @interface MarkAsUnreadUseCaseInput
 */
interface MarkAsUnreadUseCaseInput {
  handleId: HandleId
  recipient: Recipient
}

/**
 * Application business logic for marking messages from a recipient as unread.
 */
export class MarkAsUnreadUseCase {
  private readonly log: Logger

  public constructor(private readonly sessionManager: SessionManager) {
    this.log = new DefaultLogger(this.constructor.name)
  }

  async execute(input: MarkAsUnreadUseCaseInput): Promise<void> {
    this.log.debug(this.constructor.name, {
      input,
    })
    await this.markAsUnread(input)
  }

  private async markAsUnread(input: MarkAsUnreadUseCaseInput): Promise<void> {
    {
      const matrixClient = await this.sessionManager.getMatrixClient(
        input.handleId,
      )
      const matrixMessagingService = new MatrixMessagingService(matrixClient)
      await matrixMessagingService.markAsUnread({ recipient: input.recipient })
    }
  }
}
