/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { ChatSummaryEntity } from './chatSummaryEntity'
import {
  MessageEntity,
  MessageMentionEntity,
  RedactReasonEntity,
  SearchMessagesItemEntity,
} from './messageEntity'
import { PollResponsesEntity, PollTypeEntity } from './pollEntity'
import { ThumbnailInfoEntity } from './thumbnailInfoEntity'
import { Recipient } from '../../../../public'
import { MediaCredentialEntity } from '../media/mediaCredentialEntity'

/**
 * Input for `MessagingService.sendMessage` method.
 *
 * @interface SendMessageInput
 * @property {Recipient} recipient The target recipient.
 * @property {string} message The message content to send.
 * @property {MessageMentionEntity[]} mentions A list of mentions included in the message.
 *  Use this to notify specific handles (`{ type: 'Handle', handleId, name }`) or all participants in a chat
 *  (`{ type: 'Chat' }`).
 * @property {number} clientMessageDuration (Optional) The locally managed duration this message should
 *  exist client side before self-destructing.
 * @property {number} serverMessageDuration (Optional) The absolute duration this message should exist
 *  server side before self-destructing.
 */
export interface SendMessageInput {
  recipient: Recipient
  message: string
  mentions: MessageMentionEntity[]
  clientMessageDuration?: number
  serverMessageDuration?: number
}

/**
 * Input for `MessagingService.sendThreadMessage` method.
 *
 * @interface SendThreadMessageInput
 * @property {Recipient} recipient The target recipient.
 * @property {string} message The message content to send.
 * @property {string} threadId Identifier for the root message of the thread.
 * @property {MessageMentionEntity[]} mentions A list of mentions included in the message.
 *  Use this to notify specific handles (`{ type: 'Handle', handleId, name }`) or all participants in a chat
 *  (`{ type: 'Chat' }`).
 * @property {number} clientMessageDuration (Optional) The locally managed duration this message should
 *  exist client side before self-destructing.
 * @property {number} serverMessageDuration (Optional) The absolute duration this message should exist
 *  server side before self-destructing.
 */
export interface SendThreadMessageInput {
  recipient: Recipient
  message: string
  threadId: string
  mentions: MessageMentionEntity[]
  clientMessageDuration?: number
  serverMessageDuration?: number
}

/**
 * Input for `MessagingService.sendReplyMessage` method.
 *
 * @interface SendReplyMessageInput
 * @property {Recipient} recipient The target recipient.
 * @property {string} message The message content to send.
 * @property {string} replyToMessageId Identifier for the message that this message is a reply to.
 * @property {MessageMentionEntity[]} mentions A list of mentions included in the message.
 *  Use this to notify specific handles (`{ type: 'Handle', handleId, name }`) or all participants in a chat
 *  (`{ type: 'Chat' }`).
 * @property {number} clientMessageDuration (Optional) The locally managed duration this message should
 *  exist client side before self-destructing.
 * @property {number} serverMessageDuration (Optional) The absolute duration this message should exist
 *  server side before self-destructing.
 */
export interface SendReplyMessageInput {
  recipient: Recipient
  message: string
  replyToMessageId: string
  mentions: MessageMentionEntity[]
  clientMessageDuration?: number
  serverMessageDuration?: number
}

/**
 * Input for `MessagingService.sendMedia` method.
 *
 * @interface SendMediaInput
 * @property {Recipient} recipient The target recipient.
 * @property {ArrayBuffer} file The media file to send.
 * @property {string} fileName The name of the media file.
 * @property {string} fileType The MIME type of the media file.
 * @property {number} fileSize The size of the media file in bytes.
 * @property {MediaCredentialEntity} mediaCredential The media credential for granting client S3 bucket access.
 * @property {string} caption (Optional) The caption text for the media file.
 * @property {string} mentions (Optional) The list of mentions in the caption.
 * @property {ArrayBuffer} thumbnail (Optional) The file containing the thumbnail.
 * @property {ThumbnailInfoEntity} thumbnailInfo (Optional) The thumbnail image information.
 * @property {string} threadId (Optional) The message identifier that the new message will be
 *  associated with when creating or replying in a message thread.
 * @property {string} replyToMessageId (Optional) The message identifier that the new message
 *  will be associated with when creating quoted message replies.
 * @property {number} clientMessageDuration (Optional) The locally managed duration this message should
 *  exist client side before self-destructing.
 * @property {number} serverMessageDuration (Optional) The absolute duration this message should exist
 *  server side before self-destructing.
 */
export interface SendMediaInput {
  recipient: Recipient
  file: ArrayBuffer
  fileName: string
  fileType: string
  fileSize: number
  mediaCredential: MediaCredentialEntity
  caption?: string
  mentions?: MessageMentionEntity[]
  thumbnail?: ArrayBuffer
  thumbnailInfo?: ThumbnailInfoEntity
  threadId?: string
  replyToMessageId?: string
  clientMessageDuration?: number
  serverMessageDuration?: number
}

/**
 * Input for `MessagingService.editMediaCaption` method.
 *
 * @interface EditMediaCaptionInput
 * @property {Recipient} recipient The target recipient.
 * @property {string} messageId The identifier of the message to edit.
 * @property {string} message The new caption text that will replace the older caption.
 * @property {MessageMention[]} mentions The list of mentions in the caption.
 */
export interface EditMediaCaptionInput {
  recipient: Recipient
  messageId: string
  message: string
  mentions: MessageMentionEntity[]
}

/**
 * Input for `MessagingService.get` method.
 *
 * @interface GetMessageInput
 * @property {Recipient} recipient The target recipient.
 * @property {string} messageId The identifier of the message to retrieve.
 */
export interface GetMessageInput {
  recipient: Recipient
  messageId: string
}

/**
 * Input for `MessagingService.edit` method.
 *
 * @interface EditMessageInput
 * @property {Recipient} recipient The target recipient.
 * @property {string} messageId The identifier of the message to edit.
 * @property {string} message The new message content.
 */
export interface EditMessageInput {
  recipient: Recipient
  messageId: string
  message: string
}

/**
 * Input for `MessagingService.delete` method.
 *
 * @interface DeleteMessageInput
 * @property {Recipient} recipient The target recipient.
 * @property {string} messageId The identifier of the message to delete.
 * @property {RedactReasonEntity} reason The reason for deleting the message.
 */
export interface DeleteMessageInput {
  recipient: Recipient
  messageId: string
  reason?: RedactReasonEntity
}

/**
 * Input for `MessagingService.list` method.
 *
 * @interface ListMessagesInput
 * @property {Recipient} recipient The target recipient.
 * @property {number} limit Number of records to return.
 * @property {string} nextToken A token generated by a previous call to `MessagingService.list`.
 *  This allows for pagination.
 */
export interface ListMessagesInput {
  recipient: Recipient
  limit?: number
  nextToken?: string
}

/**
 * Output for `MessagingService.list` method.
 *
 * @interface ListMessagesOutput
 * @property {MessageEntity[]} messages The list of messages retrieved in this query.
 * @property {string} nextToken A token generated by a previous call. This allows for pagination.
 */
export interface ListMessagesOutput {
  messages: MessageEntity[]
  nextToken?: string
}

/**
 * Input for `MessagingService.getChatSummaries` method.
 *
 * @interface GetChatSummariesInput
 * @property {Recipient[]} recipients The recipients to retrieve chat summaries for.
 */
export interface GetChatSummariesInput {
  recipients: Recipient[]
}

/**
 * Input for `MessagingService.searchMessages` method.
 *
 * @interface SearchMessagesInput
 * @property {string} searchText The keywords used to search for messages.
 * @property {number} limit Number of records to return.
 * @property {string} nextToken A token generated by a previous call to `MessagingService.searchMessages`.
 *  This allows for pagination.
 */
export interface SearchMessagesInput {
  searchText: string
  limit?: number
  nextToken?: string
}

/**
 * Output for `MessagingService.searchMessages` method.
 *
 * @interface SearchMessagesOutput
 * @property {SearchMessagesItemEntity[]} messages The list of searched message items retrieved in this query.
 * @property {string} nextToken A token generated by a previous call. This allows for pagination.
 */
export interface SearchMessagesOutput {
  messages: SearchMessagesItemEntity[]
  nextToken?: string
}

/**
 * Input for `MessagingService.markAsRead` method.
 *
 * @interface MarkAsReadInput
 * @property {Recipient} recipient The target recipient.
 */
export interface MarkAsReadInput {
  recipient: Recipient
}

/**
 * Input for `MessagingService.sendTypingNotification` method.
 *
 * @interface SendTypingNotificationInput
 * @property {Recipient} recipient The target recipient.
 * @property {boolean} isTyping Whether the user is typing.
 */
export interface SendTypingNotificationInput {
  recipient: Recipient
  isTyping: boolean
}

/**
 * Input for `MessagingService.toggleReaction` method.
 *
 * @interface ToggleReactionInput
 * @property {Recipient} recipient The target recipient.
 * @property {string} messageId The identifier of the message to toggle a reaction on.
 * @property {string} content The reaction string to attach to the message.
 */
export interface ToggleReactionInput {
  recipient: Recipient
  messageId: string
  content: string
}

/**
 * Input for `MessagingService.pinUnpinMessage` method.
 *
 * @interface PinUnpinMessageInput
 * @property {Recipient} recipient The target recipient.
 * @property {string} messageId The identifier of the message to pin or unpin.
 */
export interface PinUnpinMessageInput {
  recipient: Recipient
  messageId: string
}

/**
 * Input for `MessagingService.getPinnedMessages` method.
 *
 * @interface GetPinnedMessagesInput
 * @property {Recipient} recipient The target recipient.
 */
export interface GetPinnedMessagesInput {
  recipient: Recipient
}

/**
 * Input for `MessagingService.createPoll` method.
 *
 * @interface CreatePollInput
 * @property {Recipient} recipient The target recipient.
 * @property {PollTypeEntity} type Whether or not the poll participants can see the poll results.
 * @property {string} question The question being posed for the poll.
 * @property {string[]} answers The possible answers to the poll.
 * @property {number} maxSelections The maximum number of selections for the poll.
 */
export interface CreatePollInput {
  recipient: Recipient
  type: PollTypeEntity
  question: string
  answers: string[]
  maxSelections: number
}

/**
 * Input for `MessagingService.sendPollResponse` method.
 *
 * @interface SendPollResponseInput
 * @property {Recipient} recipient The target recipient.
 * @property {string} pollId The identifier of the poll to respond to.
 * @property {string[]} answers The answers to the poll.
 */
export interface SendPollResponseInput {
  recipient: Recipient
  pollId: string
  answers: string[]
}

/**
 * Input for `MessagingService.editPoll` method.
 *
 * @interface EditPollInput
 * @property {Recipient} recipient The target recipient.
 * @property {string} pollId The identifier of the poll to edit.
 * @property {PollTypeEntity} type Whether or not the poll participants can see the poll results.
 * @property {string} question The question being posed for the poll.
 * @property {string[]} answers The possible answers to the poll.
 * @property {number} maxSelections The maximum number of selections for the poll.
 */
export interface EditPollInput {
  recipient: Recipient
  pollId: string
  type: PollTypeEntity
  question: string
  answers: string[]
  maxSelections: number
}

/**
 * Input for `MessagingService.endPoll` method.
 *
 * @interface EndPollInput
 * @property {Recipient} recipient The target recipient.
 * @property {string} pollId The identifier of the poll to end.
 */
export interface EndPollInput {
  recipient: Recipient
  pollId: string
}

/**
 * Input for `MessagingService.getPollResponses` method.
 *
 * @interface GetPollResponsesInput
 * @property {Recipient} recipient The target recipient.
 * @property {string} pollId The identifier of the poll to tally responses for.
 */
export interface GetPollResponsesInput {
  recipient: Recipient
  pollId: string
}

/**
 * Core entity representation of a messaging service used in business logic. Used to perform CRUD operations for messages.
 *
 * @interface MessagingService
 */
export interface MessagingService {
  /**
   * Send a message.
   *
   * @param {SendMessageInput} input Parameters used to send a message.
   */
  sendMessage(input: SendMessageInput): Promise<void>

  /**
   * Send a thread message.
   *
   * @param {SendThreadMessageInput} input Parameters used to send a thread message.
   */
  sendThread(input: SendMessageInput): Promise<void>

  /**
   * Send a reply message.
   *
   * @param {SendReplyMessageInput} input Parameters used to send a reply message.
   */
  sendReply(input: SendReplyMessageInput): Promise<void>

  /**
   * Send a media message.
   *
   * @param {SendMediaInput} input Parameters used to send a media message.
   */
  sendMedia(input: SendMediaInput): Promise<void>

  /**
   * Retrieve a message.
   *
   * @param {GetMessageInput} input Parameters used to retrieve a message.
   * @returns {MessageEntity | undefined} The retrieved message, or undefined if not found.
   */
  get(input: GetMessageInput): Promise<MessageEntity | undefined>

  /**
   * Edit a message.
   *
   * @param {EditMessageInput} input Parameters used to edit a message.
   */
  edit(input: EditMessageInput): Promise<void>

  /**
   * Delete a message.
   *
   * @param {DeleteMessageInput} input Parameters used to delete a message.
   */
  delete(input: DeleteMessageInput): Promise<void>

  /**
   * Retrieve a list of messages.
   *
   * @param {ListMessagesInput} input Parameters used to retrieve a list of messages.
   * @returns {Promise<ListMessagesOutput>} A list of messages matching the search criteria.
   */
  list(input: ListMessagesInput): Promise<ListMessagesOutput>

  /**
   * Retrieve a list of messages from all unencrypted rooms matching search keywords.
   *
   * @param {SearchMessagesInput} input Parameters used to search for messages.
   * @returns {Promise<SearchMessagesOutput>} A list of messages from all rooms matching the search keywords.
   */
  searchMessages(input: SearchMessagesInput): Promise<SearchMessagesOutput>

  /**
   * Retrieve chat summaries.
   *
   * @param {GetChatSummariesInput} input Parameters used to retrieve chat summaries.
   * @returns {Promise<ChatSummaryEntity[]>} A list of chat summaries matching the search criteria.
   */
  getChatSummaries(input: GetChatSummariesInput): Promise<ChatSummaryEntity[]>

  /**
   * Mark a message as read.
   *
   * @param {MarkAsReadInput} input Parameters used to mark a message as read.
   */
  markAsRead(input: MarkAsReadInput): Promise<void>

  /**
   * Send a typing notification.
   *
   * @param {SendTypingNotificationInput} input Parameters used to send a typing notification.
   */
  sendTypingNotification(input: SendTypingNotificationInput): Promise<void>

  /**
   * Toggle a reaction on a message.
   *
   * @param {ToggleReactionInput} input Parameters used to toggle a reaction on a message.
   */
  toggleReaction(input: ToggleReactionInput): Promise<void>

  /**
   * Pins or unpins an existing message, depending on whether or not the message is already pinned.
   *
   * @param {PinUnpinMessageInput} input Parameters used to pin or unpin an existing message.
   */
  pinUnpinMessage(input: PinUnpinMessageInput): Promise<void>

  /**
   * Retrieve a list of pinned messages.
   *
   * @param {GetPinnedMessagesInput} input Parameters used to retrieve a list of pinned messages.
   * @returns {Promise<MessageEntity[]>} A list of pinned messages for a recipient.
   */
  getPinnedMessages(input: GetPinnedMessagesInput): Promise<MessageEntity[]>

  /**
   * Create a poll.
   *
   * @param {CreatePollInput} input Parameters used to create a poll.
   */
  createPoll(input: CreatePollInput): Promise<void>

  /**
   * Send a poll response.
   *
   * @param {SendPollResponseInput} input Parameters used to send a poll response.
   */
  sendPollResponse(input: SendPollResponseInput): Promise<void>

  /**
   * Edit an existing poll.
   *
   * @param {EditPollInput} input Parameters used to edit a poll.
   */
  editPoll(input: EditPollInput): Promise<void>

  /**
   * End a poll.
   *
   * @param {EndPollInput} input Parameters used to end a poll.
   */
  endPoll(input: EndPollInput): Promise<void>

  /**
   * Tally the responses for a given poll.
   *
   * @param {GetPollResponsesInput} input Parameters used to tally the responses for a poll.
   * @returns {Promise<PollResponsesEntity>} The tallied responses for the poll.
   */
  getPollResponses(input: GetPollResponsesInput): Promise<PollResponsesEntity>
}
