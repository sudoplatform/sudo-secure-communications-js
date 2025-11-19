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
 * Input for `MarkAsReadUseCase`.
 *
 * @interface MarkAsReadUseCaseInput
 */
interface MarkAsReadUseCaseInput {
  handleId: HandleId
  recipient: Recipient
}

/**
 * Application business logic for marking messages from a recipient as read.
 */
export class MarkAsReadUseCase {
  private readonly log: Logger

  public constructor(private readonly sessionManager: SessionManager) {
    this.log = new DefaultLogger(this.constructor.name)
  }

  async execute(input: MarkAsReadUseCaseInput): Promise<void> {
    this.log.debug(this.constructor.name, {
      input,
    })
    await this.markAsRead(input)
  }

  private async markAsRead(input: MarkAsReadUseCaseInput): Promise<void> {
    {
      const matrixClient = await this.sessionManager.getMatrixClient(
        input.handleId,
      )
      const matrixMessagingService = new MatrixMessagingService(matrixClient)
      await matrixMessagingService.markAsRead({ recipient: input.recipient })
    }
  }
}
