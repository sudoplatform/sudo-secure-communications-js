/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { ChannelPowerLevelsTransformer } from './channelPowerLevelsTransformer'
import { ChannelRoleTransformer } from './channelRoleTransformer'
import { ChannelMember } from '../../../../public'
import {
  ChannelMemberEntity,
  RoomMemberEntity,
} from '../../../domain/entities/common/memberEntity'
import { MembershipStateTransformer } from '../../common/transformer/membershipStateTransformer'

export class ChannelMemberTransformer {
  fromEntityToAPI(entity: ChannelMemberEntity): ChannelMember {
    const membershipStateTransformer = new MembershipStateTransformer()
    const channelRoleTransformer = new ChannelRoleTransformer()
    return {
      handle: entity.handle,
      membership: membershipStateTransformer.fromEntityToAPI(entity.membership),
      role: channelRoleTransformer.fromEntityToAPI(entity.role),
    }
  }

  fromRoomToEntity(entity: RoomMemberEntity): ChannelMemberEntity {
    const powerLevelsTransformer = new ChannelPowerLevelsTransformer()
    return {
      handle: entity.handle,
      membership: entity.membership,
      role: powerLevelsTransformer.fromPowerLevelToEntity(entity.powerLevel),
    }
  }
}
