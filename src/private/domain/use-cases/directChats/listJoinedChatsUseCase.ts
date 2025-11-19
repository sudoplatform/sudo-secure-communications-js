/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { DefaultLogger, Logger } from '@sudoplatform/sudo-common'
import { HandleId } from '../../../../public'
import { MatrixDirectChatsService } from '../../../data/directChats/matrixDirectChatsService'
import { SessionManager } from '../../../data/session/sessionManager'
import { DirectChatEntity } from '../../entities/directChats/directChatEntity'

/**
 * Application business logic for listing all direct chats the handle has joined.
 */
export class ListJoinedChatsUseCase {
  private readonly log: Logger

  public constructor(private readonly sessionManager: SessionManager) {
    this.log = new DefaultLogger(this.constructor.name)
  }

  async execute(handleId: HandleId): Promise<DirectChatEntity[]> {
    this.log.debug(this.constructor.name, {
      handleId,
    })
    return await this.listJoinedChats(handleId)
  }

  private async listJoinedChats(
    handleId: HandleId,
  ): Promise<DirectChatEntity[]> {
    {
      const matrixClient = await this.sessionManager.getMatrixClient(handleId)
      const matrixDirectChatsService = new MatrixDirectChatsService(
        matrixClient,
      )
      return await matrixDirectChatsService.listJoined()
    }
  }
}
