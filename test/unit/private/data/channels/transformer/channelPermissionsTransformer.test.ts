/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { ChannelPermissionsTransformer } from '../../../../../../src/private/data/channels/transformer/channelPermissionsTransformer'
import { APIDataFactory } from '../../../../../data-factory/api'
import { EntityDataFactory } from '../../../../../data-factory/entity'

describe('ChannelPermissionsTransformer Test Suite', () => {
  const instanceUnderTest = new ChannelPermissionsTransformer()

  describe('fromEntityToAPI', () => {
    it('transforms from entity to API type successfully', () => {
      expect(
        instanceUnderTest.fromEntityToAPI(EntityDataFactory.channelPermissions),
      ).toStrictEqual(APIDataFactory.channelPermissions)
    })
  })

  describe('fromInputAPIToEntity', () => {
    it('transforms from input API to input entity type successfully', () => {
      expect(
        instanceUnderTest.fromInputAPIToEntity(
          APIDataFactory.defaultChannelPermissionsInput,
        ),
      ).toStrictEqual(EntityDataFactory.defaultChannelPermissionsInput)
    })
  })
})
