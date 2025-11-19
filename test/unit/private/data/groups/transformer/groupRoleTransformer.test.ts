/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { GroupRoleTransformer } from '../../../../../../src/private/data/groups/transformer/groupRoleTransformer'
import { GroupRoleEntity } from '../../../../../../src/private/domain/entities/groups/groupEntity'
import { GroupRole } from '../../../../../../src/public'

describe('GroupRoleTransformer Test Suite', () => {
  const instanceUnderTest = new GroupRoleTransformer()

  describe('fromAPIToEntity', () => {
    it.each`
      input                    | expected
      ${GroupRole.ADMIN}       | ${GroupRoleEntity.ADMIN}
      ${GroupRole.PARTICIPANT} | ${GroupRoleEntity.PARTICIPANT}
      ${GroupRole.NOBODY}      | ${GroupRoleEntity.NOBODY}
    `(
      'transforms from API $input to entity $expected successfully',
      ({ input, expected }) => {
        expect(instanceUnderTest.fromAPIToEntity(input)).toStrictEqual(expected)
      },
    )
  })

  describe('fromEntityToAPI', () => {
    it.each`
      input                          | expected
      ${GroupRoleEntity.ADMIN}       | ${GroupRole.ADMIN}
      ${GroupRoleEntity.PARTICIPANT} | ${GroupRole.PARTICIPANT}
      ${GroupRoleEntity.NOBODY}      | ${GroupRole.NOBODY}
    `(
      'transforms from entity $input to API $expected successfully',
      ({ input, expected }) => {
        expect(instanceUnderTest.fromEntityToAPI(input)).toStrictEqual(expected)
      },
    )
  })
})
