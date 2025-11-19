/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { HandleTransformer } from '../../../../../../src/private/data/handle/transformer/handleTransformer'
import { APIDataFactory } from '../../../../../data-factory/api'
import { EntityDataFactory } from '../../../../../data-factory/entity'
import { GraphQLDataFactory } from '../../../../../data-factory/graphQL'

describe('HandleTransformer Test Suite', () => {
  const instanceUnderTest = new HandleTransformer()

  describe('fromEntityToAPI', () => {
    it('transforms from entity to API type successfully', () => {
      expect(
        instanceUnderTest.fromEntityToAPI(EntityDataFactory.ownedHandle),
      ).toStrictEqual(APIDataFactory.handle)
    })
  })

  describe('fromGraphQLToEntity', () => {
    it('transforms from graphQL to entity type successfully', () => {
      expect(
        instanceUnderTest.fromGraphQLToEntity(
          GraphQLDataFactory.publicHandleInfo,
        ),
      ).toStrictEqual(EntityDataFactory.handle)
    })
  })

  describe('fromGraphQLToOwnedEntity', () => {
    it('transforms from graphQL to owned entity type successfully', () => {
      expect(
        instanceUnderTest.fromGraphQLToOwnedEntity(GraphQLDataFactory.handle),
      ).toStrictEqual(EntityDataFactory.ownedHandle)
    })
  })
})
