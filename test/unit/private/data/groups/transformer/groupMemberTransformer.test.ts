/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { GroupMemberTransformer } from '../../../../../../src/private/data/groups/transformer/groupMemberTransformer'
import { APIDataFactory } from '../../../../../data-factory/api'
import { EntityDataFactory } from '../../../../../data-factory/entity'

describe('GroupMemberTransformer Test Suite', () => {
  const instanceUnderTest = new GroupMemberTransformer()

  describe('fromEntityToAPI', () => {
    it('transforms from entity to API type successfully', () => {
      expect(
        instanceUnderTest.fromEntityToAPI(EntityDataFactory.groupMember),
      ).toStrictEqual(APIDataFactory.groupMember)
    })
  })

  describe('fromRoomToEntity', () => {
    it('transforms from room member entity to group member entity type successfully', () => {
      expect(
        instanceUnderTest.fromRoomToEntity(EntityDataFactory.roomMember),
      ).toStrictEqual(EntityDataFactory.groupMember)
    })
  })
})
