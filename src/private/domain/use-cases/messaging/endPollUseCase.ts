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
 * Input for `EndPollUseCase`.
 *
 * @interface EndPollUseCaseInput
 */
interface EndPollUseCaseInput {
  handleId: HandleId
  recipient: Recipient
  pollId: string
}

/**
 * Application business logic for ending a poll.
 */
export class EndPollUseCase {
  private readonly log: Logger

  public constructor(private readonly sessionManager: SessionManager) {
    this.log = new DefaultLogger(this.constructor.name)
  }

  async execute(input: EndPollUseCaseInput): Promise<void> {
    this.log.debug(this.constructor.name, {
      input,
    })
    await this.endPoll(input)
  }

  private async endPoll(input: EndPollUseCaseInput): Promise<void> {
    {
      const matrixClient = await this.sessionManager.getMatrixClient(
        input.handleId,
      )
      const matrixMessagingService = new MatrixMessagingService(matrixClient)
      await matrixMessagingService.endPoll({
        recipient: input.recipient,
        pollId: input.pollId,
      })
    }
  }
}
