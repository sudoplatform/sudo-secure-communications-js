/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { DefaultLogger, Logger } from '@sudoplatform/sudo-common'
import { HandleId, Recipient } from '../../../../public'
import { MatrixMessagingService } from '../../../data/messaging/matrixMessagingService'
import { SessionManager } from '../../../data/session/sessionManager'
import { ChatSummaryEntity } from '../../entities/messaging/chatSummaryEntity'

/**
 * Input for `GetChatSummariesUseCase`.
 *
 * @interface GetChatSummariesUseCaseInput
 */
interface GetChatSummariesUseCaseInput {
  handleId: HandleId
  recipients: Recipient[]
}

/**
 * Application business logic for retrieving chat summaries for multiple recipients.
 */
export class GetChatSummariesUseCase {
  private readonly log: Logger

  public constructor(private readonly sessionManager: SessionManager) {
    this.log = new DefaultLogger(this.constructor.name)
  }

  async execute(
    input: GetChatSummariesUseCaseInput,
  ): Promise<ChatSummaryEntity[]> {
    this.log.debug(this.constructor.name, {
      input,
    })
    return await this.getChatSummaries(input)
  }

  private async getChatSummaries(
    input: GetChatSummariesUseCaseInput,
  ): Promise<ChatSummaryEntity[]> {
    {
      const matrixClient = await this.sessionManager.getMatrixClient(
        input.handleId,
      )
      const matrixMessagingService = new MatrixMessagingService(matrixClient)
      return await matrixMessagingService.getChatSummaries({
        recipients: input.recipients,
      })
    }
  }
}
