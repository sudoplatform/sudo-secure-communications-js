/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  anything,
  capture,
  instance,
  mock,
  reset,
  verify,
  when,
} from 'ts-mockito'
import { ApiClient } from '../../../../../src/private/data/common/apiClient'
import { DefaultWordValidationService } from '../../../../../src/private/data/wordValidation/defaultWordValidationService'

describe('DefaultWordValidationService Test Suite', () => {
  const mockAppSync = mock<ApiClient>()
  let instanceUnderTest: DefaultWordValidationService

  beforeEach(() => {
    reset(mockAppSync)
    instanceUnderTest = new DefaultWordValidationService(instance(mockAppSync))
  })

  describe('checkWordValidity', () => {
    it('calls appSync and returns result correctly', async () => {
      const name = 'fooName'
      const alias = 'fooAlias'
      const keywords = ['key-1', 'key-2']
      const tags = ['tag-1', 'tag-2']
      const validWords = [name, alias, ...keywords, ...tags]
      when(mockAppSync.checkSecureCommsWordValidity(anything())).thenResolve(
        validWords,
      )
      const result = await instanceUnderTest.checkWordValidity(
        new Set(validWords),
      )

      expect(result).toStrictEqual(new Set(validWords))
      const [inputArg] = capture(
        mockAppSync.checkSecureCommsWordValidity,
      ).first()
      expect(inputArg).toStrictEqual<typeof inputArg>(validWords)
      verify(mockAppSync.checkSecureCommsWordValidity(anything())).once()
    })
  })
})
