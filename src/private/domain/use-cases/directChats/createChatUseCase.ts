/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { DefaultLogger, Logger } from '@sudoplatform/sudo-common'
import { ChatId, HandleId } from '../../../../public'
import { MatrixDirectChatsService } from '../../../data/directChats/matrixDirectChatsService'
import { SessionManager } from '../../../data/session/sessionManager'
import { delay } from '../../../util/delay'
import { toChatId } from '../../../util/id'

/**
 * Input for `CreateChatUseCase`.
 *
 * @interface CreateChatUseCaseInput
 */
interface CreateChatUseCaseInput {
  handleId: HandleId
  handleIdToChatTo: HandleId
}

/**
 * Application business logic for creating a new chat between handles.
 */
export class CreateChatUseCase {
  private readonly log: Logger

  public constructor(private readonly sessionManager: SessionManager) {
    this.log = new DefaultLogger(this.constructor.name)
  }

  async execute(input: CreateChatUseCaseInput): Promise<ChatId> {
    this.log.debug(this.constructor.name, {
      input,
    })
    const result = await this.createChat(input)
    // Delay to allow new chat to be fully returned by matrix
    await delay(3000)
    return result
  }

  private async createChat(input: CreateChatUseCaseInput): Promise<ChatId> {
    {
      const matrixClient = await this.sessionManager.getMatrixClient(
        input.handleId,
      )
      const matrixDirectChatService = new MatrixDirectChatsService(matrixClient)
      const roomId = await matrixDirectChatService.create(
        input.handleIdToChatTo.toString(),
      )
      return toChatId(roomId)
    }
  }
}
