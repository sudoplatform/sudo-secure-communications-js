/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { DefaultLogger, Logger } from '@sudoplatform/sudo-common'
import { ChannelId, HandleId } from '../../../../public'
import { MatrixRoomsService } from '../../../data/rooms/matrixRoomsService'
import { SessionManager } from '../../../data/session/sessionManager'
import { ChannelInvitationRequestEntity } from '../../entities/channels/channelInvitationRequestEntity'

/**
 * Input for `ListReceivedInvitationRequestsUseCase`.
 *
 * @interface ListReceivedInvitationRequestsUseCaseInput
 */
interface ListReceivedInvitationRequestsUseCaseInput {
  handleId: HandleId
  channelId: ChannelId
}

/**
 * Application business logic for listing all channel invitation requests received by a specific channel.
 */
export class ListReceivedInvitationRequestsUseCase {
  private readonly log: Logger

  public constructor(private readonly sessionManager: SessionManager) {
    this.log = new DefaultLogger(this.constructor.name)
  }

  async execute(
    input: ListReceivedInvitationRequestsUseCaseInput,
  ): Promise<ChannelInvitationRequestEntity[]> {
    this.log.debug(this.constructor.name, {
      input,
    })
    return await this.listKnockRequests(input)
  }

  private async listKnockRequests(
    input: ListReceivedInvitationRequestsUseCaseInput,
  ): Promise<ChannelInvitationRequestEntity[]> {
    {
      const matrixClient = await this.sessionManager.getMatrixClient(
        input.handleId,
      )
      const matrixRoomsService = new MatrixRoomsService(matrixClient)
      return await matrixRoomsService.listKnockRequests(
        input.channelId.toString(),
      )
    }
  }
}
