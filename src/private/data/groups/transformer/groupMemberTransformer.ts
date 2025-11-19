/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { GroupPowerLevelsTransformer } from './groupPowerLevelsTransformer'
import { GroupRoleTransformer } from './groupRoleTransformer'
import { GroupMember } from '../../../../public'
import {
  GroupMemberEntity,
  RoomMemberEntity,
} from '../../../domain/entities/common/memberEntity'
import { MembershipStateTransformer } from '../../common/transformer/membershipStateTransformer'

export class GroupMemberTransformer {
  fromEntityToAPI(entity: GroupMemberEntity): GroupMember {
    const membershipStateTransformer = new MembershipStateTransformer()
    const groupRoleTransformer = new GroupRoleTransformer()
    return {
      handle: entity.handle,
      membership: membershipStateTransformer.fromEntityToAPI(entity.membership),
      role: groupRoleTransformer.fromEntityToAPI(entity.role),
    }
  }

  fromRoomToEntity(entity: RoomMemberEntity): GroupMemberEntity {
    const powerLevelsTransformer = new GroupPowerLevelsTransformer()
    return {
      handle: entity.handle,
      membership: entity.membership,
      role: powerLevelsTransformer.fromPowerLevelToEntity(entity.powerLevel),
    }
  }
}
