/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { SecureCommsError } from '../../../../src'
import { PublicMediaType } from '../../../../src/private/domain/entities/media/mediaCredentialEntity'
import * as mediaUtil from '../../../../src/private/util/mediaUtil'
import {
  extractObjectKeyPrefix,
  extractPublicMediaType,
  extractRoomId,
} from '../../../../src/private/util/mediaUtil'

describe('Media Utility Test Suite', () => {
  beforeEach(() => {
    jest.restoreAllMocks()
  })

  describe('extractRoomId', () => {
    it('should return a room ID with valid key prefix and home server', () => {
      jest.spyOn(mediaUtil, 'extractObjectKeyPrefix').mockReturnValue('abc123')

      const mxcUrl = 'mxc://example.org/abc123_file'
      const homeServer = 'matrix.org'
      const result = extractRoomId(mxcUrl, homeServer)

      expect(result).toBe('!abc123:matrix.org')
    })
  })

  describe('extractPublicMediaType', () => {
    it('should return matching PublicMediaType for media prefix', () => {
      jest.spyOn(mediaUtil, 'extractObjectKeyPrefix').mockReturnValue('media')

      const mxcUrl = 'mxc://example.org/media_file_foo'
      const result = extractPublicMediaType(mxcUrl)

      expect(result).toBe(PublicMediaType.MEDIA)
    })

    it('should return matching PublicMediaType for avatar prefix', () => {
      jest.spyOn(mediaUtil, 'extractObjectKeyPrefix').mockReturnValue('avatars')

      const mxcUrl = 'mxc://example.org/avatars_file_foo'
      const result = extractPublicMediaType(mxcUrl)

      expect(result).toBe(PublicMediaType.AVATARS)
    })

    it('should return undefined if prefix does not match any PublicMediaType', () => {
      jest
        .spyOn(mediaUtil, 'extractObjectKeyPrefix')
        .mockReturnValue('unsupportedType')

      const mxcUrl = 'mxc://example.org/unsupportedType_file_xyz'
      const result = extractPublicMediaType(mxcUrl)

      expect(result).toBeUndefined()
    })

    it('should return undefined if extractObjectKeyPrefix returns undefined', () => {
      jest.spyOn(mediaUtil, 'extractObjectKeyPrefix').mockReturnValue(undefined)

      const mxcUrl = 'mxc://example.org/invalid'
      const result = extractPublicMediaType(mxcUrl)

      expect(result).toBeUndefined()
    })
  })

  describe('extractObjectKeyPrefix', () => {
    it('should return correct value if multiple underscores are present', () => {
      const mxcUrl = 'mxc://example.org/foo_bar_baz'
      expect(extractObjectKeyPrefix(mxcUrl)).toBe('foo')
    })

    it('should return undefined if the path does not contain an underscore', () => {
      const mxcUrl = 'mxc://example.org/foobar'
      expect(extractObjectKeyPrefix(mxcUrl)).toBeUndefined()
    })

    it('should return undefined if path segment exists but is empty', () => {
      const mxcUrl = 'mxc://example.org/_'
      expect(extractObjectKeyPrefix(mxcUrl)).toBe('')
    })

    it('should throw SecureCommsError for invalid URL', () => {
      const mxcUrl = 'not-a-valid-mxc-url'
      expect(() => extractObjectKeyPrefix(mxcUrl)).toThrow(SecureCommsError)
      expect(() => extractObjectKeyPrefix(mxcUrl)).toThrow(
        `Invalid media URL: ${mxcUrl}`,
      )
    })
  })
})
