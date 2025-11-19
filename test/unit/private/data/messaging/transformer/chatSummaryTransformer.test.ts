/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { ChatSummaryTransformer } from '../../../../../../src/private/data/messaging/transformer/chatSummaryTransformer'
import { APIDataFactory } from '../../../../../data-factory/api'
import { EntityDataFactory } from '../../../../../data-factory/entity'

describe('ChatSummaryTransformer Test Suite', () => {
  const instanceUnderTest = new ChatSummaryTransformer()

  describe('fromAPIToEntity', () => {
    it('transforms from API to entity type successfully', () => {
      expect(
        instanceUnderTest.fromAPIToEntity(APIDataFactory.chatSummary),
      ).toStrictEqual(EntityDataFactory.chatSummary)
    })
  })

  describe('fromEntityToAPI', () => {
    it('transforms from entity to API type successfully', () => {
      expect(
        instanceUnderTest.fromEntityToAPI(EntityDataFactory.chatSummary),
      ).toStrictEqual(APIDataFactory.chatSummary)
    })
  })
})
