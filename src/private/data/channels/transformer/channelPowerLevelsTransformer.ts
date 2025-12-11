/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  SecureCommsChannelPowerLevelsInput,
  SecureCommsNamedPowerLevelInput,
} from '../../../../gen/graphqlTypes'
import {
  ChannelPermissionsEntity,
  ChannelPermissionsInputEntity,
  ChannelRoleEntity,
} from '../../../domain/entities/channels/channelEntity'
import { PowerLevelsEntity } from '../../../domain/entities/common/powerLevelsEntity'
import { RoomEntity } from '../../../domain/entities/rooms/roomEntity'

export class ChannelPowerLevelsTransformer {
  fromEntityToPowerLevel(role: ChannelRoleEntity): number {
    switch (role) {
      case ChannelRoleEntity.ADMIN:
        return 100
      case ChannelRoleEntity.MODERATOR:
        return 50
      case ChannelRoleEntity.PARTICIPANT:
        return 25
      case ChannelRoleEntity.REACT_ONLY_PARTICIPANT:
        return 10
    }
  }

  fromPowerLevelToEntity(powerLevel: number): ChannelRoleEntity {
    switch (true) {
      case powerLevel >= 100:
        return ChannelRoleEntity.ADMIN
      case powerLevel >= 50:
        return ChannelRoleEntity.MODERATOR
      case powerLevel >= 25:
        return ChannelRoleEntity.PARTICIPANT
      default:
        return ChannelRoleEntity.REACT_ONLY_PARTICIPANT
    }
  }

  fromEntityToGraphQLInput(
    entity: PowerLevelsEntity,
  ): SecureCommsChannelPowerLevelsInput {
    return {
      ban: entity.ban,
      events: entity.events
        ? this.toNamedPowerLevels(entity.events)
        : undefined,
      eventsDefault: entity.eventsDefault,
      invite: entity.invite,
      kick: entity.kick,
      notifications: undefined,
      redact: entity.redact,
      stateDefault: undefined,
      users: undefined,
      usersDefault: entity.usersDefault,
    }
  }

  toNamedPowerLevels(
    event: Record<string, number>,
  ): SecureCommsNamedPowerLevelInput[] {
    return Object.entries(event).map(([key, value]) => ({
      id: key,
      powerLevel: value,
    }))
  }

  toInitialPowerLevels(
    channelPermissions: ChannelPermissionsInputEntity,
    usersDefault: ChannelRoleEntity,
  ): PowerLevelsEntity {
    const defaultPermissions = ChannelPermissionsEntity.default
    const powerLevels: PowerLevelsEntity = {
      usersDefault: this.fromEntityToPowerLevel(usersDefault),
      eventsDefault: this.fromEntityToPowerLevel(
        channelPermissions.sendMessages ?? defaultPermissions.sendMessages,
      ),
      invite: this.fromEntityToPowerLevel(
        channelPermissions.inviteHandles ?? defaultPermissions.inviteHandles,
      ),
      kick: this.fromEntityToPowerLevel(
        channelPermissions.kickHandles ?? defaultPermissions.kickHandles,
      ),
      ban: this.fromEntityToPowerLevel(
        channelPermissions.banHandles ?? defaultPermissions.banHandles,
      ),
      redact: this.fromEntityToPowerLevel(
        channelPermissions.deleteOthersMessages ??
          defaultPermissions.deleteOthersMessages,
      ),
      events: {
        'm.room.name': this.fromEntityToPowerLevel(
          channelPermissions.changeChannelName ??
            defaultPermissions.changeChannelName,
        ),
        'm.room.topic': this.fromEntityToPowerLevel(
          channelPermissions.changeChannelDescription ??
            defaultPermissions.changeChannelDescription,
        ),
        'm.room.avatar': this.fromEntityToPowerLevel(
          channelPermissions.changeChannelAvatar ??
            defaultPermissions.changeChannelAvatar,
        ),
        'm.reaction': this.fromEntityToPowerLevel(
          ChannelRoleEntity.REACT_ONLY_PARTICIPANT,
        ),
        'm.room.redaction': this.fromEntityToPowerLevel(
          ChannelRoleEntity.REACT_ONLY_PARTICIPANT,
        ),
      },
    }
    return powerLevels
  }

  toPowerLevelsMap(
    rooms: RoomEntity[],
  ): Map<string, { permissions: any; defaultMemberRole: any }> {
    const powerLevelsMap = new Map<
      string,
      {
        permissions: ChannelPermissionsInputEntity
        defaultMemberRole: ChannelRoleEntity
      }
    >()
    for (const room of rooms) {
      const { roomId, powerLevels } = room
      if (powerLevels) {
        const permissions: ChannelPermissionsInputEntity = {
          sendMessages: this.fromPowerLevelToEntity(
            powerLevels.events_default ?? 25,
          ),
          inviteHandles: this.fromPowerLevelToEntity(powerLevels.invite ?? 25),
          kickHandles: this.fromPowerLevelToEntity(powerLevels.kick ?? 50),
          banHandles: this.fromPowerLevelToEntity(powerLevels.ban ?? 50),
          changeChannelName: this.fromPowerLevelToEntity(
            powerLevels.events?.['m.room.name'] ?? 50,
          ),
          changeChannelDescription: this.fromPowerLevelToEntity(
            powerLevels.events?.['m.room.topic'] ?? 50,
          ),
          changeChannelAvatar: this.fromPowerLevelToEntity(
            powerLevels.events?.['m.room.avatar'] ?? 50,
          ),
          deleteOthersMessages: this.fromPowerLevelToEntity(
            powerLevels.redact ?? 50,
          ),
        }
        const defaultMemberRole = this.fromPowerLevelToEntity(
          powerLevels.users_default ?? 25,
        )
        powerLevelsMap.set(roomId, { permissions, defaultMemberRole })
      }
    }
    return powerLevelsMap
  }
}
