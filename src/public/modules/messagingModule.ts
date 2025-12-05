/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { DefaultLogger, ListOutput, Logger } from '@sudoplatform/sudo-common'
import { SecureCommsServiceConfig } from '../../private/data/common/config'
import { MediaCredentialManager } from '../../private/data/media/mediaCredentialManager'
import { ChatSummaryTransformer } from '../../private/data/messaging/transformer/chatSummaryTransformer'
import { MessageMentionTransformer } from '../../private/data/messaging/transformer/messageMentionTransformer'
import { MessageTransformer } from '../../private/data/messaging/transformer/messageTransformer'
import { PollResponsesTransformer } from '../../private/data/messaging/transformer/pollResponsesTransformer'
import { PollTypeTransformer } from '../../private/data/messaging/transformer/pollTypeTransformer'
import { SearchMessagesItemTransformer } from '../../private/data/messaging/transformer/searchMessagesItemTransformer'
import { SessionManager } from '../../private/data/session/sessionManager'
import { CreatePollUseCase } from '../../private/domain/use-cases/messaging/createPollUseCase'
import { DeleteMessageUseCase } from '../../private/domain/use-cases/messaging/deleteMessageUseCase'
import { EditMessageUseCase } from '../../private/domain/use-cases/messaging/editMessageUseCase'
import { EditPollUseCase } from '../../private/domain/use-cases/messaging/editPollUseCase'
import { EndPollUseCase } from '../../private/domain/use-cases/messaging/endPollUseCase'
import { GetChatSummariesUseCase } from '../../private/domain/use-cases/messaging/getChatSummariesUseCase'
import { GetMessageUseCase } from '../../private/domain/use-cases/messaging/getMessageUseCase'
import { GetMessagesUseCase } from '../../private/domain/use-cases/messaging/getMessagesUseCase'
import { GetPinnedMessagesUseCase } from '../../private/domain/use-cases/messaging/getPinnedMessagesUseCase'
import { GetPollResponsesUseCase } from '../../private/domain/use-cases/messaging/getPollResponsesUseCase'
import { MarkAsReadUseCase } from '../../private/domain/use-cases/messaging/markAsReadUseCase'
import { PinUnpinMessageUseCase } from '../../private/domain/use-cases/messaging/pinUnpinMessageUseCase'
import { SearchMessagesUseCase } from '../../private/domain/use-cases/messaging/searchMessagesUseCase'
import { SendMediaUseCase } from '../../private/domain/use-cases/messaging/sendMediaUseCase'
import { SendMessageUseCase } from '../../private/domain/use-cases/messaging/sendMessageUseCase'
import { SendPollResponseUseCase } from '../../private/domain/use-cases/messaging/sendPollResponseUseCase'
import { SendReplyMessageUseCase } from '../../private/domain/use-cases/messaging/sendReplyMessageUseCase'
import { SendThreadMessageUseCase } from '../../private/domain/use-cases/messaging/sendThreadMessageUseCase'
import { SendTypingNotificationUseCase } from '../../private/domain/use-cases/messaging/sendTypingNotificationUseCase'
import { ToggleReactionUseCase } from '../../private/domain/use-cases/messaging/toggleReactionUseCase'
import { Pagination } from '../secureCommsClient'
import {
  ChatSummary,
  HandleId,
  Message,
  MessageMention,
  Recipient,
  RedactReason,
  SearchMessagesItem,
  ThumbnailInfo,
} from '../typings'
import { PollResponses, PollType } from '../typings/poll'

/**
 * Properties required to retrieve a list of messages.
 *
 * @interface GetMessagesInput
 * @property {HandleId} handleId Identifier of the handle owned by this client.
 * @property {Recipient} recipient The target recipient.
 */
export interface GetMessagesInput extends Pagination {
  handleId: HandleId
  recipient: Recipient
}

/**
 * Properties required to retrieve a message.
 *
 * @interface GetMessageInput
 * @property {HandleId} handleId Identifier of the handle owned by this client.
 * @property {Recipient} recipient The target recipient.
 * @property {string} messageId The identifier of the message to retrieve.
 */
export interface GetMessageInput {
  handleId: HandleId
  recipient: Recipient
  messageId: string
}

/**
 * Properties required to search for all messages in unencrypted channels/groups.
 *
 * @interface SearchMessagesInput
 * @property {HandleId} handleId Identifier of the handle owned by this client.
 * @property {string} searchText The text to search and match messages with. Search keywords
 *  are matched as case-insensitive and whole-words only. Multiple search terms are supported
 *  in any order.
 */
export interface SearchMessagesInput extends Pagination {
  handleId: HandleId
  searchText: string
}

/**
 * Properties required to retrieve a list of chat summaries.
 *
 * @interface GetChatSummariesInput
 * @property {HandleId} handleId Identifier of the handle owned by this client.
 * @property {Recipient[]} recipients A list of recipients to retrieve the chat summaries for.
 */
export interface GetChatSummariesInput {
  handleId: HandleId
  recipients: Recipient[]
}

/**
 * Properies required to mark the chat with a recipient as read.
 *
 * @interface MarkAsReadInput
 * @property {HandleId} handleId Identifier of the handle owned by this client.
 * @property {Recipient} recipient The target recipient.
 */
export interface MarkAsReadInput {
  handleId: HandleId
  recipient: Recipient
}

/**
 * Properties required to send a typing notification.
 *
 * @interface SendTypingNotificationInput
 * @property {HandleId} handleId Identifier of the handle owned by this client.
 * @property {Recipient} recipient The target recipient
 * @property {boolean} isTyping True if typing, false if not.
 */
export interface SendTypingNotificationInput {
  handleId: HandleId
  recipient: Recipient
  isTyping: boolean
}

/**
 * Properties required to send a new message.
 *
 * @interface SendMessageInput
 * @property {HandleId} handleId Identifier of the handle owned by this client.
 * @property {Recipient} recipient The target recipient.
 * @property {string} message The message text to send.
 * @property {string} threadId (Optional) Required for thread messages. The message identifier
 *  that the new message will be associated with when creating or replying in a message thread.
 *  This should be set to the message identifier of the original message of a thread.
 * @property {string} replyToMessageId (Optional) Required for replying to messages. The message
 *  identifier that the new message will be associated with when creating quoted message replies.
 *  This should be set to the message identifier of the message being replied to.
 * @property {MessageMention[]} mentions A list of mentions included in the message.
 *  Use this to notify specific handles (`{ type: 'Handle', handleId, name }`) or all participants
 *  in a chat (`{ type: 'Chat' }`).
 * @property {number} clientMessageDuration (Optional) The locally managed duration this message should
 *  exist client side before self-destructing.
 * @property {number} serverMessageDuration (Optional) The absolute duration this message should exist
 *  server side before self-destructing.
 */
export interface SendMessageInput {
  handleId: HandleId
  recipient: Recipient
  message: string
  threadId?: string
  replyToMessageId?: string
  mentions: MessageMention[]
  clientMessageDuration?: number
  serverMessageDuration?: number
}

/**
 * Properties required to edit an existing message.
 *
 * @interface EditMessageInput
 * @property {HandleId} handleId Identifier of the handle owned by this client.
 * @property {Recipient} recipient The target recipient.
 * @property {string} messageId The identifier of the message to edit.
 * @property {string} message The new message text that will replace the older message.
 */
export interface EditMessageInput {
  handleId: HandleId
  recipient: Recipient
  messageId: string
  message: string
}

/**
 * Properties required to delete an existing message.
 *
 * @interface DeleteMessageInput
 * @property {HandleId} handleId Identifier of the handle owned by this client.
 * @property {Recipient} recipient The target recipient.
 * @property {string} messageId The identifier of the message to delete.
 * @property {RedactReason} reason The optional reason for deleting the message, accessible by all members
 *  of the chat.
 */
export interface DeleteMessageInput {
  handleId: HandleId
  recipient: Recipient
  messageId: string
  reason?: RedactReason
}

/**
 * Properties required to send a new media message.
 *
 * @interface SendMediaInput
 * @property {HandleId} handleId Identifier of the handle owned by this client.
 * @property {Recipient} recipient The target recipient.
 * @property {ArrayBuffer} file The media file to send.
 * @property {string} fileName The name of the media file.
 * @property {string} fileType The MIME type of the media file.
 * @property {number} fileSize The size of the media file in bytes.
 * @property {ArrayBuffer} thumbnail (Optional) The file containing the thumbnail.
 * @property {ThumbnailInfo} thumbnailInfo (Optional) The thumbnail image information.
 * @property {string} threadId (Optional) Required for thread messages. The message identifier
 *  that the new message will be associated with when creating or replying in a message thread.
 *  This should be set to the message identifier of the original message of a thread.
 * @property {string} replyToMessageId (Optional) Required for replying to messages. The message
 *  identifier that the new message will be associated with when creating quoted message replies.
 *  This should be set to the message identifier of the message being replied to.
 * @property {number} clientMessageDuration (Optional) The locally managed duration this message should
 *  exist client side before self-destructing.
 * @property {number} serverMessageDuration (Optional) The absolute duration this message should exist
 *  server side before self-destructing.
 */
export interface SendMediaInput {
  handleId: HandleId
  recipient: Recipient
  file: ArrayBuffer
  fileName: string
  fileType: string
  fileSize: number
  thumbnail?: ArrayBuffer
  thumbnailInfo?: ThumbnailInfo
  threadId?: string
  replyToMessageId?: string
  clientMessageDuration?: number
  serverMessageDuration?: number
}

/**
 * Properties required to toggle a reaction.
 *
 * @interface ToggleReactionInput
 * @property {HandleId} handleId Identifier of the handle owned by this client.
 * @property {Recipient} recipient The target recipient.
 * @property {string} messageId The identifier of the target message.
 * @property {string} content The reaction string to attach to the message. This may be an
 *  emoji or any other app-specific string.
 */
export interface ToggleReactionInput {
  handleId: HandleId
  recipient: Recipient
  messageId: string
  content: string
}

/**
 * Properties required to pin an existing message.
 *
 * @interface PinMessageInput
 * @property {HandleId} handleId The identifier of the handle owned by this client.
 * @property {Recipient} recipient The target recipient.
 * @property {string} messageId The identifier of the target message to pin.
 */
export interface PinMessageInput {
  handleId: HandleId
  recipient: Recipient
  messageId: string
}

/**
 * Properties required to unpin an existing message.
 *
 * @interface UnpinMessageInput
 * @property {HandleId} handleId The identifier of the handle owned by this client.
 * @property {Recipient} recipient The target recipient.
 * @property {string} messageId The identifier of the target message to unpin.
 */
export interface UnpinMessageInput {
  handleId: HandleId
  recipient: Recipient
  messageId: string
}

/**
 * Properties required to retrieve a list of pinned messages.
 *
 * @interface GetPinnedMessagesInput
 * @property {HandleId} handleId The identifier of the handle owned by this client.
 * @property {Recipient} recipient The target recipient.
 */
export interface GetPinnedMessagesInput {
  handleId: HandleId
  recipient: Recipient
}

/**
 * Properties required to create a poll.
 *
 * @interface CreatePollInput
 * @property {HandleId} handleId Identifier of the handle owned by this client.
 * @property {Recipient} recipient The target recipient.
 * @property {PollType} type Whether or not the poll participants can see the poll results.
 * @property {string} question The question being posed for the poll.
 * @property {string[]} answers The possible answers to the poll.
 * @property {number} maxSelections The maximum number of selections for the poll.
 */
export interface CreatePollInput {
  handleId: HandleId
  recipient: Recipient
  type: PollType
  question: string
  answers: string[]
  maxSelections: number
}

/**
 * Properties required to send a response to a poll.
 *
 * @interface SendPollResponseInput
 * @property {HandleId} handleId Identifier of the handle owned by this client.
 * @property {Recipient} recipient The target recipient.
 * @property {string} pollId The identifier of the poll to respond to.
 * @property {string[]} answers The answers to the poll.
 */
export interface SendPollResponseInput {
  handleId: HandleId
  recipient: Recipient
  pollId: string
  answers: string[]
}

/**
 * Properties required to edit a poll.
 *
 * @interface EditPollInput
 * @property {HandleId} handleId Identifier of the handle owned by this client.
 * @property {Recipient} recipient The target recipient.
 * @property {string} pollId The identifier of the poll to edit.
 * @property {PollType} type Whether or not the poll participants can see the poll results.
 * @property {string} question The question being posed for the poll.
 * @property {string[]} answers The possible answers to the poll.
 * @property {number} maxSelections The maximum number of selections for the poll.
 */
export interface EditPollInput {
  handleId: HandleId
  recipient: Recipient
  pollId: string
  type: PollType
  question: string
  answers: string[]
  maxSelections: number
}

/**
 * Properties required to end a poll.
 *
 * @interface EndPollInput
 * @property {HandleId} handleId Identifier of the handle owned by this client.
 * @property {Recipient} recipient The target recipient.
 * @property {string} pollId The identifier of the poll to end.
 */
export interface EndPollInput {
  handleId: HandleId
  recipient: Recipient
  pollId: string
}

/**
 * Properties required to tally responses for a poll.
 *
 * @interface GetPollResponsesInput
 * @property {HandleId} handleId The identifier of the handle owned by this client.
 * @property {Recipient} recipient The target recipient.
 * @property {string} pollId The identifier of the poll to tally responses for.
 */
export interface GetPollResponsesInput {
  handleId: HandleId
  recipient: Recipient
  pollId: string
}

/**
 * Messaging management for the Secure Communications Service.
 *
 * Each method on this interface takes an input which includes a {@link Recipient} parameter
 * representing a "Chat" with either a Direct Chat, Channel or Group.
 */
export interface MessagingModule {
  /**
   * Retrieve a list of messages for a given recipient, ordered from newest message to oldest.
   *
   * @param {GetMessagesInput} input Parameters used to retrieve a list of messages.
   * @returns {ListOutput<Message>} A list of message items and a next token to support pagination.
   */
  getMessages(input: GetMessagesInput): Promise<ListOutput<Message>>

  /**
   * Retrieve an individual message for a given recipient by the message's identifier.
   *
   * @param {GetMessageInput} input Parameters used to retrieve a message.
   * @returns {Message} The message matching the input identifier, or undefined if not found.
   */
  getMessage(input: GetMessageInput): Promise<Message | undefined>

  /**
   * Retrieves a list of messages from all unencrypted channels/groups matching search keywords.
   *
   * @param {SearchMessagesInput} input Parameters used to search for messages.
   * @returns {ListOutput<SearchMessagesItem>} The search results representing a list of message items and
   *  a next token to support pagination.
   */
  searchMessages(
    input: SearchMessagesInput,
  ): Promise<ListOutput<SearchMessagesItem>>

  /**
   * Retrieves a chat summary for the supplied set of recipients.
   *
   * @param {GetChatSummariesInput} input Parameters used to retrieve chat summaries.
   * @returns {ChatSummary[]} A list of chat summary items containing the latest message
   *  (if available) for each supplied recipient.
   */
  getChatSummaries(input: GetChatSummariesInput): Promise<ChatSummary[]>

  /**
   * Marks the chat with a recipient as read.
   *
   * @param {MarkAsReadInput} input Parameters used to mark messages as read.
   */
  markAsRead(input: MarkAsReadInput): Promise<void>

  /**
   * Sends a typing notification for this handle.
   *
   * @param {SendTypingNotificationInput} input Parameters used to send a typing notification.
   */
  sendTypingNotification(input: SendTypingNotificationInput): Promise<void>

  /**
   * Sends a message to a recipient.
   *
   * @param {SendMessageInput} input Parameters used to send a message including any other associated metadata.
   */
  sendMessage(input: SendMessageInput): Promise<void>

  /**
   * Edits an existing message that has been sent to a recipient. The original message
   * is replaced by the edited message for all members of the chat.
   *
   * @param {EditMessageInput} input Parameters used to edit a message.
   */
  editMessage(input: EditMessageInput): Promise<void>

  /**
   * Deletes an existing message that has been sent to a recipient. The original message
   * is removed for all members of the chat.
   *
   * @param {DeleteMessageInput} input Parameters used to delete a message.
   */
  deleteMessage(input: DeleteMessageInput): Promise<void>

  /**
   * Uploads and sends a media message to a recipient. Supported media types are images, videos, audio, and files.
   *
   * @param {SendMediaInput} input Parameters used to send a media message.
   */
  sendMedia(input: SendMediaInput): Promise<void>

  /**
   * Toggles a reaction for an existing message. All members of the chat will have visibility of the reaction.
   *
   * @param {ToggleReactionInput} input Parameters used to toggle a reaction.
   */
  toggleReaction(input: ToggleReactionInput): Promise<void>

  /**
   * Pins an existing message for a given recipient.
   *
   * @param {PinMessageInput} input Parameters used to pin an existing message.
   */
  pinMessage(input: PinMessageInput): Promise<void>

  /**
   * Unpins an existing message for a given recipient.
   *
   * @param {UnpinMessageInput} input Parameters used to unpin an existing message.
   */
  unpinMessage(input: UnpinMessageInput): Promise<void>

  /**
   * Retrieve a list of pinned messages for a given recipient, ordered from newest message to oldest.
   *
   * @param {GetPinnedMessagesInput} input Parameters used to retrieve a list of pinned messages.
   * @returns {Message[]} A list of pinned message items.
   */
  getPinnedMessages(input: GetPinnedMessagesInput): Promise<Message[]>

  /**
   * Creates a poll.
   *
   * @param {CreatePollInput} input Parameters used to create a poll.
   */
  createPoll(input: CreatePollInput): Promise<void>

  /**
   * Sends a response to a poll.
   *
   * @param {SendPollResponseInput} input Parameters used to send a response to a poll.
   */
  sendPollResponse(input: SendPollResponseInput): Promise<void>

  /**
   * Edits an existing poll.
   *
   * @param {EditPollInput} input Parameters used to edit a poll.
   */
  editPoll(input: EditPollInput): Promise<void>

  /**
   * Ends a poll.
   *
   * @param {EndPollInput} input Parameters used to end a poll.
   */
  endPoll(input: EndPollInput): Promise<void>

  /**
   * Tallies the responses for a given poll.
   *
   * @param {GetPollResponsesInput} input Parameters used to tally the responses for a given poll.
   * @returns {PollResponses} The tallied responses for the poll.
   */
  getPollResponses(input: GetPollResponsesInput): Promise<PollResponses>
}

export class DefaultMessagingModule implements MessagingModule {
  private readonly log: Logger

  public constructor(
    private readonly sessionManager: SessionManager,
    private readonly mediaCredentialManager: MediaCredentialManager,
    private readonly secureCommsServiceConfig: SecureCommsServiceConfig,
  ) {
    this.log = new DefaultLogger(this.constructor.name)
  }

  async getMessages(input: GetMessagesInput): Promise<ListOutput<Message>> {
    this.log.debug(this.getMessages.name, {
      input,
    })
    const useCase = new GetMessagesUseCase(this.sessionManager)
    const { messages, nextToken: resultNextToken } = await useCase.execute({
      handleId: input.handleId,
      recipient: input.recipient,
      limit: input.limit,
      nextToken: input.nextToken,
    })
    const transformer = new MessageTransformer()
    const transformedMessages = messages.map((message) =>
      transformer.fromEntityToAPI(message),
    )
    return { items: transformedMessages, nextToken: resultNextToken }
  }

  async getMessage(input: GetMessageInput): Promise<Message | undefined> {
    this.log.debug(this.getMessage.name, {
      input,
    })
    const useCase = new GetMessageUseCase(this.sessionManager)
    const result = await useCase.execute({
      handleId: input.handleId,
      recipient: input.recipient,
      messageId: input.messageId,
    })
    const transformer = new MessageTransformer()
    return result ? transformer.fromEntityToAPI(result) : undefined
  }

  async searchMessages(
    input: SearchMessagesInput,
  ): Promise<ListOutput<SearchMessagesItem>> {
    this.log.debug(this.searchMessages.name, {
      input,
    })
    const useCase = new SearchMessagesUseCase(this.sessionManager)
    const { messages, nextToken: resultNextToken } = await useCase.execute({
      handleId: input.handleId,
      searchText: input.searchText,
      limit: input.limit,
      nextToken: input.nextToken,
    })
    const transformer = new SearchMessagesItemTransformer()
    const transformedMessages = messages.map((message) =>
      transformer.fromEntityToAPI(message),
    )
    return { items: transformedMessages, nextToken: resultNextToken }
  }

  async getChatSummaries(input: GetChatSummariesInput): Promise<ChatSummary[]> {
    this.log.debug(this.getChatSummaries.name, {
      input,
    })
    const useCase = new GetChatSummariesUseCase(this.sessionManager)
    const result = await useCase.execute({
      handleId: input.handleId,
      recipients: input.recipients,
    })
    const transformer = new ChatSummaryTransformer()
    return result.map((summary) => transformer.fromEntityToAPI(summary))
  }

  async markAsRead(input: MarkAsReadInput): Promise<void> {
    this.log.debug(this.markAsRead.name, {
      input,
    })
    const useCase = new MarkAsReadUseCase(this.sessionManager)
    await useCase.execute({
      handleId: input.handleId,
      recipient: input.recipient,
    })
  }

  async sendTypingNotification(
    input: SendTypingNotificationInput,
  ): Promise<void> {
    this.log.debug(this.sendTypingNotification.name, {
      input,
    })
    const useCase = new SendTypingNotificationUseCase(this.sessionManager)
    await useCase.execute({
      handleId: input.handleId,
      recipient: input.recipient,
      isTyping: input.isTyping,
    })
  }

  async sendMessage(input: SendMessageInput): Promise<void> {
    this.log.debug(this.sendMessage.name, { input })

    const messageMentionTransformer = new MessageMentionTransformer()
    const sendInput = {
      handleId: input.handleId,
      recipient: input.recipient,
      message: input.message,
      mentions: input.mentions.map(messageMentionTransformer.fromAPIToEntity),
      clientMessageDuration: input.clientMessageDuration,
      serverMessageDuration: input.serverMessageDuration,
    }
    if (input.replyToMessageId) {
      const useCase = new SendReplyMessageUseCase(this.sessionManager)
      await useCase.execute({
        ...sendInput,
        replyToMessageId: input.replyToMessageId,
      })
    } else if (input.threadId) {
      const useCase = new SendThreadMessageUseCase(this.sessionManager)
      await useCase.execute({
        ...sendInput,
        threadId: input.threadId,
      })
    } else {
      const useCase = new SendMessageUseCase(this.sessionManager)
      await useCase.execute(sendInput)
    }
  }

  async editMessage(input: EditMessageInput): Promise<void> {
    this.log.debug(this.editMessage.name, {
      input,
    })
    const useCase = new EditMessageUseCase(this.sessionManager)
    await useCase.execute({
      handleId: input.handleId,
      recipient: input.recipient,
      messageId: input.messageId,
      message: input.message,
    })
  }

  async deleteMessage(input: DeleteMessageInput): Promise<void> {
    this.log.debug(this.deleteMessage.name, {
      input,
    })
    const useCase = new DeleteMessageUseCase(this.sessionManager)
    await useCase.execute({
      handleId: input.handleId,
      recipient: input.recipient,
      messageId: input.messageId,
      reason: input.reason,
    })
  }

  async sendMedia(input: SendMediaInput): Promise<void> {
    this.log.debug(this.sendMedia.name, {
      input,
    })
    const useCase = new SendMediaUseCase(
      this.sessionManager,
      this.mediaCredentialManager,
    )
    await useCase.execute(input)
  }

  async toggleReaction(input: ToggleReactionInput): Promise<void> {
    this.log.debug(this.toggleReaction.name, {
      input,
    })
    const useCase = new ToggleReactionUseCase(this.sessionManager)
    await useCase.execute({
      handleId: input.handleId,
      recipient: input.recipient,
      messageId: input.messageId,
      content: input.content,
    })
  }

  async pinMessage(input: PinMessageInput): Promise<void> {
    this.log.debug(this.pinMessage.name, {
      input,
    })
    const useCase = new PinUnpinMessageUseCase(this.sessionManager)
    await useCase.execute({
      handleId: input.handleId,
      recipient: input.recipient,
      messageId: input.messageId,
    })
  }

  async unpinMessage(input: UnpinMessageInput): Promise<void> {
    this.log.debug(this.pinMessage.name, {
      input,
    })
    const useCase = new PinUnpinMessageUseCase(this.sessionManager)
    await useCase.execute({
      handleId: input.handleId,
      recipient: input.recipient,
      messageId: input.messageId,
    })
  }

  async getPinnedMessages(input: GetPinnedMessagesInput): Promise<Message[]> {
    this.log.debug(this.getPinnedMessages.name, {
      input,
    })
    const useCase = new GetPinnedMessagesUseCase(this.sessionManager)
    const result = await useCase.execute({
      handleId: input.handleId,
      recipient: input.recipient,
    })
    const transformer = new MessageTransformer()
    return result.map((pinnedMessage) =>
      transformer.fromEntityToAPI(pinnedMessage),
    )
  }

  async createPoll(input: CreatePollInput): Promise<void> {
    this.log.debug(this.createPoll.name, {
      input,
    })
    const pollTypeTransformer = new PollTypeTransformer()
    const useCase = new CreatePollUseCase(this.sessionManager)
    await useCase.execute({
      handleId: input.handleId,
      recipient: input.recipient,
      type: pollTypeTransformer.fromAPIToEntity(input.type),
      question: input.question,
      answers: input.answers,
      maxSelections: input.maxSelections,
    })
  }

  async sendPollResponse(input: SendPollResponseInput): Promise<void> {
    this.log.debug(this.sendPollResponse.name, {
      input,
    })
    const useCase = new SendPollResponseUseCase(this.sessionManager)
    await useCase.execute(input)
  }

  async editPoll(input: EditPollInput): Promise<void> {
    this.log.debug(this.editPoll.name, {
      input,
    })
    const pollTypeTransformer = new PollTypeTransformer()
    const useCase = new EditPollUseCase(this.sessionManager)
    await useCase.execute({
      handleId: input.handleId,
      recipient: input.recipient,
      pollId: input.pollId,
      type: pollTypeTransformer.fromAPIToEntity(input.type),
      question: input.question,
      answers: input.answers,
      maxSelections: input.maxSelections,
    })
  }

  async endPoll(input: EndPollInput): Promise<void> {
    this.log.debug(this.endPoll.name, {
      input,
    })
    const useCase = new EndPollUseCase(this.sessionManager)
    await useCase.execute(input)
  }

  async getPollResponses(input: GetPollResponsesInput): Promise<PollResponses> {
    this.log.debug(this.getPollResponses.name, {
      input,
    })
    const useCase = new GetPollResponsesUseCase(this.sessionManager)
    const result = await useCase.execute(input)
    const transformer = new PollResponsesTransformer()
    return transformer.fromEntityToAPI(result)
  }
}
