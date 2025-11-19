/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { DirectChatRole } from '../../../../../../src'
import { DirectChatPowerLevelsTransformer } from '../../../../../../src/private/data/directChats/transformer/directChatPowerLevelsTransformer'

describe('DirectChatPowerLevelsTransformer Test Suite', () => {
  const instanceUnderTest = new DirectChatPowerLevelsTransformer()

  describe('fromEntityToPowerLevel', () => {
    it.each`
      input                         | expected
      ${DirectChatRole.PARTICIPANT} | ${100}
      ${DirectChatRole.NOBODY}      | ${101}
    `(
      'transforms from entity $input to power level value $expected successfully',
      ({ input, expected }) => {
        expect(instanceUnderTest.fromEntityToPowerLevel(input)).toStrictEqual(
          expected,
        )
      },
    )
  })
})
