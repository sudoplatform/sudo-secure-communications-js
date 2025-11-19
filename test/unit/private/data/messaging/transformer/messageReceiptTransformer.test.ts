/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { CachedReceipt, ReceiptType } from 'matrix-js-sdk/lib/matrix'
import { MessageReceiptTransformer } from '../../../../../../src/private/data/messaging/transformer/messageReceiptTransformer'
import { APIDataFactory } from '../../../../../data-factory/api'
import { EntityDataFactory } from '../../../../../data-factory/entity'

describe('MessageReceiptTransformer Test Suite', () => {
  const instanceUnderTest = new MessageReceiptTransformer()

  describe('fromAPIToEntity', () => {
    it('transforms from API to entity type successfully', () => {
      expect(
        instanceUnderTest.fromAPIToEntity(APIDataFactory.receipt),
      ).toStrictEqual(EntityDataFactory.receipt)
    })
  })

  describe('fromEntityToAPI', () => {
    it('transforms from entity to API type successfully', () => {
      expect(
        instanceUnderTest.fromEntityToAPI(EntityDataFactory.receipt),
      ).toStrictEqual(APIDataFactory.receipt)
    })
  })

  describe('fromMatrixToEntity', () => {
    it('transforms from matrix type to entity type successfully', () => {
      const handleId = EntityDataFactory.handle.handleId.toString()
      const receipt: CachedReceipt = {
        type: ReceiptType.Read,
        userId: handleId,
        data: {
          ts: 10,
        },
      }
      expect(instanceUnderTest.fromMatrixToEntity(receipt)).toStrictEqual(
        EntityDataFactory.receipt,
      )
    })
  })
})
