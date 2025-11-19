/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { ChannelRoleTransformer } from '../../../../../../src/private/data/channels/transformer/channelRoleTransformer'
import { ChannelRoleEntity } from '../../../../../../src/private/domain/entities/channels/channelEntity'
import { ChannelRole } from '../../../../../../src/public'

describe('ChannelRoleTransformer Test Suite', () => {
  const instanceUnderTest = new ChannelRoleTransformer()

  describe('fromAPIToEntity', () => {
    it.each`
      input                                 | expected
      ${ChannelRole.ADMIN}                  | ${ChannelRoleEntity.ADMIN}
      ${ChannelRole.MODERATOR}              | ${ChannelRoleEntity.MODERATOR}
      ${ChannelRole.PARTICIPANT}            | ${ChannelRoleEntity.PARTICIPANT}
      ${ChannelRole.REACT_ONLY_PARTICIPANT} | ${ChannelRoleEntity.REACT_ONLY_PARTICIPANT}
    `(
      'transforms from API $input to entity $expected successfully',
      ({ input, expected }) => {
        expect(instanceUnderTest.fromAPIToEntity(input)).toStrictEqual(expected)
      },
    )
  })

  describe('fromEntityToAPI', () => {
    it.each`
      input                                       | expected
      ${ChannelRoleEntity.ADMIN}                  | ${ChannelRole.ADMIN}
      ${ChannelRoleEntity.MODERATOR}              | ${ChannelRole.MODERATOR}
      ${ChannelRoleEntity.PARTICIPANT}            | ${ChannelRole.PARTICIPANT}
      ${ChannelRoleEntity.REACT_ONLY_PARTICIPANT} | ${ChannelRole.REACT_ONLY_PARTICIPANT}
    `(
      'transforms from entity $input to API $expected successfully',
      ({ input, expected }) => {
        expect(instanceUnderTest.fromEntityToAPI(input)).toStrictEqual(expected)
      },
    )
  })
})
