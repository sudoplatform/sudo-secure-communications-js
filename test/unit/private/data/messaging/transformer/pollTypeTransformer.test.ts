/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  M_POLL_KIND_DISCLOSED,
  M_POLL_KIND_UNDISCLOSED,
} from 'matrix-js-sdk/lib/@types/polls'
import { PollTypeTransformer } from '../../../../../../src/private/data/messaging/transformer/pollTypeTransformer'
import { PollTypeEntity } from '../../../../../../src/private/domain/entities/messaging/pollEntity'
import { PollType } from '../../../../../../src/public'

describe('PollTypeTransformer Test Suite', () => {
  const instanceUnderTest = new PollTypeTransformer()

  describe('fromAPIToEntity', () => {
    it.each`
      input                   | expected
      ${PollType.DISCLOSED}   | ${PollTypeEntity.DISCLOSED}
      ${PollType.UNDISCLOSED} | ${PollTypeEntity.UNDISCLOSED}
    `(
      'transforms from API $input to entity $expected successfully',
      ({ input, expected }) => {
        expect(instanceUnderTest.fromAPIToEntity(input)).toStrictEqual(expected)
      },
    )
  })

  describe('fromEntityToAPI', () => {
    it.each`
      input                         | expected
      ${PollTypeEntity.DISCLOSED}   | ${PollType.DISCLOSED}
      ${PollTypeEntity.UNDISCLOSED} | ${PollType.UNDISCLOSED}
    `(
      'transforms from entity $input to API $expected successfully',
      ({ input, expected }) => {
        expect(instanceUnderTest.fromEntityToAPI(input)).toStrictEqual(expected)
      },
    )
  })

  describe('fromEntityToMatrix', () => {
    it.each`
      input                         | expected
      ${PollTypeEntity.DISCLOSED}   | ${M_POLL_KIND_DISCLOSED.name}
      ${PollTypeEntity.UNDISCLOSED} | ${M_POLL_KIND_UNDISCLOSED.name}
    `(
      'transforms from entity $input to Matrix $expected successfully',
      ({ input, expected }) => {
        expect(instanceUnderTest.fromEntityToMatrix(input)).toStrictEqual(
          expected,
        )
      },
    )
  })
})
