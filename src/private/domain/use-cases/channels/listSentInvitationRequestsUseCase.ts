/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { DefaultLogger, Logger } from '@sudoplatform/sudo-common'
import { processChannelsResult } from './getChannelsUseCase'
import { HandleId } from '../../../../public'
import { MatrixRoomsService } from '../../../data/rooms/matrixRoomsService'
import { SessionManager } from '../../../data/session/sessionManager'
import { ChannelEntity } from '../../entities/channels/channelEntity'
import { ChannelsService } from '../../entities/channels/channelsService'

/**
 * Application business logic for listing all channels the handle has sent an invitaton request for.
 */
export class ListSentInvitationRequestsUseCase {
  private readonly log: Logger

  public constructor(
    private readonly channelsService: ChannelsService,
    private readonly sessionManager: SessionManager,
  ) {
    this.log = new DefaultLogger(this.constructor.name)
  }

  async execute(handleId: HandleId): Promise<ChannelEntity[]> {
    this.log.debug(this.constructor.name)
    const knockedRoomIds = await this.listSentInvitationRequests(handleId)
    if (!knockedRoomIds.length) {
      return []
    }
    const result = await this.channelsService.list(knockedRoomIds)
    return await processChannelsResult(result, this.channelsService, this.log)
  }

  private async listSentInvitationRequests(
    handleId: HandleId,
  ): Promise<string[]> {
    const matrixClient = await this.sessionManager.getMatrixClient(handleId)
    const matrixRoomsService = new MatrixRoomsService(matrixClient)
    const knockedRooms = await matrixRoomsService.listKnockedRooms()
    return knockedRooms.map((room) => room.roomId)
  }
}
