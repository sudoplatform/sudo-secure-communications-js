/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { ChannelTransformer } from '../../../../../../src/private/data/channels/transformer/channelTransformer'
import { APIDataFactory } from '../../../../../data-factory/api'
import { EntityDataFactory } from '../../../../../data-factory/entity'
import { GraphQLDataFactory } from '../../../../../data-factory/graphQL'

describe('ChannelTransformer Test Suite', () => {
  const instanceUnderTest = new ChannelTransformer()

  describe('fromEntityToAPI', () => {
    it('transforms from entity to API type successfully', () => {
      expect(
        instanceUnderTest.fromEntityToAPI(EntityDataFactory.channel),
      ).toStrictEqual(APIDataFactory.channel)
    })
  })

  describe('fromGraphQLToEntity', () => {
    it('transforms from graphQL to entity type successfully', () => {
      const { permissions, defaultMemberRole, ...expected } =
        EntityDataFactory.channel
      expect(
        instanceUnderTest.fromGraphQLToEntity(GraphQLDataFactory.channel),
      ).toStrictEqual(expected)
    })
  })
})
