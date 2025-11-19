/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { GroupPowerLevelsTransformer } from './groupPowerLevelsTransformer'
import { GroupRoleTransformer } from './groupRoleTransformer'
import { GroupPermissions } from '../../../../public'
import { GroupPermissionsEntity } from '../../../domain/entities/groups/groupEntity'
import { RoomPowerLevelsEntity } from '../../../domain/entities/rooms/roomPowerLevelsEntity'

export class GroupPermissionsTransformer {
  fromEntityToAPI(entity: GroupPermissionsEntity): GroupPermissions {
    const groupRoleTransformer = new GroupRoleTransformer()
    return {
      sendMessages: groupRoleTransformer.fromEntityToAPI(entity.sendMessages),
      inviteHandles: groupRoleTransformer.fromEntityToAPI(entity.inviteHandles),
      kickHandles: groupRoleTransformer.fromEntityToAPI(entity.kickHandles),
      banHandles: groupRoleTransformer.fromEntityToAPI(entity.banHandles),
      changeGroupName: groupRoleTransformer.fromEntityToAPI(
        entity.changeGroupName,
      ),
      changeGroupDescription: groupRoleTransformer.fromEntityToAPI(
        entity.changeGroupDescription,
      ),
      changeGroupAvatar: groupRoleTransformer.fromEntityToAPI(
        entity.changeGroupAvatar,
      ),
      deleteOthersMessages: groupRoleTransformer.fromEntityToAPI(
        entity.deleteOthersMessages,
      ),
    }
  }

  fromRoomPermissionsEntityToGroupPermissionsEntity(
    roomPowerLevels: RoomPowerLevelsEntity,
  ): GroupPermissionsEntity {
    const groupPowerLevelsTransformer = new GroupPowerLevelsTransformer()
    return new GroupPermissionsEntity(
      roomPowerLevels.events_default
        ? groupPowerLevelsTransformer.fromPowerLevelToEntity(
            roomPowerLevels.events_default,
          )
        : GroupPermissionsEntity.default.sendMessages,
      roomPowerLevels.invite
        ? groupPowerLevelsTransformer.fromPowerLevelToEntity(
            roomPowerLevels.invite,
          )
        : GroupPermissionsEntity.default.inviteHandles,
      roomPowerLevels.kick
        ? groupPowerLevelsTransformer.fromPowerLevelToEntity(
            roomPowerLevels.kick,
          )
        : GroupPermissionsEntity.default.kickHandles,
      roomPowerLevels.ban
        ? groupPowerLevelsTransformer.fromPowerLevelToEntity(
            roomPowerLevels.ban,
          )
        : GroupPermissionsEntity.default.banHandles,
      roomPowerLevels.events
        ? groupPowerLevelsTransformer.fromPowerLevelToEntity(
            roomPowerLevels.events['m.room.name'],
          )
        : GroupPermissionsEntity.default.changeGroupName,
      roomPowerLevels.events
        ? groupPowerLevelsTransformer.fromPowerLevelToEntity(
            roomPowerLevels.events['m.room.topic'],
          )
        : GroupPermissionsEntity.default.changeGroupDescription,
      roomPowerLevels.events
        ? groupPowerLevelsTransformer.fromPowerLevelToEntity(
            roomPowerLevels.events['m.room.avatar'],
          )
        : GroupPermissionsEntity.default.changeGroupAvatar,
      roomPowerLevels.redact
        ? groupPowerLevelsTransformer.fromPowerLevelToEntity(
            roomPowerLevels.redact,
          )
        : GroupPermissionsEntity.default.deleteOthersMessages,
    )
  }
}
