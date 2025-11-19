/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { DefaultLogger, Logger } from '@sudoplatform/sudo-common'
import { HandleId } from '../../../../public'
import { MatrixDirectChatsService } from '../../../data/directChats/matrixDirectChatsService'
import { SessionManager } from '../../../data/session/sessionManager'
import { DirectChatInvitationEntity } from '../../entities/directChats/directChatInvitationEntity'

/**
 * Application business logic for listing all invitations the handle has active to join direct chats.
 */
export class ListInvitationsUseCase {
  private readonly log: Logger

  public constructor(private readonly sessionManager: SessionManager) {
    this.log = new DefaultLogger(this.constructor.name)
  }

  async execute(handleId: HandleId): Promise<DirectChatInvitationEntity[]> {
    this.log.debug(this.constructor.name, {
      handleId,
    })
    return await this.listInvitations(handleId)
  }

  private async listInvitations(
    handleId: HandleId,
  ): Promise<DirectChatInvitationEntity[]> {
    {
      const matrixClient = await this.sessionManager.getMatrixClient(handleId)
      const matrixDirectChatsService = new MatrixDirectChatsService(
        matrixClient,
      )
      return await matrixDirectChatsService.listInvitations()
    }
  }
}
