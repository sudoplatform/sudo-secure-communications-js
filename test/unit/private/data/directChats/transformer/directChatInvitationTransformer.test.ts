/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { DirectChatInvitationTransformer } from '../../../../../../src/private/data/directChats/transformer/directChatInvitationTransformer'
import { APIDataFactory } from '../../../../../data-factory/api'
import { EntityDataFactory } from '../../../../../data-factory/entity'

describe('DirectChatInvitationTransformer Test Suite', () => {
  const instanceUnderTest = new DirectChatInvitationTransformer()

  describe('fromEntityToAPI', () => {
    it('transforms from entity to API type successfully', () => {
      expect(
        instanceUnderTest.fromEntityToAPI(
          EntityDataFactory.directChatInvitation,
        ),
      ).toStrictEqual(APIDataFactory.directChatInvitation)
    })
  })
})
