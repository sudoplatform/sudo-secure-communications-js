/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { GroupPermissionsTransformer } from './groupPermissionsTransformer'
import { Group, GroupId } from '../../../../public'
import { GroupEntity } from '../../../domain/entities/groups/groupEntity'
import { RoomEntity } from '../../../domain/entities/rooms/roomEntity'

export class GroupTransformer {
  fromEntityToAPI(entity: GroupEntity): Group {
    const groupPermissionsTransformer = new GroupPermissionsTransformer()
    return {
      groupId: entity.groupId,
      name: entity.name,
      description: entity.description,
      avatarUrl: entity.avatarUrl,
      permissions: entity.permissions
        ? groupPermissionsTransformer.fromEntityToAPI(entity.permissions)
        : undefined,
      memberCount: entity.memberCount,
    }
  }

  fromRoomToEntity(entity: RoomEntity): GroupEntity {
    const groupPermissionsTransformer = new GroupPermissionsTransformer()
    return {
      groupId: new GroupId(entity.roomId),
      name: entity.name,
      description: entity.description,
      avatarUrl: entity.avatarUrl,
      permissions: entity.powerLevels
        ? groupPermissionsTransformer.fromRoomPermissionsEntityToGroupPermissionsEntity(
            entity.powerLevels,
          )
        : undefined,
      memberCount: entity.memberCount,
    }
  }
}
