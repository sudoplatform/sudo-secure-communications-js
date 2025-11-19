/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { SecureCommsPublicChannelJoinRule } from '../../../../../../src/gen/graphqlTypes'
import { PublicChannelJoinRuleTransformer } from '../../../../../../src/private/data/channels/transformer/publicChannelJoinRuleTransformer'
import { PublicChannelJoinRuleEntity } from '../../../../../../src/private/domain/entities/channels/channelEntity'
import { PublicChannelJoinRule } from '../../../../../../src/public'

describe('PublicChannelJoinRuleTransformer Test Suite', () => {
  const instanceUnderTest = new PublicChannelJoinRuleTransformer()

  describe('fromAPIToEntity', () => {
    it.each`
      input                                       | expected
      ${PublicChannelJoinRule.PUBLIC}             | ${PublicChannelJoinRuleEntity.PUBLIC}
      ${PublicChannelJoinRule.PUBLIC_WITH_INVITE} | ${PublicChannelJoinRuleEntity.PUBLIC_WITH_INVITE}
    `(
      'transforms from API $input to entity $expected successfully',
      ({ input, expected }) => {
        expect(instanceUnderTest.fromAPIToEntity(input)).toStrictEqual(expected)
      },
    )
  })

  describe('fromEntityToAPI', () => {
    it.each`
      input                                             | expected
      ${PublicChannelJoinRuleEntity.PUBLIC}             | ${PublicChannelJoinRule.PUBLIC}
      ${PublicChannelJoinRuleEntity.PUBLIC_WITH_INVITE} | ${PublicChannelJoinRule.PUBLIC_WITH_INVITE}
    `(
      'transforms from entity $input to API $expected successfully',
      ({ input, expected }) => {
        expect(instanceUnderTest.fromEntityToAPI(input)).toStrictEqual(expected)
      },
    )
  })

  describe('fromEntityToGraphQL', () => {
    it.each`
      input                                             | expected
      ${PublicChannelJoinRuleEntity.PUBLIC}             | ${SecureCommsPublicChannelJoinRule.Public}
      ${PublicChannelJoinRuleEntity.PUBLIC_WITH_INVITE} | ${SecureCommsPublicChannelJoinRule.PublicWithInvite}
    `(
      'transforms from entity $input to graphQL $expected successfully',
      ({ input, expected }) => {
        expect(instanceUnderTest.fromAPIToEntity(input)).toStrictEqual(expected)
      },
    )
  })

  describe('fromGraphQLToEntity', () => {
    it.each`
      input                                                | expected
      ${SecureCommsPublicChannelJoinRule.Public}           | ${PublicChannelJoinRuleEntity.PUBLIC}
      ${SecureCommsPublicChannelJoinRule.PublicWithInvite} | ${PublicChannelJoinRuleEntity.PUBLIC_WITH_INVITE}
    `(
      'transforms from graphQL $input to entity $expected successfully',
      ({ input, expected }) => {
        expect(instanceUnderTest.fromAPIToEntity(input)).toStrictEqual(expected)
      },
    )
  })
})
