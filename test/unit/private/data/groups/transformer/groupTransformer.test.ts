/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { GroupTransformer } from '../../../../../../src/private/data/groups/transformer/groupTransformer'
import { GroupId } from '../../../../../../src/public'
import { APIDataFactory } from '../../../../../data-factory/api'
import { EntityDataFactory } from '../../../../../data-factory/entity'

describe('GroupTransformer Test Suite', () => {
  const instanceUnderTest = new GroupTransformer()

  describe('fromEntityToAPI', () => {
    it('transforms from entity to API type successfully', () => {
      expect(
        instanceUnderTest.fromEntityToAPI(EntityDataFactory.group),
      ).toStrictEqual(APIDataFactory.group)
    })
  })

  describe('fromRoomToEntity', () => {
    it('transforms from room entity to group entity type successfully', () => {
      expect(
        instanceUnderTest.fromRoomToEntity(EntityDataFactory.groupRoom),
      ).toStrictEqual({
        ...EntityDataFactory.group,
        groupId: new GroupId('testRoomId'),
      })
    })
  })
})
