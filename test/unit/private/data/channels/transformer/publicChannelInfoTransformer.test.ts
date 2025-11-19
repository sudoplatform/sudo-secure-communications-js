/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { PublicChannelInfoTransformer } from '../../../../../../src/private/data/channels/transformer/publicChannelInfoTransformer'
import { EntityDataFactory } from '../../../../../data-factory/entity'
import { GraphQLDataFactory } from '../../../../../data-factory/graphQL'

describe('PublicChannelInfoTransformer Test Suite', () => {
  const instanceUnderTest = new PublicChannelInfoTransformer()

  describe('fromGraphQLToEntity', () => {
    it('transforms from graphQL to entity type successfully', () => {
      const { permissions, defaultMemberRole, ...expected } =
        EntityDataFactory.channel
      expect(
        instanceUnderTest.fromGraphQLToEntity(
          GraphQLDataFactory.publicChannelInfo,
        ),
      ).toStrictEqual(expected)
    })
  })
})
