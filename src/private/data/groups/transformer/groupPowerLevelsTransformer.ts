/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { InvalidArgumentError } from '../../../../public'
import { GroupRoleEntity } from '../../../domain/entities/groups/groupEntity'

export class GroupPowerLevelsTransformer {
  fromEntityToPowerLevel(role: GroupRoleEntity): number {
    switch (role) {
      case GroupRoleEntity.NOBODY:
        return 101
      case GroupRoleEntity.ADMIN:
        return 100
      case GroupRoleEntity.PARTICIPANT:
        return 25
    }
  }

  fromPowerLevelToEntity(powerLevel: number): GroupRoleEntity {
    switch (true) {
      case powerLevel == 101:
        return GroupRoleEntity.NOBODY
      case powerLevel >= 51 && powerLevel <= 100:
        return GroupRoleEntity.ADMIN
      case powerLevel >= 0 && powerLevel < 26:
        return GroupRoleEntity.PARTICIPANT
      default:
        throw new InvalidArgumentError('power level is out of range')
    }
  }
}
