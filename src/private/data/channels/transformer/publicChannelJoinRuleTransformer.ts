/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { SecureCommsPublicChannelJoinRule } from '../../../../gen/graphqlTypes'
import { PublicChannelJoinRule } from '../../../../public/typings/channel'
import { PublicChannelJoinRuleEntity } from '../../../domain/entities/channels/channelEntity'

export class PublicChannelJoinRuleTransformer {
  fromAPIToEntity(data: PublicChannelJoinRule): PublicChannelJoinRuleEntity {
    switch (data) {
      case PublicChannelJoinRule.PUBLIC:
        return PublicChannelJoinRuleEntity.PUBLIC
      case PublicChannelJoinRule.PUBLIC_WITH_INVITE:
        return PublicChannelJoinRuleEntity.PUBLIC_WITH_INVITE
    }
  }

  fromEntityToAPI(entity: PublicChannelJoinRuleEntity): PublicChannelJoinRule {
    switch (entity) {
      case PublicChannelJoinRuleEntity.PUBLIC:
        return PublicChannelJoinRule.PUBLIC
      case PublicChannelJoinRuleEntity.PUBLIC_WITH_INVITE:
        return PublicChannelJoinRule.PUBLIC_WITH_INVITE
    }
  }

  fromEntityToGraphQL(
    entity: PublicChannelJoinRuleEntity,
  ): SecureCommsPublicChannelJoinRule {
    switch (entity) {
      case PublicChannelJoinRuleEntity.PUBLIC:
        return SecureCommsPublicChannelJoinRule.Public
      case PublicChannelJoinRuleEntity.PUBLIC_WITH_INVITE:
        return SecureCommsPublicChannelJoinRule.PublicWithInvite
    }
  }

  fromGraphQLToEntity(
    data: SecureCommsPublicChannelJoinRule,
  ): PublicChannelJoinRuleEntity {
    switch (data) {
      case SecureCommsPublicChannelJoinRule.Public:
        return PublicChannelJoinRuleEntity.PUBLIC
      case SecureCommsPublicChannelJoinRule.PublicWithInvite:
        return PublicChannelJoinRuleEntity.PUBLIC_WITH_INVITE
    }
  }
}
