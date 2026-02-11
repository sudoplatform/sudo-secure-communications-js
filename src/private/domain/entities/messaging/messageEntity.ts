/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { HandleId, MessageContent, Recipient } from '../../../../public'
import { HandleEntity } from '../handle/handleEntity'

/**
 * Core entity representation of a message business rule.
 *
 * @interface MessageEntity
 * @property {string} messageId Unique identifier of the message.
 * @property {MessageStateEntity} state The current state of the message.
 * @property {number} timestamp The time the message was sent or received.
 * @property {HandleEntity} senderHandle The message sender's handle.
 * @property {boolean} isOwn True if the message was sent by the current handle, false if not.
 * @property {MessageContent} content The message content object. See the {@link MessageContent}
 *  type for all possible content types.
 * @property {MessageReactionEntity[]} reactions A list of all message reactions associated with the message.
 * @property {MessageReceiptEntity[]} receipts A list of all read-receipts associated with the message.
 * @property {boolean} isVerified If available, true if the message sender's device was verified, false if not.
 *  Verification information is not available for all messages, for example system messages. In this case the
 *  field will be undefined.
 */
export interface MessageEntity {
  messageId: string
  state: MessageStateEntity
  timestamp: number
  senderHandle: HandleEntity
  isOwn: boolean
  content: MessageContent
  reactions: MessageReactionEntity[]
  receipts: MessageReceiptEntity[]
  isVerified?: boolean
}

/**
 * Core entity representation of the message item returned by performing server side unencrypted event search
 *
 * @interface SearchMessagesItemEntity
 * @property {string} messageId Unique identifier of the message.
 * @property {Recipient} recipient The recipient chat that the message is located.
 * @property {string} senderHandleId The handle identififer of the message sender.
 * @property {string} repliedToMessageId The message identifier of the message this message
 *  is replying to (if this message is a reply).
 * @property {string} body The body text of the message.
 * @property {string} filename The file name associated with a message attachment.
 * @property {string} mimeType The MIME type associated with a message attachment.
 * @property {number} timestamp The time the message was sent or received.
 */
export interface SearchMessagesItemEntity {
  messageId: string
  recipient: Recipient
  senderHandleId: HandleId
  repliedToMessageId?: string
  body: string
  filename?: string
  mimeType?: string
  timestamp: number
}

/**
 * The state of a message.
 *
 * @property PENDING: The message is in the process of being sent to the server.
 * @property COMMITTED: The message is accepted by the server and has been synced
 *  back to this client, and possibly other handles.
 * @property FAILED: The message failed to send.
 *
 * @enum
 */
export enum MessageStateEntity {
  PENDING = 'PENDING',
  COMMITTED = 'COMMITTED',
  FAILED = 'FAILED',
}

/**
 * Core entity representation of message reaction information.
 *
 * @interface MessageReactionEntity
 * @property {string} content The reaction content string. This may be an emoji or any other app-specific string.
 * @property {number} count The total number of handles who reacted with this reaction.
 * @property {HandleId[]} senderHandleIds The handle identifiers that reacted with this reaction.
 * @property {string[]} eventIds The eventIds of the reaction events of this reaction.
 */
export interface MessageReactionEntity {
  content: string
  count: number
  senderHandleIds: HandleId[]
  eventIds: string[]
}

/**
 * Core entity representation of a message read receipt.
 *
 * @interface MessageReceiptEntity
 * @property {number} timestamp The timestamp of the receipt.
 * @property {string} handleId The handle identifier that sent the receipt.
 */
export interface MessageReceiptEntity {
  timestamp: number
  handleId: HandleId
}

/**
 * Core entity representation of a message handle mention.
 *
 * @interface HandleMentionEntity
 * @property {string} type The type of the mention. Will be 'Handle' for
 *  the case of a handle mention.
 * @property {HandleId} handleId The handleId of the handle being mentioned.
 * @property {string} name The name of the handle being mentioned.
 */
export interface HandleMentionEntity {
  type: 'Handle'
  handleId: HandleId
  name: string
}

/**
 * Core entity representation of a message chat (Group or Channel) mention.
 *
 * @interface ChatMentionEntity
 * @property {string} type The type of the mention. Will be 'Chat' for
 *  the case of a chat mention.
 */
export interface ChatMentionEntity {
  type: 'Chat'
}

/**
 * Core entity representation of a message mention type. This will either be a handle mention
 *  or chat mention.
 */
export type MessageMentionEntity = HandleMentionEntity | ChatMentionEntity

/**
 * Redaction reason for a user deleting their own message.
 *
 * @interface DeleteOwnRedactReasonEntity
 * @property {string} type The redaction type.
 * @property {string} threadId (Optional) The thread Id of the message being deleted.
 */
export interface DeleteOwnRedactReasonEntity {
  type: 'deleteOwn'
  threadId?: string
}

/**
 * Redaction reason for editing a reaction.
 *
 * @interface EditReactionRedactReasonEntity
 * @property {string} type The redaction type.
 */
export interface EditReactionRedactReasonEntity {
  type: 'editReaction'
}

/**
 * Redaction reason due to moderation.
 *
 * @interface ModerationRedactReasonEntity
 * @property {string} type The redaction type.
 * @property {string} reason The moderation reason for the message deletion.
 * @property {boolean} hide Whether the message should be hidden.
 * @property {string} threadId (Optional) The thread Id of the message being deleted.
 */
export interface ModerationRedactReasonEntity {
  type: 'moderation'
  reason: string
  hide: boolean
  threadId?: string
}

/**
 * Unknown redaction reason.
 *
 * @interface UnknownRedactReasonEntity
 * @property {string} type The redaction type.
 */
export interface UnknownRedactReasonEntity {
  type: 'unknown'
}

/**
 * Core entity representation of a redaction reason. This will be one of several types indicating why a message was redacted.
 */
export type RedactReasonEntity =
  | DeleteOwnRedactReasonEntity
  | EditReactionRedactReasonEntity
  | ModerationRedactReasonEntity
  | UnknownRedactReasonEntity
