/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { SecureCommsChannelJoinRule } from '../../../../gen/graphqlTypes'
import { ChannelJoinRule } from '../../../../public/typings/channel'
import { ChannelJoinRuleEntity } from '../../../domain/entities/channels/channelEntity'

export class ChannelJoinRuleTransformer {
  fromAPIToEntity(data: ChannelJoinRule): ChannelJoinRuleEntity {
    switch (data) {
      case ChannelJoinRule.PRIVATE:
        return ChannelJoinRuleEntity.PRIVATE
      case ChannelJoinRule.PUBLIC:
        return ChannelJoinRuleEntity.PUBLIC
      case ChannelJoinRule.PUBLIC_WITH_INVITE:
        return ChannelJoinRuleEntity.PUBLIC_WITH_INVITE
    }
  }

  fromEntityToAPI(entity: ChannelJoinRuleEntity): ChannelJoinRule {
    switch (entity) {
      case ChannelJoinRuleEntity.PRIVATE:
        return ChannelJoinRule.PRIVATE
      case ChannelJoinRuleEntity.PUBLIC:
        return ChannelJoinRule.PUBLIC
      case ChannelJoinRuleEntity.PUBLIC_WITH_INVITE:
        return ChannelJoinRule.PUBLIC_WITH_INVITE
    }
  }

  fromEntityToGraphQL(
    entity: ChannelJoinRuleEntity,
  ): SecureCommsChannelJoinRule {
    switch (entity) {
      case ChannelJoinRuleEntity.PRIVATE:
        return SecureCommsChannelJoinRule.Private
      case ChannelJoinRuleEntity.PUBLIC:
        return SecureCommsChannelJoinRule.Public
      case ChannelJoinRuleEntity.PUBLIC_WITH_INVITE:
        return SecureCommsChannelJoinRule.PublicWithInvite
    }
  }

  fromGraphQLToEntity(data: SecureCommsChannelJoinRule): ChannelJoinRuleEntity {
    switch (data) {
      case SecureCommsChannelJoinRule.Private:
        return ChannelJoinRuleEntity.PRIVATE
      case SecureCommsChannelJoinRule.Public:
        return ChannelJoinRuleEntity.PUBLIC
      case SecureCommsChannelJoinRule.PublicWithInvite:
        return ChannelJoinRuleEntity.PUBLIC_WITH_INVITE
    }
  }
}
