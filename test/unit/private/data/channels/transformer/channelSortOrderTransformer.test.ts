/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  ListSecureCommsPublicChannelsOrderingDirection,
  ListSecureCommsPublicChannelsOrderingField,
} from '../../../../../../src/gen/graphqlTypes'
import {
  ChannelSortDirectionTransformer,
  ChannelSortFieldTransformer,
  ChannelSortOrderTransformer,
} from '../../../../../../src/private/data/channels/transformer/channelSortOrderTransformer'
import {
  ChannelSortDirectionEntity,
  ChannelSortFieldEntity,
} from '../../../../../../src/private/domain/entities/channels/channelEntity'
import {
  ChannelSortDirection,
  ChannelSortField,
} from '../../../../../../src/public/typings/channel'
import { APIDataFactory } from '../../../../../data-factory/api'
import { EntityDataFactory } from '../../../../../data-factory/entity'
import { GraphQLDataFactory } from '../../../../../data-factory/graphQL'

describe('ChannelSortOrderTransformer Test Suite', () => {
  const instanceUnderTest = new ChannelSortOrderTransformer()

  describe('fromAPIToEntity', () => {
    it('transforms from API to entity type successfully', () => {
      expect(
        instanceUnderTest.fromAPIToEntity(APIDataFactory.channelSortOrder),
      ).toStrictEqual(EntityDataFactory.channelSortOrder)
    })
  })

  describe('fromEntityToGraphQL', () => {
    it('transforms from entity to graphQL type successfully', () => {
      expect(
        instanceUnderTest.fromEntityToGraphQL(
          EntityDataFactory.channelSortOrder,
        ),
      ).toStrictEqual(GraphQLDataFactory.listPublicChannelsOrdering)
    })
  })
})

describe('ChannelSortFieldTransformer Test Suite', () => {
  const instanceUnderTest = new ChannelSortFieldTransformer()

  describe('fromAPIToEntity', () => {
    it.each`
      input                            | expected
      ${ChannelSortField.NAME}         | ${ChannelSortFieldEntity.NAME}
      ${ChannelSortField.MEMBER_COUNT} | ${ChannelSortFieldEntity.MEMBER_COUNT}
    `(
      'transforms from API $input to entity $expected successfully',
      ({ input, expected }) => {
        expect(instanceUnderTest.fromAPIToEntity(input)).toStrictEqual(expected)
      },
    )
  })

  describe('fromEntityToGraphQL', () => {
    it.each`
      input                                  | expected
      ${ChannelSortFieldEntity.NAME}         | ${ListSecureCommsPublicChannelsOrderingField.Name}
      ${ChannelSortFieldEntity.MEMBER_COUNT} | ${ListSecureCommsPublicChannelsOrderingField.MemberCount}
    `(
      'transforms from entity $input to graphQL $expected successfully',
      ({ input, expected }) => {
        expect(instanceUnderTest.fromEntityToGraphQL(input)).toStrictEqual(
          expected,
        )
      },
    )
  })
})

describe('ChannelSortDirectionTransformer Test Suite', () => {
  const instanceUnderTest = new ChannelSortDirectionTransformer()

  describe('fromAPIToEntity', () => {
    it.each`
      input                              | expected
      ${ChannelSortDirection.ASCENDING}  | ${ChannelSortDirectionEntity.ASCENDING}
      ${ChannelSortDirection.DESCENDING} | ${ChannelSortDirectionEntity.DESCENDING}
    `(
      'transforms from API $input to entity $expected successfully',
      ({ input, expected }) => {
        expect(instanceUnderTest.fromAPIToEntity(input)).toStrictEqual(expected)
      },
    )
  })

  describe('fromEntityToGraphQL', () => {
    it.each`
      input                                    | expected
      ${ChannelSortDirectionEntity.ASCENDING}  | ${ListSecureCommsPublicChannelsOrderingDirection.Asc}
      ${ChannelSortDirectionEntity.DESCENDING} | ${ListSecureCommsPublicChannelsOrderingDirection.Desc}
    `(
      'transforms from entity $input to graphQL $expected successfully',
      ({ input, expected }) => {
        expect(instanceUnderTest.fromEntityToGraphQL(input)).toStrictEqual(
          expected,
        )
      },
    )
  })
})
