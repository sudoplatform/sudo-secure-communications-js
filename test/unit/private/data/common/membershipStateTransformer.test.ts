/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { KnownMembership } from 'matrix-js-sdk/lib/types'
import { MembershipStateTransformer } from '../../../../../src/private/data/common/transformer/membershipStateTransformer'
import { MembershipStateEntity } from '../../../../../src/private/domain/entities/common/memberEntity'
import { MembershipState } from '../../../../../src/public'

describe('MembershipStateTransformer Test Suite', () => {
  const instanceUnderTest = new MembershipStateTransformer()

  describe('fromEntityToAPI', () => {
    it.each`
      input                              | expected
      ${MembershipStateEntity.BANNED}    | ${MembershipState.BANNED}
      ${MembershipStateEntity.INVITED}   | ${MembershipState.INVITED}
      ${MembershipStateEntity.JOINED}    | ${MembershipState.JOINED}
      ${MembershipStateEntity.REQUESTED} | ${MembershipState.REQUESTED}
      ${MembershipStateEntity.LEFT}      | ${MembershipState.LEFT}
    `(
      'transforms from entity $input to API $expected successfully',
      ({ input, expected }) => {
        expect(instanceUnderTest.fromEntityToAPI(input)).toStrictEqual(expected)
      },
    )
  })

  describe('fromMatrixToEntity', () => {
    it.each`
      input                     | expected
      ${KnownMembership.Ban}    | ${MembershipStateEntity.BANNED}
      ${KnownMembership.Invite} | ${MembershipStateEntity.INVITED}
      ${KnownMembership.Join}   | ${MembershipStateEntity.JOINED}
      ${KnownMembership.Knock}  | ${MembershipStateEntity.REQUESTED}
      ${KnownMembership.Leave}  | ${MembershipStateEntity.LEFT}
      ${undefined}              | ${MembershipStateEntity.JOINED}
    `(
      'transforms from matrix type $input to entity $expected successfully',
      ({ input, expected }) => {
        expect(instanceUnderTest.fromMatrixToEntity(input)).toStrictEqual(
          expected,
        )
      },
    )
  })
})
