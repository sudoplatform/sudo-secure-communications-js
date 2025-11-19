/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { DefaultLogger, Logger } from '@sudoplatform/sudo-common'
import { ChannelId, HandleId } from '../../../../public'
import { MatrixRoomsService } from '../../../data/rooms/matrixRoomsService'
import { SessionManager } from '../../../data/session/sessionManager'
import { delay } from '../../../util/delay'

/**
 * Input for `WithdrawInvitationUseCase`.
 *
 * @interface WithdrawInvitationUseCaseInput
 */
interface WithdrawInvitationUseCaseInput {
  handleId: HandleId
  channelId: ChannelId
  targetHandleId: HandleId
}

/**
 * Application business logic for withdrawing an invitation to join a channel.
 */
export class WithdrawInvitationUseCase {
  private readonly log: Logger

  public constructor(private readonly sessionManager: SessionManager) {
    this.log = new DefaultLogger(this.constructor.name)
  }

  async execute(input: WithdrawInvitationUseCaseInput): Promise<void> {
    this.log.debug(this.constructor.name, {
      input,
    })
    await this.withdrawInvitation(input)
    // Delay to allow room members to be updated by matrix
    await delay(3000)
  }

  private async withdrawInvitation(
    input: WithdrawInvitationUseCaseInput,
  ): Promise<void> {
    {
      const matrixClient = await this.sessionManager.getMatrixClient(
        input.handleId,
      )
      const matrixRoomsService = new MatrixRoomsService(matrixClient)
      await matrixRoomsService.kickHandle({
        roomId: input.channelId.toString(),
        targetHandleId: input.targetHandleId.toString(),
      })
    }
  }
}
