/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { RoomMediaCredentialTransformer } from '../../../../../../src/private/data/media/transformer/roomMediaCredentialTransformer'
import { EntityDataFactory } from '../../../../../data-factory/entity'
import { GraphQLDataFactory } from '../../../../../data-factory/graphQL'

describe('RoomMediaCredentialTransformer Test Suite', () => {
  const instanceUnderTest = new RoomMediaCredentialTransformer()

  describe('fromGraphQLToEntity', () => {
    it('transforms from graphQL to entity type successfully', () => {
      expect(
        instanceUnderTest.fromGraphQLToEntity(
          GraphQLDataFactory.mediaBucketCredential,
        ),
      ).toStrictEqual(EntityDataFactory.roomMediaCredential)
    })
  })
})
