/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  M_POLL_RESPONSE,
  M_POLL_START,
  MatrixEvent,
} from 'matrix-js-sdk/lib/matrix'
import { MessageTransformer } from '../../../../../../src/private/data/messaging/transformer/messageTransformer'
import { MessageStateEntity } from '../../../../../../src/private/domain/entities/messaging/messageEntity'
import {
  HandleId,
  MembershipState,
  SecureCommsError,
} from '../../../../../../src/public'
import { APIDataFactory } from '../../../../../data-factory/api'
import { EntityDataFactory } from '../../../../../data-factory/entity'

describe('MessageTransformer Test Suite', () => {
  const instanceUnderTest = new MessageTransformer()

  describe('fromAPIToEntity', () => {
    it('transforms from API to entity type successfully', () => {
      expect(
        instanceUnderTest.fromAPIToEntity(APIDataFactory.message),
      ).toStrictEqual(EntityDataFactory.message)
    })
  })

  describe('fromEntityToAPI', () => {
    it('transforms from entity to API type successfully', () => {
      expect(
        instanceUnderTest.fromEntityToAPI(EntityDataFactory.message),
      ).toStrictEqual(APIDataFactory.message)
    })
  })

  describe('fromMatrixToEntity', () => {
    it('transforms from matrix type to correct entity type successfully', () => {
      const userId = 'testUserId'

      // Message events
      const eventMsg = new MatrixEvent({
        event_id: 'testMessageId',
        type: 'm.room.message',
        content: { msgtype: 'm.text', body: 'Foo message' },
        sender: 'testHandleId',
        origin_server_ts: 1,
        unsigned: {},
      })
      expect(
        instanceUnderTest.fromMatrixToEntity(userId, eventMsg),
      ).toStrictEqual({
        messageId: 'testMessageId',
        state: MessageStateEntity.COMMITTED,
        timestamp: 1,
        senderHandle: {
          handleId: new HandleId('testHandleId'),
          name: '', // this is expected to be blank because it is populated by caller
        },
        isOwn: false,
        content: {
          type: 'm.text',
          text: 'Foo message',
          isEdited: false,
        },
        reactions: [],
        receipts: [],
      })

      // Membership events
      const eventMembership = new MatrixEvent({
        event_id: 'testMembershipEvtId',
        type: 'm.room.member',
        content: {
          membership: 'join',
          displayname: 'Alice',
          avatar_url: 'mxc://matrix.org/abc123',
        },
        sender: 'testHandleId',
        origin_server_ts: 1,
        unsigned: {},
      })
      expect(
        instanceUnderTest.fromMatrixToEntity(userId, eventMembership),
      ).toStrictEqual({
        messageId: 'testMembershipEvtId',
        state: MessageStateEntity.COMMITTED,
        timestamp: 1,
        senderHandle: {
          handleId: new HandleId('testHandleId'),
          name: '', // this is expected to be blank because it is populated by caller
        },
        isOwn: false,
        content: {
          state: MembershipState.JOINED,
          handle: {
            handleId: new HandleId(''),
            name: '',
          },
        },
        reactions: [],
        receipts: [],
      })

      // Poll events
      const eventPollStart = new MatrixEvent({
        event_id: 'testPollStartEvtId',
        type: 'org.matrix.msc3381.poll.start',
        content: {
          [M_POLL_START.name]: {
            kind: 'org.matrix.msc3381.poll.disclosed',
            question: 'What is the capital of France?',
            answers: ['Paris', 'London', 'Berlin'],
            max_selections: 1,
          },
        },
        sender: 'testHandleId',
        origin_server_ts: 1,
        unsigned: {},
      })
      expect(
        instanceUnderTest.fromMatrixToEntity(userId, eventPollStart),
      ).toStrictEqual({
        messageId: 'testPollStartEvtId',
        state: MessageStateEntity.COMMITTED,
        timestamp: 1,
        senderHandle: {
          handleId: new HandleId('testHandleId'),
          name: '',
        },
        isOwn: false,
        content: {
          type: 'org.matrix.msc3381.poll.start',
          kind: 'org.matrix.msc3381.poll.disclosed',
          question: 'What is the capital of France?',
          answers: ['Paris', 'London', 'Berlin'],
          maxSelections: 1,
          isEdited: false,
        },
        reactions: [],
        receipts: [],
      })

      const eventPollResponse = new MatrixEvent({
        event_id: 'testPollResponseEvtId',
        type: 'org.matrix.msc3381.poll.response',
        content: {
          [M_POLL_RESPONSE.name]: {
            answers: ['Paris', 'London', 'Berlin'],
          },
          'm.relates_to': {
            rel_type: 'm.reference',
            event_id: 'testPollStartEvtId',
          },
        },
        sender: 'testHandleId',
        origin_server_ts: 1,
        unsigned: {},
      })
      expect(
        instanceUnderTest.fromMatrixToEntity(userId, eventPollResponse),
      ).toStrictEqual({
        messageId: 'testPollResponseEvtId',
        state: MessageStateEntity.COMMITTED,
        timestamp: 1,
        senderHandle: {
          handleId: new HandleId('testHandleId'),
          name: '',
        },
        isOwn: false,
        content: {
          type: 'org.matrix.msc3381.poll.response',
          pollId: 'testPollStartEvtId',
          answers: ['Paris', 'London', 'Berlin'],
          isEdited: false,
        },
        reactions: [],
        receipts: [],
      })
    })

    it('should return undefined when event identifier is missing', () => {
      const userId = 'testUserId'
      const event = new MatrixEvent({
        event_id: '',
        type: 'm.room.message',
        content: { msgtype: 'm.text', body: 'Foo message' },
        sender: 'testHandleId',
        origin_server_ts: 1,
        unsigned: {},
      })
      expect(instanceUnderTest.fromMatrixToEntity(userId, event)).toStrictEqual(
        undefined,
      )
    })
    it('should throw SecureCommsError when message contains invalid content type', () => {
      const userId = 'testUserId'
      let event = new MatrixEvent({
        event_id: 'testMessageId',
        type: 'm.room.message',
        content: { msgtype: 'invalid', body: 'Foo message' },
        sender: 'testHandleId',
        origin_server_ts: 1,
        unsigned: {},
      })
      expect(() => instanceUnderTest.fromMatrixToEntity(userId, event)).toThrow(
        SecureCommsError,
      )
      event = new MatrixEvent({
        event_id: 'testMessageId',
        type: 'm.room.message',
        content: {},
        sender: 'testHandleId',
        origin_server_ts: 1,
        unsigned: {},
      })
      expect(() => instanceUnderTest.fromMatrixToEntity(userId, event)).toThrow(
        SecureCommsError,
      )
    })

    it('should correctly handle redacted messages', () => {
      const userId = 'testUserId'
      const event = new MatrixEvent({
        event_id: 'testMessageId',
        type: 'm.room.message',
        content: {},
        sender: 'testHandleId',
        origin_server_ts: 1,
        unsigned: {
          redacted_because: {
            event_id: 'testRedactionId',
            type: 'm.room.message',
            content: {},
            sender: 'testHandleId',
            origin_server_ts: 1,
            unsigned: {},
          },
        },
      })
      expect(instanceUnderTest.fromMatrixToEntity(userId, event)).toStrictEqual(
        {
          messageId: 'testMessageId',
          state: MessageStateEntity.COMMITTED,
          timestamp: 1,
          senderHandle: {
            handleId: new HandleId('testHandleId'),
            name: '',
          },
          isOwn: false,
          content: {
            redactedBecause: {
              event_id: 'testRedactionId',
              type: 'm.room.message',
              content: {},
              sender: 'testHandleId',
              origin_server_ts: 1,
              unsigned: {},
            },
          },
          reactions: [],
          receipts: [],
        },
      )
    })

    it('should correctly handle thread messages', () => {
      const userId = 'testUserId'
      const event = new MatrixEvent({
        event_id: 'testMessageId',
        type: 'm.room.message',
        content: {
          msgtype: 'm.text',
          body: 'Foo message',
          'm.relates_to': {
            rel_type: 'm.thread',
            event_id: 'testThreadId',
          },
        },
        sender: 'testHandleId',
        origin_server_ts: 1,
        unsigned: {},
      })
      expect(instanceUnderTest.fromMatrixToEntity(userId, event)).toStrictEqual(
        {
          messageId: 'testMessageId',
          state: MessageStateEntity.COMMITTED,
          timestamp: 1,
          senderHandle: {
            handleId: new HandleId('testHandleId'),
            name: '', // this is expected to be blank because it is populated by caller
          },
          isOwn: false,
          content: {
            type: 'm.text',
            text: 'Foo message',
            isEdited: false,
            threadId: 'testThreadId',
          },
          reactions: [],
          receipts: [],
        },
      )
    })

    it('should correctly handle reply messages', () => {
      const userId = 'testUserId'
      const event = new MatrixEvent({
        event_id: 'testMessageId',
        type: 'm.room.message',
        content: {
          msgtype: 'm.text',
          body: 'Foo message',
          'm.relates_to': {
            'm.in_reply_to': {
              event_id: 'testReplyId',
            },
          },
        },
        sender: 'testHandleId',
        origin_server_ts: 1,
        unsigned: {},
      })
      expect(instanceUnderTest.fromMatrixToEntity(userId, event)).toStrictEqual(
        {
          messageId: 'testMessageId',
          state: MessageStateEntity.COMMITTED,
          timestamp: 1,
          senderHandle: {
            handleId: new HandleId('testHandleId'),
            name: '', // this is expected to be blank because it is populated by caller
          },
          isOwn: false,
          content: {
            type: 'm.text',
            text: 'Foo message',
            isEdited: false,
            repliedToMessageId: 'testReplyId',
          },
          reactions: [],
          receipts: [],
        },
      )
    })

    it('should correctly handle threaded reply messages', () => {
      const userId = 'testUserId'
      const event = new MatrixEvent({
        event_id: 'testMessageId',
        type: 'm.room.message',
        content: {
          msgtype: 'm.text',
          body: 'Foo message',
          'm.relates_to': {
            rel_type: 'm.thread',
            event_id: 'testThreadId',
            'm.in_reply_to': {
              event_id: 'testReplyId',
            },
          },
        },
        sender: 'testHandleId',
        origin_server_ts: 1,
      })
      expect(instanceUnderTest.fromMatrixToEntity(userId, event)).toStrictEqual(
        {
          messageId: 'testMessageId',
          state: MessageStateEntity.COMMITTED,
          timestamp: 1,
          senderHandle: {
            handleId: new HandleId('testHandleId'),
            name: '', // this is expected to be blank because it is populated by caller
          },
          isOwn: false,
          content: {
            type: 'm.text',
            text: 'Foo message',
            isEdited: false,
            threadId: 'testThreadId',
            repliedToMessageId: 'testReplyId',
          },
          reactions: [],
          receipts: [],
        },
      )
    })
  })
})
