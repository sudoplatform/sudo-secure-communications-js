/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  toChatId,
  toHandleId,
  toMatrixUserId,
} from '../../../../src/private/util/id'
import { ChatId, HandleId } from '../../../../src/public'

describe('Id Utility Test Suite', () => {
  describe('toMatrixUserId', () => {
    it('should return a formatted MatrixUserId', () => {
      expect(toMatrixUserId('user123', 'foo.bar')).toBe('@user123:foo.bar')
    })

    it('should handle empty input gracefully', () => {
      expect(toMatrixUserId('', 'example.com')).toBe('@:example.com')
    })
  })

  describe('toHandleId', () => {
    it('should extract HandleId from a Matrix User Id', () => {
      const result = toHandleId('@user123:example.com')
      expect(result).toBeInstanceOf(HandleId)
      expect(result.value).toBe('user123')
    })

    it('should return an empty HandleId when input is invalid', () => {
      const result = toHandleId('invalidString')
      expect(result).toBeInstanceOf(HandleId)
      expect(result.value).toBe('')
    })
  })

  describe('toChatId', () => {
    it('should return a ChatId', () => {
      expect(toChatId('user123')).toStrictEqual(new ChatId('user123'))
    })
  })
})
