/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { DefaultLogger, Logger } from '@sudoplatform/sudo-common'
import { HandleId } from '../../../../public'
import { MatrixRoomsService } from '../../../data/rooms/matrixRoomsService'
import { SessionManager } from '../../../data/session/sessionManager'
import { toHandleId } from '../../../util/id'
import { ChannelEntity } from '../../entities/channels/channelEntity'
import { ChannelsService } from '../../entities/channels/channelsService'

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
    return await this.listInvitedChannels(handleId)
  }

  private async listInvitedChannels(
    handleId: HandleId,
  ): Promise<ChannelEntity[]> {
    const matrixClient = await this.sessionManager.getMatrixClient(handleId)
    const matrixRoomsService = new MatrixRoomsService(matrixClient)
    const invitedRooms = await matrixRoomsService.listInvitedRooms()
    const userId = await matrixClient.getUserId()

    const roomIds = invitedRooms.map((room) => room.roomId)
    const channelsInfo = await this.channelsService.list(roomIds)
    const invitedChannels: ChannelEntity[] = []

    for (const invitedRoom of invitedRooms) {
      const channel = channelsInfo?.channels?.find(
        (channel) => invitedRoom.roomId === channel.channelId.toString(),
      )
      if (!channel) {
        continue
      }
      const room = await matrixClient.getRoom(invitedRoom.roomId)
      if (!room) {
        continue
      }
      const inviterUserId = room.getMember(userId)?.events.member?.getSender()
      const inviter = inviterUserId
        ? {
            handleId: toHandleId(inviterUserId),
            name: room.getMember(inviterUserId)?.name ?? '',
          }
        : undefined
      invitedChannels.push({
        ...channel,
        memberCount: invitedRoom.memberCount ?? 0,
        inviter: inviter,
      })
    }
    return invitedChannels
  }
}
