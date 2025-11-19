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

/**
 * Input for `DeclineInvitationUseCase`.
 *
 * @interface DeclineInvitationUseCaseInput
 */
interface DeclineInvitationUseCaseInput {
  handleId: HandleId
  id: ChatId
}

/**
 * Application business logic for declining an invitation to join a direct chat.
 */
export class DeclineInvitationUseCase {
  private readonly log: Logger

  public constructor(private readonly sessionManager: SessionManager) {
    this.log = new DefaultLogger(this.constructor.name)
  }

  async execute(input: DeclineInvitationUseCaseInput): Promise<void> {
    this.log.debug(this.constructor.name, {
      input,
    })
    await this.declineInvitation(input)
    // Delay to allow room members to be updated by matrix
    await delay(3000)
  }

  private async declineInvitation(
    input: DeclineInvitationUseCaseInput,
  ): Promise<void> {
    {
      const matrixClient = await this.sessionManager.getMatrixClient(
        input.handleId,
      )
      const matrixDirectChatsService = new MatrixDirectChatsService(
        matrixClient,
      )
      await matrixDirectChatsService.declineInvitation(input.id.toString())
    }
  }
}
