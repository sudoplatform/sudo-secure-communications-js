/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { DefaultLogger, Logger } from '@sudoplatform/sudo-common'
import { HandleId, Recipient } from '../../../../public/typings'
import { MatrixMessagingService } from '../../../data/messaging/matrixMessagingService'
import { SessionManager } from '../../../data/session/sessionManager'
import { PollTypeEntity } from '../../entities/messaging/pollEntity'

/**
 * Input for `CreatePollUseCase`.
 *
 * @interface CreatePollUseCaseInput
 */
interface CreatePollUseCaseInput {
  handleId: HandleId
  recipient: Recipient
  type: PollTypeEntity
  question: string
  answers: string[]
  maxSelections: number
}

/**
 * Application business logic for creating a poll.
 */
export class CreatePollUseCase {
  private readonly log: Logger

  public constructor(private readonly sessionManager: SessionManager) {
    this.log = new DefaultLogger(this.constructor.name)
  }

  async execute(input: CreatePollUseCaseInput): Promise<void> {
    this.log.debug(this.constructor.name, {
      input,
    })
    await this.createPoll(input)
  }

  private async createPoll(input: CreatePollUseCaseInput): Promise<void> {
    {
      const matrixClient = await this.sessionManager.getMatrixClient(
        input.handleId,
      )
      const matrixMessagingService = new MatrixMessagingService(matrixClient)
      await matrixMessagingService.createPoll({
        recipient: input.recipient,
        type: input.type,
        question: input.question,
        answers: input.answers,
        maxSelections: input.maxSelections,
      })
    }
  }
}
