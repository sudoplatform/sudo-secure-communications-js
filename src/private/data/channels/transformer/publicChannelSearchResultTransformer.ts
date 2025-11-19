/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { PublicChannelJoinRuleTransformer } from './publicChannelJoinRuleTransformer'
import { ListedSecureCommsChannelInfo } from '../../../../gen/graphqlTypes'
import { ChannelId } from '../../../../public'
import { PublicChannelSearchResult } from '../../../../public/typings/channel'
import { PublicChannelSearchResultEntity } from '../../../domain/entities/channels/channelEntity'

export class PublicChannelSearchResultTransformer {
  fromEntityToAPI(
    entity: PublicChannelSearchResultEntity,
  ): PublicChannelSearchResult {
    const publicChannelJoinRuleTransformer =
      new PublicChannelJoinRuleTransformer()
    return {
      channelId: entity.channelId,
      name: entity.name,
      avatarUrl: entity.avatarUrl,
      description: entity.description,
      tags: entity.tags,
      joinRule: publicChannelJoinRuleTransformer.fromEntityToAPI(
        entity.joinRule,
      ),
      memberCount: entity.memberCount,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    }
  }

  fromGraphQLToEntity(
    data: ListedSecureCommsChannelInfo,
  ): PublicChannelSearchResultEntity {
    const publicChannelJoinRuleTransformer =
      new PublicChannelJoinRuleTransformer()
    return {
      channelId: new ChannelId(data.id),
      name: data.name,
      description: data.description ?? undefined,
      avatarUrl: data.avatarImageUrl ?? undefined,
      joinRule: publicChannelJoinRuleTransformer.fromGraphQLToEntity(
        data.joinRule,
      ),
      tags: data.tags,
      memberCount: data.memberCount,
      createdAt: new Date(data.createdAtEpochMs),
      updatedAt: new Date(data.updatedAtEpochMs),
    }
  }
}
