/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { DirectChatTransformer } from '../../../../../../src/private/data/directChats/transformer/directChatTransformer'
import { APIDataFactory } from '../../../../../data-factory/api'
import { EntityDataFactory } from '../../../../../data-factory/entity'

describe('DirectChatTransformer Test Suite', () => {
  const instanceUnderTest = new DirectChatTransformer()

  describe('fromEntityToAPI', () => {
    it('transforms from entity to API type successfully', () => {
      expect(
        instanceUnderTest.fromEntityToAPI(EntityDataFactory.directChat),
      ).toStrictEqual(APIDataFactory.directChat)
    })
  })
})
