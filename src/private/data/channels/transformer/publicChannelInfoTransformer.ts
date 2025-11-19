/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { ChannelJoinRuleTransformer } from './channelJoinRuleTransformer'
import { PublicSecureCommsChannelInfo } from '../../../../gen/graphqlTypes'
import { ChannelId } from '../../../../public'
import { ChannelEntity } from '../../../domain/entities/channels/channelEntity'

export class PublicChannelInfoTransformer {
  fromGraphQLToEntity(data: PublicSecureCommsChannelInfo): ChannelEntity {
    const channelJoinRuleTransformer = new ChannelJoinRuleTransformer()
    return {
      channelId: new ChannelId(data.id),
      name: data.name ?? undefined,
      description: data.description ?? undefined,
      tags: data.tags,
      joinRule: channelJoinRuleTransformer.fromGraphQLToEntity(data.joinRule),
      avatarUrl: data.avatarImageUrl ?? undefined,
      memberCount: 0,
      createdAt: new Date(data.createdAtEpochMs),
      updatedAt: new Date(data.updatedAtEpochMs),
    }
  }
}
