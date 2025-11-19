/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { PollResponsesTransformer } from '../../../../../../src/private/data/messaging/transformer/pollResponsesTransformer'
import { APIDataFactory } from '../../../../../data-factory/api'
import { EntityDataFactory } from '../../../../../data-factory/entity'

describe('PollResponsesTransformer Test Suite', () => {
  const instanceUnderTest = new PollResponsesTransformer()

  describe('fromAPIToEntity', () => {
    it('transforms from API to entity type successfully', () => {
      expect(
        instanceUnderTest.fromAPIToEntity(APIDataFactory.pollResponses),
      ).toStrictEqual(EntityDataFactory.pollResponses)
    })
  })

  describe('fromEntityToAPI', () => {
    it('transforms from entity to API type successfully', () => {
      expect(
        instanceUnderTest.fromEntityToAPI(EntityDataFactory.pollResponses),
      ).toStrictEqual(APIDataFactory.pollResponses)
    })
  })
})
