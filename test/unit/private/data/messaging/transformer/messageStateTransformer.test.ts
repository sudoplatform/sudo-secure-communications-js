/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { MessageStateTransformer } from '../../../../../../src/private/data/messaging/transformer/messageStateTransformer'
import { MessageStateEntity } from '../../../../../../src/private/domain/entities/messaging/messageEntity'
import { MessageState } from '../../../../../../src/public'

describe('MessageStateTransformer Test Suite', () => {
  const instanceUnderTest = new MessageStateTransformer()

  describe('fromAPIToEntity', () => {
    it.each`
      input                     | expected
      ${MessageState.PENDING}   | ${MessageStateEntity.PENDING}
      ${MessageState.COMMITTED} | ${MessageStateEntity.COMMITTED}
      ${MessageState.FAILED}    | ${MessageStateEntity.FAILED}
    `(
      'transforms from API $input to entity $expected successfully',
      ({ input, expected }) => {
        expect(instanceUnderTest.fromAPIToEntity(input)).toStrictEqual(expected)
      },
    )
  })

  describe('fromEntityToAPI', () => {
    it.each`
      input                           | expected
      ${MessageStateEntity.PENDING}   | ${MessageState.PENDING}
      ${MessageStateEntity.COMMITTED} | ${MessageState.COMMITTED}
      ${MessageStateEntity.FAILED}    | ${MessageState.FAILED}
    `(
      'transforms from entity $input to API $expected successfully',
      ({ input, expected }) => {
        expect(instanceUnderTest.fromEntityToAPI(input)).toStrictEqual(expected)
      },
    )
  })
})
