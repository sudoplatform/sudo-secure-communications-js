/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { GroupPermissionsTransformer } from '../../../../../../src/private/data/groups/transformer/groupPermissionsTransformer'
import { APIDataFactory } from '../../../../../data-factory/api'
import { EntityDataFactory } from '../../../../../data-factory/entity'

describe('GroupPermissionsTransformer Test Suite', () => {
  const instanceUnderTest = new GroupPermissionsTransformer()

  describe('fromEntityToAPI', () => {
    it('transforms from entity to API type successfully', () => {
      expect(
        instanceUnderTest.fromEntityToAPI(EntityDataFactory.groupPermissions),
      ).toStrictEqual(APIDataFactory.groupPermissions)
    })
  })
})
