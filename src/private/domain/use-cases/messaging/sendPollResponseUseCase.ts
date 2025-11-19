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
 * Input for `SendPollResponseUseCase`.
 *
 * @interface SendPollResponseUseCaseInput
 */
interface SendPollResponseUseCaseInput {
  handleId: HandleId
  recipient: Recipient
  pollId: string
  answers: string[]
}

/**
 * Application business logic for sending a response to a poll.
 */
export class SendPollResponseUseCase {
  private readonly log: Logger

  public constructor(private readonly sessionManager: SessionManager) {
    this.log = new DefaultLogger(this.constructor.name)
  }

  async execute(input: SendPollResponseUseCaseInput): Promise<void> {
    this.log.debug(this.constructor.name, {
      input,
    })
    await this.sendPollResponse(input)
  }

  private async sendPollResponse(
    input: SendPollResponseUseCaseInput,
  ): Promise<void> {
    {
      const matrixClient = await this.sessionManager.getMatrixClient(
        input.handleId,
      )
      const matrixMessagingService = new MatrixMessagingService(matrixClient)
      await matrixMessagingService.sendPollResponse({
        recipient: input.recipient,
        pollId: input.pollId,
        answers: input.answers,
      })
    }
  }
}
