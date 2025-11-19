/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { IEventWithRoomId, MsgType } from 'matrix-js-sdk/lib/matrix'
import { HandleId, Recipient, SearchMessagesItem } from '../../../../public'
import { SearchMessagesItemEntity } from '../../../domain/entities/messaging/messageEntity'

export class SearchMessagesItemTransformer {
  fromEntityToAPI(entity: SearchMessagesItemEntity): SearchMessagesItem {
    return {
      messageId: entity.messageId,
      recipient: entity.recipient,
      senderHandleId: entity.senderHandleId,
      repliedToMessageId: entity.repliedToMessageId,
      body: entity.body,
      filename: entity.filename,
      mimeType: entity.mimeType,
      timestamp: entity.timestamp,
    }
  }

  fromMatrixToEntity(event: IEventWithRoomId): SearchMessagesItemEntity {
    const content = event.content
    const contentType = content.msgtype

    let filename: string | undefined
    const mimeType = content.info?.mimetype

    switch (contentType) {
      case MsgType.Image:
        filename = content.filename ?? 'image'
        break
      case MsgType.File:
        filename = content.filename ?? 'file'
        break
      case MsgType.Audio:
        filename = content.filename ?? 'audio'
        break
      case MsgType.Video:
        filename = content.filename ?? 'video'
        break
      default:
        filename = undefined
        break
    }
    return {
      messageId: event.event_id,
      recipient: { value: event.room_id } as Recipient,
      senderHandleId: new HandleId(event.sender),
      repliedToMessageId: content['m.relates_to']?.['m.in_reply_to']?.event_id,
      body: content.body,
      filename,
      mimeType,
      timestamp: event.origin_server_ts,
    }
  }
}
