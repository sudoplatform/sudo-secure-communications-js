/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { ChannelRole } from '../../../../public/typings/channel'
import { ChannelRoleEntity } from '../../../domain/entities/channels/channelEntity'

export class ChannelRoleTransformer {
  fromAPIToEntity(data: ChannelRole): ChannelRoleEntity {
    switch (data) {
      case ChannelRole.ADMIN:
        return ChannelRoleEntity.ADMIN
      case ChannelRole.MODERATOR:
        return ChannelRoleEntity.MODERATOR
      case ChannelRole.PARTICIPANT:
        return ChannelRoleEntity.PARTICIPANT
      case ChannelRole.REACT_ONLY_PARTICIPANT:
        return ChannelRoleEntity.REACT_ONLY_PARTICIPANT
    }
  }

  fromEntityToAPI(entity: ChannelRoleEntity): ChannelRole {
    switch (entity) {
      case ChannelRoleEntity.ADMIN:
        return ChannelRole.ADMIN
      case ChannelRoleEntity.MODERATOR:
        return ChannelRole.MODERATOR
      case ChannelRoleEntity.PARTICIPANT:
        return ChannelRole.PARTICIPANT
      case ChannelRoleEntity.REACT_ONLY_PARTICIPANT:
        return ChannelRole.REACT_ONLY_PARTICIPANT
    }
  }
}
