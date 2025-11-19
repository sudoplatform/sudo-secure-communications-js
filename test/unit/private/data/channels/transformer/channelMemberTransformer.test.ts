/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { ChannelMemberTransformer } from '../../../../../../src/private/data/channels/transformer/channelMemberTransformer'
import { APIDataFactory } from '../../../../../data-factory/api'
import { EntityDataFactory } from '../../../../../data-factory/entity'

describe('ChannelMemberTransformer Test Suite', () => {
  const instanceUnderTest = new ChannelMemberTransformer()

  describe('fromEntityToAPI', () => {
    it('transforms from entity to API type successfully', () => {
      expect(
        instanceUnderTest.fromEntityToAPI(EntityDataFactory.channelMember),
      ).toStrictEqual(APIDataFactory.channelMember)
    })
  })

  describe('fromRoomToEntity', () => {
    it('transforms from room entity to channel member entity type successfully', () => {
      expect(
        instanceUnderTest.fromRoomToEntity(EntityDataFactory.roomMember),
      ).toStrictEqual(EntityDataFactory.channelMember)
    })
  })
})
