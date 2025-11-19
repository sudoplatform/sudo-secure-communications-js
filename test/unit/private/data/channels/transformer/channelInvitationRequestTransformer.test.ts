/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { ChannelInvitationRequestTransformer } from '../../../../../../src/private/data/channels/transformer/channelInvitationRequestTransformer'
import { APIDataFactory } from '../../../../../data-factory/api'
import { EntityDataFactory } from '../../../../../data-factory/entity'

describe('ChannelInvitationRequestTransformer Test Suite', () => {
  const instanceUnderTest = new ChannelInvitationRequestTransformer()

  describe('fromEntityToAPI', () => {
    it('transforms from entity to API type successfully', () => {
      expect(
        instanceUnderTest.fromEntityToAPI(
          EntityDataFactory.channelInvitationRequest,
        ),
      ).toStrictEqual(APIDataFactory.channelInvitationRequest)
    })
  })
})
