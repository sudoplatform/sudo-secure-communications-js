/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { MessageReactionTransformer } from '../../../../../../src/private/data/messaging/transformer/messageReactionTransformer'
import { APIDataFactory } from '../../../../../data-factory/api'
import { EntityDataFactory } from '../../../../../data-factory/entity'

describe('MessageReactionTransformer Test Suite', () => {
  const instanceUnderTest = new MessageReactionTransformer()

  describe('fromAPIToEntity', () => {
    it('transforms from API to entity type successfully', () => {
      expect(
        instanceUnderTest.fromAPIToEntity(APIDataFactory.reaction),
      ).toStrictEqual(EntityDataFactory.reaction)
    })
  })

  describe('fromEntityToAPI', () => {
    it('transforms from entity to API type successfully', () => {
      expect(
        instanceUnderTest.fromEntityToAPI(EntityDataFactory.reaction),
      ).toStrictEqual(APIDataFactory.reaction)
    })
  })
})
