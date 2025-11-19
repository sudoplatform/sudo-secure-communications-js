/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { getBase64EncodedMd5Hash } from '../../../../src/private/util/cryptoUtil'

describe('Crypto Utility Test Suite', () => {
  describe('getBase64EncodedMd5Hash', () => {
    it('should return correct base64-encoded MD5 hash for known input', () => {
      const input = 'hello world'
      const expectedBase64 = 'XrY7u+Ae7tCTyyK7j1rNww=='
      expect(getBase64EncodedMd5Hash(input)).toBe(expectedBase64)
    })

    it('should return different hashes for different inputs', () => {
      const input1 = 'abc'
      const input2 = 'def'
      const hash1 = getBase64EncodedMd5Hash(input1)
      const hash2 = getBase64EncodedMd5Hash(input2)
      expect(hash1).not.toBe(hash2)
    })

    it('should return consistent result for the same input', () => {
      const input = 'some consistent string'
      const hash1 = getBase64EncodedMd5Hash(input)
      const hash2 = getBase64EncodedMd5Hash(input)
      expect(hash1).toBe(hash2)
    })

    it('should return correct base64-encoded MD5 hash for empty string', () => {
      const input = ''
      const expectedBase64 = '1B2M2Y8AsgTpgAmY7PhCfg=='
      expect(getBase64EncodedMd5Hash(input)).toBe(expectedBase64)
    })

    it('should return correct base64-encoded MD5 hash for ArrayBuffer', () => {
      const input = new TextEncoder().encode('hello world')
      const arrayBuffer = input.buffer
      const expectedBase64 = 'XrY7u+Ae7tCTyyK7j1rNww=='
      expect(getBase64EncodedMd5Hash(arrayBuffer)).toBe(expectedBase64)
    })

    it('should return correct base64-encoded MD5 hash for Uint8Array', () => {
      const input = new TextEncoder().encode('hello world')
      const expectedBase64 = 'XrY7u+Ae7tCTyyK7j1rNww=='
      expect(getBase64EncodedMd5Hash(input)).toBe(expectedBase64)
    })

    it('should return consistent result for ArrayBuffer and Uint8Array of same data', () => {
      const text = 'test data'
      const uint8Array = new TextEncoder().encode(text)
      const arrayBuffer = uint8Array.buffer

      const hash1 = getBase64EncodedMd5Hash(uint8Array)
      const hash2 = getBase64EncodedMd5Hash(arrayBuffer)

      expect(hash1).toBe(hash2)
    })
  })
})
