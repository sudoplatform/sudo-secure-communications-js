/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EventStatus,
  EventType,
  IContent,
  M_POLL_RESPONSE,
  M_POLL_START,
  MatrixEvent,
  MsgType,
  PollResponseSubtype,
  PollStartSubtype,
} from 'matrix-js-sdk/lib/matrix'
import { MessageReactionTransformer } from './messageReactionTransformer'
import { MessageReceiptTransformer } from './messageReceiptTransformer'
import { MessageStateTransformer } from './messageStateTransformer'
import { HandleId, Message, SecureCommsError } from '../../../../public'
import {
  Audio,
  BaseMessageContent,
  Emote,
  File,
  Image,
  KeyVerificationRequest,
  Location,
  MembershipChange,
  MessageContent,
  Notice,
  Poll,
  PollResponse,
  RedactedMessage,
  Text,
  Video,
} from '../../../../public/typings/messageContent'
import { HandleEntity } from '../../../domain/entities/handle/handleEntity'
import {
  MessageEntity,
  MessageStateEntity,
} from '../../../domain/entities/messaging/messageEntity'
import { MembershipStateTransformer } from '../../common/transformer/membershipStateTransformer'

export class MessageTransformer {
  fromAPIToEntity(data: Message): MessageEntity {
    const messageStateTransformer = new MessageStateTransformer()
    const messageReactionTransformer = new MessageReactionTransformer()
    const messageReceiptTransformer = new MessageReceiptTransformer()
    return {
      messageId: data.messageId,
      state: messageStateTransformer.fromAPIToEntity(data.state),
      timestamp: data.timestamp,
      senderHandle: data.senderHandle,
      isOwn: data.isOwn,
      content: data.content,
      reactions: data.reactions.map((reaction) =>
        messageReactionTransformer.fromAPIToEntity(reaction),
      ),
      receipts: data.receipts.map((receipt) =>
        messageReceiptTransformer.fromAPIToEntity(receipt),
      ),
      isVerified: data.isVerified,
    }
  }

  fromEntityToAPI(entity: MessageEntity): Message {
    const messageStateTransformer = new MessageStateTransformer()
    const messageReactionTransformer = new MessageReactionTransformer()
    const messageReceiptTransformer = new MessageReceiptTransformer()
    return {
      messageId: entity.messageId,
      state: messageStateTransformer.fromEntityToAPI(entity.state),
      timestamp: entity.timestamp,
      senderHandle: entity.senderHandle,
      isOwn: entity.isOwn,
      content: entity.content,
      reactions: entity.reactions.map((reaction) =>
        messageReactionTransformer.fromEntityToAPI(reaction),
      ),
      receipts: entity.receipts.map((receipt) =>
        messageReceiptTransformer.fromEntityToAPI(receipt),
      ),
      isVerified: entity.isVerified,
    }
  }

  fromMatrixToEntity(
    userId: string,
    event: MatrixEvent,
  ): MessageEntity | undefined {
    const eventId = event.getId()
    if (!eventId) {
      return undefined
    }
    let mappedContent: MessageContent = {} as BaseMessageContent

    const eventType = event.getType()
    const eventContent = event.getContent()
    if (!eventContent || Object.keys(eventContent).length === 0) {
      if (event.isRedacted()) {
        mappedContent = {
          ...mappedContent,
          redactedBecause: event.getRedactionEvent(),
        } as RedactedMessage
      } else {
        throw new SecureCommsError(
          'Event is not redacted but content is missing',
        )
      }
    } else {
      switch (eventType) {
        case EventType.RoomMessage:
          mappedContent = {
            ...mappedContent,
            ...this.messageContentFromMessageEvent(eventContent),
          }
          break
        case EventType.RoomMember:
          mappedContent = {
            ...mappedContent,
            ...this.messageContentFromMemberEvent(
              eventContent,
              event.getStateKey(),
            ),
          }
          break
        case EventType.PollStart:
        case M_POLL_RESPONSE.name: // unstable
          // case M_POLL_END.name: // unstable // No-op?
          mappedContent = {
            ...mappedContent,
            ...this.messageContentFromPollEvent(event),
          }
          break
        default:
      }
    }

    if (eventContent['m.relates_to']?.['rel_type'] === 'm.thread') {
      ;(mappedContent as BaseMessageContent).threadId =
        eventContent['m.relates_to']?.event_id
    }

    if (eventContent['m.relates_to']?.['m.in_reply_to']) {
      ;(mappedContent as BaseMessageContent).repliedToMessageId =
        eventContent['m.relates_to']?.['m.in_reply_to'].event_id
    }

    let state: MessageStateEntity
    const pendingStatuses = new Set<EventStatus>([
      EventStatus.ENCRYPTING,
      EventStatus.QUEUED,
      EventStatus.SENDING,
    ])
    if (event.status && pendingStatuses.has(event.status)) {
      state = MessageStateEntity.PENDING
    } else if (event.status === EventStatus.SENT || event.event?.event_id) {
      state = MessageStateEntity.COMMITTED
    } else {
      state = MessageStateEntity.FAILED
    }

    const message: MessageEntity = {
      messageId: eventId,
      content: mappedContent,
      senderHandle: {
        handleId: new HandleId(event.getSender() ?? ''),
        name: '', // Populated by caller
      } as HandleEntity,
      timestamp: event.getTs(),
      state,
      isOwn: userId === event.getSender(),
      reactions: [], // Populated by caller
      receipts: [], // Populated by caller
    }
    return message
  }

  // MARK: Helper - MemberEv

  private messageContentFromMemberEvent(
    eventContent: IContent,
    stateKey: string | undefined,
  ): MessageContent {
    const membership = eventContent.membership
    if (!membership) {
      throw new SecureCommsError('Membership state is missing')
    }
    const membershipStateTransformer = new MembershipStateTransformer()
    return {
      state: membershipStateTransformer.fromEntityToAPI(
        membershipStateTransformer.fromMatrixToEntity(membership),
      ),
      handle: {
        handleId: new HandleId(stateKey ?? ''),
        name: '',
      } as HandleEntity,
    } as MembershipChange
  }

  // MARK: Helper - PollEv

  private messageContentFromPollEvent(event: MatrixEvent): MessageContent {
    const eventType = event.getType()
    let mappedContent: MessageContent = {
      type: eventType,
      isEdited: false,
    }
    switch (eventType) {
      case M_POLL_START.name:
        const pollStartEventContent = event.getContent()[
          M_POLL_START.name
        ] as PollStartSubtype
        mappedContent = {
          ...mappedContent,
          kind: pollStartEventContent.kind,
          question:
            (pollStartEventContent.question as any)[
              'org.matrix.msc1767.text'
            ] ||
            (pollStartEventContent.question as any).body ||
            pollStartEventContent.question ||
            '', // NOTE: shall we throw error if question is missing after all fallbacks?
          answers: pollStartEventContent.answers.map(
            (answer) =>
              (answer as any)['org.matrix.msc1767.text'] ||
              (answer as any).body ||
              answer ||
              '', // NOTE: shall we throw error if answer is missing after all fallbacks?
          ),
          maxSelections: pollStartEventContent.max_selections || 1,
        } as Poll
        break
      case M_POLL_RESPONSE.name:
        const pollResponseEventContent = event.getContent()[
          M_POLL_RESPONSE.name
        ] as PollResponseSubtype
        mappedContent = {
          ...mappedContent,
          pollId: event.getContent()['m.relates_to']?.event_id,
          answers: pollResponseEventContent.answers.map(
            (answer) =>
              (answer as any)['org.matrix.msc1767.text'] ||
              (answer as any).body ||
              answer ||
              '', // shall we throw error if answer is missing?
          ),
        } as PollResponse
        break
    }
    return mappedContent
  }

  // MARK: Helper - MsgEv

  private messageContentFromMessageEvent(
    eventContent: IContent,
  ): MessageContent {
    let content = eventContent
    if (content['m.new_content']) {
      // this is a replacement event, so we need to use the new content
      content = content['m.new_content']
    }
    const contentType = content.msgtype
    let mappedContent: MessageContent = {
      type: contentType ?? '',
      isEdited: false,
    }
    switch (contentType) {
      case MsgType.Text:
        mappedContent = {
          ...mappedContent,
          text: content.body,
        } as Text
        break
      case MsgType.Emote:
        mappedContent = {
          ...mappedContent,
          emote: content.body,
        } as Emote
        break
      case MsgType.Notice:
        mappedContent = {
          ...mappedContent,
          notice: content.body,
        } as Notice
        break
      case MsgType.Image:
        mappedContent = {
          ...mappedContent,
          ...this.getImageContent(content),
        } as Image
        break
      case MsgType.File:
        mappedContent = {
          ...mappedContent,
          ...this.getFileContent(content),
        } as File
        break
      case MsgType.Audio:
        mappedContent = {
          ...mappedContent,
          ...this.getAudioContent(content),
        } as Audio
        break
      case MsgType.Video:
        mappedContent = {
          ...mappedContent,
          ...this.getVideoContent(content),
        } as Video
        break
      case MsgType.Location:
        mappedContent = {
          ...mappedContent,
          description: content.body,
          geoUri: content.geo_uri,
        } as Location
        break
      case MsgType.KeyVerificationRequest:
        mappedContent = {
          ...mappedContent,
          body: content.body,
          fromDevice: content.from_device,
          methods: content.methods,
          timestamp: content.timestamp,
        } as KeyVerificationRequest
        break
      default:
        throw new SecureCommsError(
          `Unsupported message content type: ${contentType}`,
        )
    }
    return mappedContent
  }

  private getImageContent(content: IContent): Image {
    return {
      uri: content.url,
      info: {
        mimeType: content.info?.mimetype,
        size: content.info?.size,
        width: content.info?.w,
        height: content.info?.h,
        filename: content.body || 'image',
      },
      thumbnailUri: content.info?.thumbnail_url,
      thumbnailInfo: {
        // these defaults to an empty jpeg if thumbnail_info is not present
        width: content.info?.thumbnail_info?.w || 0,
        height: content.info?.thumbnail_info?.h || 0,
        blurHash: content.info?.thumbnail_info?.blurhash || '',
        mimeType: content.info?.thumbnail_info?.mimetype || 'image/jpeg',
        size: content.info?.thumbnail_info?.size || 0,
      },
      encryptedFile: content.file
        ? {
            url: content.file.url,
            key: content.file.key,
            iv: content.file.iv,
            hashes: content.file.hashes,
            v: content.file.v,
          }
        : undefined,
    } as Image
  }

  private getFileContent(content: IContent): File {
    return {
      uri: content.url,
      info: {
        mimeType: content.info?.mimetype,
        size: content.info?.size,
        filename: content.body || 'file',
      },
      encryptedFile: content.file
        ? {
            url: content.file.url,
            key: content.file.key,
            iv: content.file.iv,
            hashes: content.file.hashes,
            v: content.file.v,
          }
        : undefined,
    } as File
  }

  private getAudioContent(content: IContent): Audio {
    return {
      uri: content.url,
      info: {
        mimeType: content.info?.mimetype,
        size: content.info?.size,
        duration: content.info?.duration,
        filename: content.body || 'audio',
      },
      encryptedFile: content.file
        ? {
            url: content.file.url,
            key: content.file.key,
            iv: content.file.iv,
            hashes: content.file.hashes,
            v: content.file.v,
          }
        : undefined,
    } as Audio
  }

  private getVideoContent(content: IContent): Video {
    return {
      uri: content.url,
      info: {
        mimeType: content.info?.mimetype,
        size: content.info?.size,
        width: content.info?.w,
        height: content.info?.h,
        duration: content.info?.duration,
        filename: content.body || 'video',
      },
      thumbnailUri: content.info?.thumbnail_url,
      thumbnailInfo: {
        width: content.info?.thumbnail_info?.w,
        height: content.info?.thumbnail_info?.h,
        blurHash: content.info?.thumbnail_info?.blurhash,
        mimeType: content.info?.thumbnail_info?.mimetype,
        size: content.info?.thumbnail_info?.size,
      },
      encryptedFile: content.file
        ? {
            url: content.file.url,
            key: content.file.key,
            iv: content.file.iv,
            hashes: content.file.hashes,
            v: content.file.v,
          }
        : undefined,
    } as Video
  }
}
