/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { DefaultLogger, Logger } from '@sudoplatform/sudo-common'
import { ChannelId, HandleId } from '../../../../public'
import { MatrixRoomsService } from '../../../data/rooms/matrixRoomsService'
import { SessionManager } from '../../../data/session/sessionManager'

/**
 * Input for `SendInvitationRequestUseCase`.
 *
 * @interface SendInvitationRequestUseCaseInput
 */
interface SendInvitationRequestUseCaseInput {
  handleId: HandleId
  channelId: ChannelId
  reason?: string
}

/**
 * Application business logic for sending invitation requests to join a channel.
 */
export class SendInvitationRequestUseCase {
  private readonly log: Logger

  public constructor(private readonly sessionManager: SessionManager) {
    this.log = new DefaultLogger(this.constructor.name)
  }

  async execute(input: SendInvitationRequestUseCaseInput): Promise<void> {
    this.log.debug(this.constructor.name, {
      input,
    })
    await this.sendInvitationRequest(input)
  }

  private async sendInvitationRequest(
    input: SendInvitationRequestUseCaseInput,
  ): Promise<void> {
    {
      const matrixClient = await this.sessionManager.getMatrixClient(
        input.handleId,
      )
      const matrixRoomsService = new MatrixRoomsService(matrixClient)
      await matrixRoomsService.knockRoom({
        roomId: input.channelId.toString(),
        reason: input.reason,
      })
    }
  }
}
