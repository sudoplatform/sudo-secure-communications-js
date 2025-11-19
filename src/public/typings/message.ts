/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { Handle, HandleId } from './handle'
import { MessageContent } from './messageContent'
import { Recipient } from './recipient'

/**
 * The Sudo Platform SDK representation of a Message that have been either sent or received.
 *
 * @interface Message
 * @property {string} messageId Unique identifier of the message.
 * @property {MessageState} state The current state of the message.
 * @property {number} timestamp The time the message was sent or received.
 * @property {Handle} senderHandle The message sender's handle.
 * @property {boolean} isOwn True if the message was sent by the current handle, false if not.
 * @property {MessageContent} content The message content object. See the {@link MessageContent}
 *  type for all possible content types.
 * @property {MessageReaction[]} reactions A list of all message reactions associated with the message.
 * @property {MessageReceipt[]} receipts A list of all read-receipts associated with the message.
 * @property {boolean} isVerified If available, true if the message sender's device was verified, false if not.
 *  Verification information is not available for all messages, for example system messages. In this case the 
 *  field will be undefined.
 */
export interface Message {
  messageId: string
  state: MessageState
  timestamp: number
  senderHandle: Handle
  isOwn: boolean
  content: MessageContent
  reactions: MessageReaction[]
  receipts: MessageReceipt[]
  isVerified?: boolean
}

/**
 * Representation of the message returned by performing server side unencrypted event search
 * 
 * @interface SearchMessagesItem
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
export interface SearchMessagesItem {
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
export enum MessageState {
  PENDING = 'PENDING',
  COMMITTED = 'COMMITTED',
  FAILED = 'FAILED'
}

/**
 * Representation of the message reaction information.
 * 
 * @interface MessageReaction
 * @property {string} content The reaction content string. This may be an emoji or any other app-specific string.
 * @property {number} count The total number of handles who reacted with this reaction.
 * @property {HandleId[]} senderHandleIds The handle identifiers that reacted with this reaction.
 */
export interface MessageReaction {
  content: string
  count: number
  senderHandleIds: HandleId[]
}

/**
 * Representation of the message read receipt.
 * 
 * @interface MessageReceipt
 * @property {number} timestamp The timestamp of the receipt.
 * @property {string} handleId The handle identifier that sent the receipt.
 */
export interface MessageReceipt {
  timestamp: number
  handleId: HandleId
}

/**
 * Representation of a message handle mention.
 * 
 * @interface HandleMention
 * @property {string} type The type of the mention. Will be 'Handle' for 
 *  the case of a handle mention.
 * @property {HandleId} handleId The handleId of the handle being mentioned.
 * @property {string} name The name of the handle being mentioned.
 */
export interface HandleMention {
  type: 'Handle'
  handleId: HandleId
  name: string
}

/**
 * Representation of a message chat (Group or Channel) mention.
 * 
 * @interface ChatMention
 * @property {string} type The type of the mention. Will be 'Chat' for 
 *  the case of a chat mention.
 */
export interface ChatMention {
  type: 'Chat'
}

/**
 * Representation of a message mention type. This will either be a handle mention 
 *  or chat mention.
 */ 
export type MessageMention = HandleMention | ChatMention


/**
 * Redaction reason for a user deleting their own message.
 * 
 * @interface DeleteOwnRedactReason
 * @property {string} type The redaction type.
 * @property {string} threadId (Optional) The thread Id of the message being deleted.
 */
export interface DeleteOwnRedactReason {
  type: 'deleteOwn'
  threadId?: string
}

/**
 * Redaction reason for editing a reaction.
 * 
 * @interface EditReactionRedactReason
 * @property {string} type The redaction type.
 */
export interface EditReactionRedactReason {
  type: 'editReaction'
}

/**
 * Redaction reason due to moderation.
 * 
 * @interface ModerationRedactReason
 * @property {string} type The redaction type.
 * @property {string} reason The moderation reason for the message deletion.
 * @property {boolean} hide Whether the message should be hidden.
 * @property {string} threadId (Optional) The thread Id of the message being deleted.
 */
export interface ModerationRedactReason {
  type: 'moderation'
  reason: string
  hide: boolean
  threadId?: string
}

/**
 * Unknown redaction reason.
 * 
 * @interface UnknownRedactReason
 * @property {string} type The redaction type.
 */
export interface UnknownRedactReason {
  type: 'unknown'
}

/**
 * Representation of a redaction reason. This will be one of several types indicating why a message was redacted.
 */
export type RedactReason =
  | DeleteOwnRedactReason
  | EditReactionRedactReason
  | ModerationRedactReason
  | UnknownRedactReason
