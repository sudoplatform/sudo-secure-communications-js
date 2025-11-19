/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { DefaultLogger, Logger } from '@sudoplatform/sudo-common'
import { HandleId } from '../../../../public'
import { MatrixMessagingService } from '../../../data/messaging/matrixMessagingService'
import { SessionManager } from '../../../data/session/sessionManager'
import { SearchMessagesItemEntity } from '../../entities/messaging/messageEntity'

/**
 * Input for `SearchMessagesUseCase`.
 *
 * @interface SearchMessagesUseCaseInput
 */
interface SearchMessagesUseCaseInput {
  handleId: HandleId
  searchText: string
  limit?: number | undefined
  nextToken?: string | undefined
}

/**
 * Output for `SearchMessagesUseCase`.
 *
 * @interface SearchMessagesUseCaseOutput
 */
interface SearchMessagesUseCaseOutput {
  messages: SearchMessagesItemEntity[]
  nextToken?: string
}

/**
 * Application business logic for retrieving a list of messages from all
 * unencrypted rooms matching search keywords.
 */
export class SearchMessagesUseCase {
  private readonly log: Logger

  public constructor(private readonly sessionManager: SessionManager) {
    this.log = new DefaultLogger(this.constructor.name)
  }

  async execute(
    input: SearchMessagesUseCaseInput,
  ): Promise<SearchMessagesUseCaseOutput> {
    this.log.debug(this.constructor.name, {
      input,
    })
    return await this.searchMessages(input)
  }

  private async searchMessages(
    input: SearchMessagesUseCaseInput,
  ): Promise<SearchMessagesUseCaseOutput> {
    const matrixClient = await this.sessionManager.getMatrixClient(
      input.handleId,
    )
    const matrixMessagingService = new MatrixMessagingService(matrixClient)
    const listOutput = await matrixMessagingService.searchMessages({
      searchText: input.searchText,
      limit: input.limit,
      nextToken: input.nextToken,
    })
    return {
      messages: listOutput.messages,
      nextToken: listOutput.nextToken,
    }
  }
}
