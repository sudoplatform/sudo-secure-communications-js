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
 * Input for `EditPollUseCase`.
 *
 * @interface EditPollUseCaseInput
 */
interface EditPollUseCaseInput {
  handleId: HandleId
  recipient: Recipient
  pollId: string
  type: PollTypeEntity
  question: string
  answers: string[]
  maxSelections: number
}

/**
 * Application business logic for editing an existing poll.
 */
export class EditPollUseCase {
  private readonly log: Logger

  public constructor(private readonly sessionManager: SessionManager) {
    this.log = new DefaultLogger(this.constructor.name)
  }

  async execute(input: EditPollUseCaseInput): Promise<void> {
    this.log.debug(this.constructor.name, {
      input,
    })
    await this.editPoll(input)
  }

  private async editPoll(input: EditPollUseCaseInput): Promise<void> {
    {
      const matrixClient = await this.sessionManager.getMatrixClient(
        input.handleId,
      )
      const matrixMessagingService = new MatrixMessagingService(matrixClient)
      await matrixMessagingService.editPoll({
        recipient: input.recipient,
        pollId: input.pollId,
        type: input.type,
        question: input.question,
        answers: input.answers,
        maxSelections: input.maxSelections,
      })
    }
  }
}
