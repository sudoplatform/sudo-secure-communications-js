/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { ChannelJoinRuleTransformer } from './channelJoinRuleTransformer'
import { ChannelPermissionsTransformer } from './channelPermissionsTransformer'
import { ChannelRoleTransformer } from './channelRoleTransformer'
import { SecureCommsChannel as ChannelGraphQL } from '../../../../gen/graphqlTypes'
import { ChannelId } from '../../../../public'
import { Channel, ChannelPermissions } from '../../../../public/typings/channel'
import { ChannelEntity } from '../../../domain/entities/channels/channelEntity'

export class ChannelTransformer {
  fromEntityToAPI(entity: ChannelEntity): Channel {
    const channelJoinRuleTransformer = new ChannelJoinRuleTransformer()
    const channelPermissionsTransformer = new ChannelPermissionsTransformer()
    const channelRoleTransformer = new ChannelRoleTransformer()
    return {
      channelId: entity.channelId,
      name: entity.name,
      description: entity.description,
      avatarUrl: entity.avatarUrl,
      joinRule: entity.joinRule
        ? channelJoinRuleTransformer.fromEntityToAPI(entity.joinRule)
        : undefined,
      tags: entity.tags,
      permissions: entity.permissions
        ? channelPermissionsTransformer.fromEntityToAPI(entity.permissions)
        : ChannelPermissions.default,
      defaultMemberRole: entity.defaultMemberRole
        ? channelRoleTransformer.fromEntityToAPI(entity.defaultMemberRole)
        : undefined,
      memberCount: entity.memberCount,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    }
  }

  fromGraphQLToEntity(data: ChannelGraphQL): ChannelEntity {
    const channelJoinRuleTransformer = new ChannelJoinRuleTransformer()
    return {
      channelId: new ChannelId(data.id),
      name: data.name ?? undefined,
      description: data.description ?? undefined,
      avatarUrl: data.avatarImageUrl ?? undefined,
      joinRule: channelJoinRuleTransformer.fromGraphQLToEntity(data.joinRule),
      tags: data.tags,
      memberCount: data.members.length,
      createdAt: new Date(data.createdAtEpochMs),
      updatedAt: new Date(data.updatedAtEpochMs),
    }
  }
}
