/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { EventType, IEventWithRoomId, MsgType } from 'matrix-js-sdk/lib/matrix'
import { SearchMessagesItemTransformer } from '../../../../../../src/private/data/messaging/transformer/searchMessagesItemTransformer'
import { HandleId } from '../../../../../../src/public'
import { APIDataFactory } from '../../../../../data-factory/api'
import { EntityDataFactory } from '../../../../../data-factory/entity'

describe('SearchMessagesItemTransformer Test Suite', () => {
  const instanceUnderTest = new SearchMessagesItemTransformer()

  describe('fromEntityToAPI', () => {
    it('transforms from entity to API type successfully', () => {
      expect(
        instanceUnderTest.fromEntityToAPI(EntityDataFactory.searchMessageItem),
      ).toStrictEqual(APIDataFactory.searchMessageItem)
    })
  })

  describe('fromMatrixToEntity', () => {
    it.each`
      msgType          | filename       | mimetype
      ${MsgType.Image} | ${'pic.png'}   | ${'image/png'}
      ${MsgType.File}  | ${'foo.pdf'}   | ${'application/pdf'}
      ${MsgType.Audio} | ${'music.mp3'} | ${'audio/mpeg'}
      ${MsgType.Video} | ${'bar.mp4'}   | ${'video/mp4'}
      ${MsgType.Text}  | ${undefined}   | ${undefined}
    `(
      'transforms from matrix message $msgType type to correct entity type successfully',
      ({ msgType, filename, mimetype }) => {
        const eventMsg: IEventWithRoomId = {
          room_id: 'testRoomId',
          event_id: 'testMessageId',
          sender: 'testHandleId',
          origin_server_ts: 1,
          content: {
            msgtype: msgType,
            filename,
            body: 'Foo message',
            info: { mimetype },
          },
          type: EventType.RoomMessage,
          unsigned: {},
        }
        expect(instanceUnderTest.fromMatrixToEntity(eventMsg)).toStrictEqual({
          messageId: 'testMessageId',
          recipient: { value: 'testRoomId' },
          repliedToMessageId: undefined,
          senderHandleId: new HandleId('testHandleId'),
          body: 'Foo message',
          filename,
          mimeType: mimetype,
          timestamp: 1,
        })
      },
    )
  })
})
