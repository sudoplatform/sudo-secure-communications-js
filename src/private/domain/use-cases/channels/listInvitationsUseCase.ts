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
import { RoomEntity } from '../../entities/rooms/roomEntity'

/**
 * Application business logic for listing all channels the handle has an active invitation for.
 */
export class ListInvitationsUseCase {
  private readonly log: Logger

  public constructor(
    private readonly channelsService: ChannelsService,
    private readonly sessionManager: SessionManager,
  ) {
    this.log = new DefaultLogger(this.constructor.name)
  }

  async execute(handleId: HandleId): Promise<ChannelEntity[]> {
    this.log.debug(this.constructor.name, {
      handleId,
    })
    const rooms = await this.listInvitedChannels(handleId)
    if (!rooms.length) {
      return []
    }
    const roomIds = rooms.map((room) => room.roomId)
    const channelInfo = await this.channelsService.list(roomIds)
    channelInfo.channels = channelInfo.channels.map((channel) => ({
      ...channel,
      memberCount:
        rooms.find((room) => room.roomId === channel.channelId.toString())
          ?.memberCount ?? 0,
    }))
    return await processChannelsResult(
      channelInfo,
      this.channelsService,
      this.log,
    )
  }

  private async listInvitedChannels(handleId: HandleId): Promise<RoomEntity[]> {
    {
      const matrixClient = await this.sessionManager.getMatrixClient(handleId)
      const matrixRoomsService = new MatrixRoomsService(matrixClient)
      const rooms = await matrixRoomsService.listInvitedRooms()
      return rooms
    }
  }
}
