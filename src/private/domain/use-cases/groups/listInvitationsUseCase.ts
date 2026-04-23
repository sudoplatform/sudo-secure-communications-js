/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { DefaultLogger, Logger } from '@sudoplatform/sudo-common'
import { HandleId } from '../../../../public'
import { GroupTransformer } from '../../../data/groups/transformer/groupTransformer'
import { MatrixRoomsService } from '../../../data/rooms/matrixRoomsService'
import { SessionManager } from '../../../data/session/sessionManager'
import { toHandleId } from '../../../util/id'
import { ChannelsService } from '../../entities/channels/channelsService'
import { GroupEntity } from '../../entities/groups/groupEntity'
import { RoomEntity } from '../../entities/rooms/roomEntity'

/**
 * Application business logic for listing all groups the handle has an active invitation for.
 */
export class ListInvitationsUseCase {
  private readonly log: Logger

  public constructor(
    private readonly sessionManager: SessionManager,
    private readonly channelsService: ChannelsService,
  ) {
    this.log = new DefaultLogger(this.constructor.name)
  }

  async execute(handleId: HandleId): Promise<GroupEntity[]> {
    this.log.debug(this.constructor.name, {
      handleId,
    })
    return await this.listInvitedGroups(handleId)
  }

  private async listInvitedGroups(handleId: HandleId): Promise<GroupEntity[]> {
    const matrixClient = await this.sessionManager.getMatrixClient(handleId)
    const matrixRoomsService = new MatrixRoomsService(matrixClient)
    const invitedRooms = await matrixRoomsService.listInvitedRooms()
    const userId = await matrixClient.getUserId()

    const roomIds = invitedRooms.map((room) => room.roomId)
    const channelsInfo = await this.channelsService.list(roomIds)
    const invitedGroups: RoomEntity[] = []

    for (const invitedRoom of invitedRooms) {
      const channel = channelsInfo?.channels?.find(
        (channel) => invitedRoom.roomId === channel.channelId.toString(),
      )
      if (channel) {
        continue
      }
      const room = await matrixClient.getRoom(invitedRoom.roomId)
      if (!room) {
        continue
      }
      const isDirect = room
        .getMembers()
        .some(
          (member) =>
            member.events.member?.getContent()?.['is_direct'] === true,
        )
      if (isDirect) {
        continue
      }
      const inviterUserId = room.getMember(userId)?.events.member?.getSender()

      const inviter = inviterUserId
        ? {
            handleId: toHandleId(inviterUserId),
            name: room.getMember(inviterUserId)?.name ?? '',
          }
        : undefined
      invitedGroups.push({ ...invitedRoom, inviter: inviter })
    }
    const transformer = new GroupTransformer()
    return invitedGroups.map(transformer.fromRoomToEntity)
  }
}
