/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { InvalidArgumentError } from '../../../../../../src'
import { GroupPowerLevelsTransformer } from '../../../../../../src/private/data/groups/transformer/groupPowerLevelsTransformer'
import { GroupRoleEntity } from '../../../../../../src/private/domain/entities/groups/groupEntity'

describe('GroupPowerLevelsTransformer Test Suite', () => {
  const instanceUnderTest = new GroupPowerLevelsTransformer()

  describe('fromEntityToPowerLevel', () => {
    it.each`
      input                          | expected
      ${GroupRoleEntity.NOBODY}      | ${101}
      ${GroupRoleEntity.ADMIN}       | ${100}
      ${GroupRoleEntity.PARTICIPANT} | ${25}
    `(
      'transforms from entity $input to power level value $expected successfully',
      ({ input, expected }) => {
        expect(instanceUnderTest.fromEntityToPowerLevel(input)).toStrictEqual(
          expected,
        )
      },
    )
  })

  describe('fromPowerLevelToEntity', () => {
    it.each`
      input  | expected
      ${101} | ${GroupRoleEntity.NOBODY}
      ${100} | ${GroupRoleEntity.ADMIN}
      ${25}  | ${GroupRoleEntity.PARTICIPANT}
    `(
      'transforms from power level value $input to entity value $expected successfully',
      ({ input, expected }) => {
        expect(instanceUnderTest.fromPowerLevelToEntity(input)).toStrictEqual(
          expected,
        )
      },
    )

    it('should throw an InvalidArgumentError for out of range power level', () => {
      expect(() => instanceUnderTest.fromPowerLevelToEntity(102)).toThrow(
        new InvalidArgumentError('power level is out of range'),
      )
    })
  })
})
