/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { DefaultLogger, Logger } from '@sudoplatform/sudo-common'
import { HandleId, Recipient } from '../../../../public'
import { MatrixMessagingService } from '../../../data/messaging/matrixMessagingService'
import { SessionManager } from '../../../data/session/sessionManager'
import { PollResponsesEntity } from '../../entities/messaging/pollEntity'

/**
 * Input for `GetPollResponsesUseCase`.
 *
 * @interface GetPollResponsesUseCaseInput
 */
interface GetPollResponsesUseCaseInput {
  handleId: HandleId
  recipient: Recipient
  pollId: string
}

/**
 * Application business logic for tallying the responses for a poll.
 */
export class GetPollResponsesUseCase {
  private readonly log: Logger

  public constructor(private readonly sessionManager: SessionManager) {
    this.log = new DefaultLogger(this.constructor.name)
  }

  async execute(
    input: GetPollResponsesUseCaseInput,
  ): Promise<PollResponsesEntity> {
    this.log.debug(this.constructor.name, {
      input,
    })
    return await this.getPollResponses(input)
  }

  private async getPollResponses(
    input: GetPollResponsesUseCaseInput,
  ): Promise<PollResponsesEntity> {
    {
      const matrixClient = await this.sessionManager.getMatrixClient(
        input.handleId,
      )
      const matrixMessagingService = new MatrixMessagingService(matrixClient)
      return matrixMessagingService.getPollResponses({
        recipient: input.recipient,
        pollId: input.pollId,
      })
    }
  }
}
