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
    const invitedGroups = await this.listInvitedGroups(handleId)
    if (!invitedGroups.length) {
      return []
    }
    return invitedGroups
  }

  private async listInvitedGroups(handleId: HandleId): Promise<GroupEntity[]> {
    const matrixClient = await this.sessionManager.getMatrixClient(handleId)
    const matrixRoomsService = new MatrixRoomsService(matrixClient)
    const invitedRooms = await matrixRoomsService.listInvitedRooms()

    const invitedGroups: RoomEntity[] = []
    for (const room of invitedRooms) {
      const channel = await this.channelsService.get(room.roomId)
      if (channel) continue

      const group = await matrixClient.getRoom(room.roomId)
      if (!group) continue

      const isDirect = group
        .getMembers()
        .some(
          (member) =>
            member.events.member?.getContent()?.['is_direct'] === true,
        )
      if (!isDirect) {
        invitedGroups.push(room)
      }
    }
    const transformer = new GroupTransformer()
    return invitedGroups.map(transformer.fromRoomToEntity)
  }
}
