/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { MessageMentionTransformer } from '../../../../../../src/private/data/messaging/transformer/messageMentionTransformer'
import { APIDataFactory } from '../../../../../data-factory/api'
import { EntityDataFactory } from '../../../../../data-factory/entity'

describe('MessageMentionTransformer Test Suite', () => {
  const instanceUnderTest = new MessageMentionTransformer()

  describe('fromAPIToEntity', () => {
    it.each`
      input       | api                                    | entity
      ${'Handle'} | ${APIDataFactory.messageHandleMention} | ${EntityDataFactory.messageHandleMention}
      ${'Chat'}   | ${APIDataFactory.messageChatMention}   | ${EntityDataFactory.messageChatMention}
    `(
      'transforms from API to entity type for $input successfully',
      ({ api, entity }) => {
        expect(instanceUnderTest.fromAPIToEntity(api)).toStrictEqual(entity)
      },
    )
  })
})
