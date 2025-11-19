/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { DefaultLogger, Logger } from '@sudoplatform/sudo-common'
import { HandleId, Recipient } from '../../../../public'
import { MatrixMessagingService } from '../../../data/messaging/matrixMessagingService'
import { SessionManager } from '../../../data/session/sessionManager'
import { MessageEntity } from '../../entities/messaging/messageEntity'

/**
 * Input for `GetMessagesUseCase`.
 *
 * @interface GetMessagesUseCaseInput
 */
interface GetMessagesUseCaseInput {
  handleId: HandleId
  recipient: Recipient
  limit?: number | undefined
  nextToken?: string | undefined
}

/**
 * Output for `GetMessagesUseCase`.
 *
 * @interface GetMessagesUseCaseOutput
 */
interface GetMessagesUseCaseOutput {
  messages: MessageEntity[]
  nextToken?: string
}

/**
 * Application business logic for retrieving a list of messages for a recipient.
 */
export class GetMessagesUseCase {
  private readonly log: Logger

  public constructor(private readonly sessionManager: SessionManager) {
    this.log = new DefaultLogger(this.constructor.name)
  }

  async execute(
    input: GetMessagesUseCaseInput,
  ): Promise<GetMessagesUseCaseOutput> {
    this.log.debug(this.constructor.name, {
      input,
    })
    return await this.listMessages(input)
  }

  private async listMessages(
    input: GetMessagesUseCaseInput,
  ): Promise<GetMessagesUseCaseOutput> {
    const matrixClient = await this.sessionManager.getMatrixClient(
      input.handleId,
    )
    const matrixMessagingService = new MatrixMessagingService(matrixClient)
    const listOutput = await matrixMessagingService.list(input)
    return {
      messages: listOutput.messages,
      nextToken: listOutput.nextToken,
    }
  }
}
