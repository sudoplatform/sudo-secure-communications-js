/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { PublicChannelSearchResultTransformer } from '../../../../../../src/private/data/channels/transformer/publicChannelSearchResultTransformer'
import { APIDataFactory } from '../../../../../data-factory/api'
import { EntityDataFactory } from '../../../../../data-factory/entity'
import { GraphQLDataFactory } from '../../../../../data-factory/graphQL'

describe('PublicChannelSearchResultTransformer Test Suite', () => {
  const instanceUnderTest = new PublicChannelSearchResultTransformer()

  describe('fromEntityToAPI', () => {
    it('transforms from entity to API type successfully', () => {
      expect(
        instanceUnderTest.fromEntityToAPI(
          EntityDataFactory.publicChannelSearchResult,
        ),
      ).toStrictEqual(APIDataFactory.publicChannelSearchResult)
    })
  })

  describe('fromGraphQLToEntity', () => {
    it('transforms from graphQL to entity type successfully', () => {
      expect(
        instanceUnderTest.fromGraphQLToEntity(
          GraphQLDataFactory.listedChannelInfo,
        ),
      ).toStrictEqual(EntityDataFactory.publicChannelSearchResult)
    })
  })
})
