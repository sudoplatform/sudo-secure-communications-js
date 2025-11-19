/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { SecureCommsChannelJoinRule } from '../../../../../../src/gen/graphqlTypes'
import { ChannelJoinRuleTransformer } from '../../../../../../src/private/data/channels/transformer/channelJoinRuleTransformer'
import { ChannelJoinRuleEntity } from '../../../../../../src/private/domain/entities/channels/channelEntity'
import { ChannelJoinRule } from '../../../../../../src/public'

describe('ChannelJoinRuleTransformer Test Suite', () => {
  const instanceUnderTest = new ChannelJoinRuleTransformer()

  describe('fromAPIToEntity', () => {
    it.each`
      input                                 | expected
      ${ChannelJoinRule.PRIVATE}            | ${ChannelJoinRuleEntity.PRIVATE}
      ${ChannelJoinRule.PUBLIC}             | ${ChannelJoinRuleEntity.PUBLIC}
      ${ChannelJoinRule.PUBLIC_WITH_INVITE} | ${ChannelJoinRuleEntity.PUBLIC_WITH_INVITE}
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
      ${ChannelJoinRuleEntity.PRIVATE}            | ${ChannelJoinRule.PRIVATE}
      ${ChannelJoinRuleEntity.PUBLIC}             | ${ChannelJoinRule.PUBLIC}
      ${ChannelJoinRuleEntity.PUBLIC_WITH_INVITE} | ${ChannelJoinRule.PUBLIC_WITH_INVITE}
    `(
      'transforms from entity $input to API $expected successfully',
      ({ input, expected }) => {
        expect(instanceUnderTest.fromEntityToAPI(input)).toStrictEqual(expected)
      },
    )
  })

  describe('fromEntityToGraphQL', () => {
    it.each`
      input                                       | expected
      ${ChannelJoinRuleEntity.PRIVATE}            | ${SecureCommsChannelJoinRule.Private}
      ${ChannelJoinRuleEntity.PUBLIC}             | ${SecureCommsChannelJoinRule.Public}
      ${ChannelJoinRuleEntity.PUBLIC_WITH_INVITE} | ${SecureCommsChannelJoinRule.PublicWithInvite}
    `(
      'transforms from entity $input to graphQL $expected successfully',
      ({ input, expected }) => {
        expect(instanceUnderTest.fromEntityToGraphQL(input)).toStrictEqual(
          expected,
        )
      },
    )
  })

  describe('fromGraphQLToEntity', () => {
    it.each`
      input                                          | expected
      ${SecureCommsChannelJoinRule.Private}          | ${ChannelJoinRuleEntity.PRIVATE}
      ${SecureCommsChannelJoinRule.Public}           | ${ChannelJoinRuleEntity.PUBLIC}
      ${SecureCommsChannelJoinRule.PublicWithInvite} | ${ChannelJoinRuleEntity.PUBLIC_WITH_INVITE}
    `(
      'transforms from graphQL $input to entity $expected successfully',
      ({ input, expected }) => {
        expect(instanceUnderTest.fromGraphQLToEntity(input)).toStrictEqual(
          expected,
        )
      },
    )
  })
})
