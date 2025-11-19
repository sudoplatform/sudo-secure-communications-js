/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  ListSecureCommsPublicChannelsOrdering,
  ListSecureCommsPublicChannelsOrderingDirection,
  ListSecureCommsPublicChannelsOrderingField,
} from '../../../../gen/graphqlTypes'
import {
  ChannelSortDirection,
  ChannelSortField,
  ChannelSortOrder,
} from '../../../../public/typings/channel'
import {
  ChannelSortDirectionEntity,
  ChannelSortFieldEntity,
  ChannelSortOrderEntity,
} from '../../../domain/entities/channels/channelEntity'

export class ChannelSortOrderTransformer {
  fromAPIToEntity(data: ChannelSortOrder): ChannelSortOrderEntity {
    const channelSortFieldTransformer = new ChannelSortFieldTransformer()
    const channelSortDirectionTransformer =
      new ChannelSortDirectionTransformer()
    return {
      field: channelSortFieldTransformer.fromAPIToEntity(data.field),
      direction: channelSortDirectionTransformer.fromAPIToEntity(
        data.direction,
      ),
    }
  }

  fromEntityToGraphQL(
    entity: ChannelSortOrderEntity,
  ): ListSecureCommsPublicChannelsOrdering {
    const channelSortFieldTransformer = new ChannelSortFieldTransformer()
    const channelSortDirectionTransformer =
      new ChannelSortDirectionTransformer()
    return {
      field: channelSortFieldTransformer.fromEntityToGraphQL(entity.field),
      direction: channelSortDirectionTransformer.fromEntityToGraphQL(
        entity.direction,
      ),
    }
  }
}

export class ChannelSortFieldTransformer {
  fromAPIToEntity(data: ChannelSortField): ChannelSortFieldEntity {
    switch (data) {
      case ChannelSortField.NAME:
        return ChannelSortFieldEntity.NAME
      case ChannelSortField.MEMBER_COUNT:
        return ChannelSortFieldEntity.MEMBER_COUNT
    }
  }

  fromEntityToGraphQL(
    entity: ChannelSortFieldEntity,
  ): ListSecureCommsPublicChannelsOrderingField {
    switch (entity) {
      case ChannelSortFieldEntity.NAME:
        return ListSecureCommsPublicChannelsOrderingField.Name
      case ChannelSortFieldEntity.MEMBER_COUNT:
        return ListSecureCommsPublicChannelsOrderingField.MemberCount
    }
  }
}

export class ChannelSortDirectionTransformer {
  fromAPIToEntity(data: ChannelSortDirection): ChannelSortDirectionEntity {
    switch (data) {
      case ChannelSortDirection.ASCENDING:
        return ChannelSortDirectionEntity.ASCENDING
      case ChannelSortDirection.DESCENDING:
        return ChannelSortDirectionEntity.DESCENDING
    }
  }

  fromEntityToGraphQL(
    entity: ChannelSortDirectionEntity,
  ): ListSecureCommsPublicChannelsOrderingDirection {
    switch (entity) {
      case ChannelSortDirectionEntity.ASCENDING:
        return ListSecureCommsPublicChannelsOrderingDirection.Asc
      case ChannelSortDirectionEntity.DESCENDING:
        return ListSecureCommsPublicChannelsOrderingDirection.Desc
    }
  }
}
