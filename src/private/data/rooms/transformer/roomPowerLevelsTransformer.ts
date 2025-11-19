/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { PowerLevelsEntity } from '../../../domain/entities/common/powerLevelsEntity'
import { RoomPowerLevelsEntity } from '../../../domain/entities/rooms/roomPowerLevelsEntity'

export class RoomPowerLevelsTransformer {
  fromEntityPowerLevelToRoomPowerLevel(
    powerLevel: PowerLevelsEntity,
  ): RoomPowerLevelsEntity {
    return {
      ban: powerLevel.ban,
      events: powerLevel.events,
      events_default: powerLevel.eventsDefault,
      invite: powerLevel.invite,
      kick: powerLevel.kick,
      redact: powerLevel.redact,
      users_default: powerLevel.usersDefault,
    }
  }
}
