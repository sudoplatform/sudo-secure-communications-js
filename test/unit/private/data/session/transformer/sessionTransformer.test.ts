/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { SessionTransformer } from '../../../../../../src/private/data/session/transformer/sessionTransformer'
import { APIDataFactory } from '../../../../../data-factory/api'
import { EntityDataFactory } from '../../../../../data-factory/entity'
import { GraphQLDataFactory } from '../../../../../data-factory/graphQL'

describe('SessionTransformer Test Suite', () => {
  const instanceUnderTest = new SessionTransformer()

  describe('fromEntityToAPI', () => {
    it('transforms from entity to API type successfully', () => {
      expect(
        instanceUnderTest.fromEntityToAPI(EntityDataFactory.secureCommsSession),
      ).toStrictEqual(APIDataFactory.secureCommsSession)
    })
  })

  describe('fromGraphQLToEntity', () => {
    it('transforms from graphQL to entity type successfully', () => {
      expect(
        instanceUnderTest.fromGraphQLToEntity(
          GraphQLDataFactory.secureCommsSession,
        ),
      ).toStrictEqual(EntityDataFactory.secureCommsSession)
    })
  })
})
