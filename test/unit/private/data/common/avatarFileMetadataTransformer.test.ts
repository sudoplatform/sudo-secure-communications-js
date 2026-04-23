/*
 * Copyright © 2026 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { AvatarImageMetadataTransformer } from '../../../../../src/private/data/common/transformer/avatarImageMetadataTransformer'
import { EntityDataFactory } from '../../../../data-factory/entity'
import { GraphQLDataFactory } from '../../../../data-factory/graphQL'

describe('AvatarImageMetadata Test Suite', () => {
  const instanceUnderTest = new AvatarImageMetadataTransformer()

  describe('fromEntityToGraphQL', () => {
    it('transforms from entity to GraphQL type successfully', () => {
      expect(
        instanceUnderTest.fromEntityToGraphQL(
          EntityDataFactory.avatarImageMetadata,
        ),
      ).toStrictEqual(GraphQLDataFactory.avatarImageMetadata)
    })
  })
})
