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
import { GroupEntity } from '../../entities/groups/groupEntity'
import { CustomRoomType } from '../../entities/rooms/roomEntity'

/**
 * Application business logic for listing all groups the handle has joined.
 */
export class ListJoinedGroupsUseCase {
  private readonly log: Logger

  public constructor(private readonly sessionManager: SessionManager) {
    this.log = new DefaultLogger(this.constructor.name)
  }

  async execute(handleId: HandleId): Promise<GroupEntity[]> {
    this.log.debug(this.constructor.name, {
      handleId,
    })
    const joinedGroups = await this.listJoinedGroups(handleId)
    if (!joinedGroups.length) {
      return []
    }
    return joinedGroups
  }

  private async listJoinedGroups(handleId: HandleId): Promise<GroupEntity[]> {
    {
      const matrixClient = await this.sessionManager.getMatrixClient(handleId)
      const matrixRoomsService = new MatrixRoomsService(matrixClient)
      const joinedRoomIds = await matrixRoomsService.listJoinedRoomIds()
      if (!joinedRoomIds.length) {
        return []
      }
      const joinedRooms = await matrixRoomsService.list(joinedRoomIds)
      const joinedGroups = joinedRooms.filter(
        (room) => room.type === CustomRoomType.GROUP,
      )
      const transformer = new GroupTransformer()
      return joinedGroups.map(transformer.fromRoomToEntity)
    }
  }
}
