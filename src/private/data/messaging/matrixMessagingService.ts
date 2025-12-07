/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { encryptAttachment } from 'matrix-encrypt-attachment'
import { MatrixEvent, MsgType } from 'matrix-js-sdk/lib/matrix'
import { RoomMessageEventContent } from 'matrix-js-sdk/lib/types'
import { ChannelId, Recipient, SecureCommsError } from '../../../public'
import { ChatSummaryEntity } from '../../domain/entities/messaging/chatSummaryEntity'
import {
  MessageEntity,
  RedactReasonEntity,
} from '../../domain/entities/messaging/messageEntity'
import {
  CreatePollInput,
  DeleteMessageInput,
  EditMessageInput,
  EditPollInput,
  EndPollInput,
  GetChatSummariesInput,
  GetMessageInput,
  GetPinnedMessagesInput,
  GetPollResponsesInput,
  ListMessagesInput,
  ListMessagesOutput,
  MarkAsReadInput,
  MessagingService,
  PinUnpinMessageInput,
  SearchMessagesInput,
  SearchMessagesOutput,
  SendMediaInput,
  SendMessageInput,
  SendPollResponseInput,
  SendReplyMessageInput,
  SendThreadMessageInput,
  SendTypingNotificationInput,
  ToggleReactionInput,
} from '../../domain/entities/messaging/messagingService'
import { PollResponsesEntity } from '../../domain/entities/messaging/pollEntity'
import { MatrixClientManager } from '../common/matrixClientManager'
import { MatrixMediaService } from '../media/matrixMediaService'
import { PollTypeTransformer } from './transformer/pollTypeTransformer'

export class MatrixMessagingService implements MessagingService {
  constructor(
    private readonly matrixClient: MatrixClientManager,
    private readonly matrixMediaService?: MatrixMediaService,
  ) {}

  async sendMessage(input: SendMessageInput): Promise<void> {
    const roomId = input.recipient.value
    const content = await this.buildMessageContent(input)
    await this.matrixClient.sendMessage(roomId, content)
  }

  async sendThread(input: SendThreadMessageInput): Promise<void> {
    const roomId = input.recipient.value
    const content = await this.buildMessageContent(input)
    await this.matrixClient.sendThreadMessage(roomId, input.threadId, content)
  }

  async sendReply(input: SendReplyMessageInput): Promise<void> {
    const roomId = input.recipient.value
    const content = await this.buildMessageContent(input)
    await this.matrixClient.sendReplyMessage(
      roomId,
      input.replyToMessageId,
      content,
    )
  }

  async sendMedia(input: SendMediaInput): Promise<void> {
    if (!this.matrixMediaService) {
      throw new SecureCommsError('Media service is not available')
    }
    const roomId = input.recipient.value
    const msgType =
      this.matrixMediaService.getMsgType(input.fileType) ?? MsgType.File

    // Generate or clear thumbnail based on media type. Upload thumbail for images and videos.
    const processedInput =
      msgType === MsgType.Image || msgType === MsgType.Video
        ? await this.generateThumbnail(input)
        : { ...input, thumbnail: undefined, thumbnailInfo: undefined }

    // If the recipient is a channel, the file should be unencrypted. Otherwise, it should be encrypted.
    const isPublic = input.recipient instanceof ChannelId
    const content = isPublic
      ? await this.handleUnencryptedFile(processedInput, msgType)
      : await this.handleEncryptedFile(processedInput, msgType)

    if (input.threadId) {
      await this.matrixClient.sendThreadMessage(roomId, input.threadId, content)
    } else if (input.replyToMessageId) {
      await this.matrixClient.sendReplyMessage(
        roomId,
        input.replyToMessageId,
        content,
      )
    } else {
      await this.matrixClient.sendMessage(roomId, content)
    }
  }

  async get(input: GetMessageInput): Promise<MessageEntity | undefined> {
    const roomId = input.recipient.value
    const message = await this.matrixClient.getMessage(input.messageId, roomId)
    if (!message) {
      return undefined
    }
    const [edits, reactions, receipts] = await Promise.all([
      this.matrixClient.getReplacements(roomId, message.messageId),
      this.matrixClient.getReactions(roomId, message.messageId),
      this.matrixClient.getReadReceipts(roomId, undefined, message.messageId),
    ])
    if (edits.length > 0) {
      message.content = edits
        .sort((a, b) => a.timestamp - b.timestamp)
        .at(-1)!.content
      message.content.isEdited = true
    }
    message.reactions = reactions
    message.receipts = receipts
    return message
  }

  async edit(input: EditMessageInput): Promise<void> {
    const roomId = input.recipient.value
    const content: RoomMessageEventContent = {
      body: input.message,
      msgtype: MsgType.Text,
    }
    await this.matrixClient.editMessage(roomId, input.messageId, content)
  }

  async delete(input: DeleteMessageInput): Promise<void> {
    const roomId = input.recipient.value
    const reason = this.handleRedactReason(input.reason)
    await this.matrixClient.deleteMessage(roomId, input.messageId, reason)
  }

  async list(input: ListMessagesInput): Promise<ListMessagesOutput> {
    const roomId = input.recipient.value
    const listOutput = await this.matrixClient.listMessages(
      roomId,
      input.limit,
      input.nextToken,
    )
    listOutput.messages = await Promise.all(
      listOutput.messages.map(async (message) => {
        const [edits, reactions, receipts] = await Promise.all([
          this.matrixClient.getReplacements(roomId, message.messageId),
          this.matrixClient.getReactions(roomId, message.messageId),
          this.matrixClient.getReadReceipts(
            roomId,
            new MatrixEvent({ event_id: message.messageId }),
            message.messageId,
          ),
        ])
        if (edits.length > 0) {
          message.content = edits
            .sort((a, b) => a.timestamp - b.timestamp)
            .at(-1)!.content
          message.content.isEdited = true
        }
        message.reactions = reactions
        message.receipts = receipts
        return message
      }),
    )
    return listOutput
  }

  async searchMessages(
    input: SearchMessagesInput,
  ): Promise<SearchMessagesOutput> {
    return await this.matrixClient.searchMessages(
      input.searchText,
      input.limit,
      input.nextToken,
    )
  }

  async getChatSummaries(
    input: GetChatSummariesInput,
  ): Promise<ChatSummaryEntity[]> {
    const roomIds = new Map<Recipient, string>(
      input.recipients.map((recipient) => [recipient, recipient.value]),
    )
    return await this.matrixClient.getChatSummaries(roomIds)
  }

  async markAsRead(input: MarkAsReadInput): Promise<void> {
    const roomId = input.recipient.value
    await this.matrixClient.sendReadReceipt(roomId)
  }

  async sendTypingNotification(
    input: SendTypingNotificationInput,
  ): Promise<void> {
    const roomId = input.recipient.value
    await this.matrixClient.sendTypingNotification(roomId, input.isTyping)
  }

  async toggleReaction(input: ToggleReactionInput): Promise<void> {
    const roomId = input.recipient.value
    await this.matrixClient.toggleReaction(
      roomId,
      input.messageId,
      input.content,
    )
  }

  async pinUnpinMessage(input: PinUnpinMessageInput): Promise<void> {
    const roomId = input.recipient.value
    await this.matrixClient.pinUnpinMessage(roomId, input.messageId)
  }

  async getPinnedMessages(
    input: GetPinnedMessagesInput,
  ): Promise<MessageEntity[]> {
    const roomId = input.recipient.value
    const pinnedMessages = await this.matrixClient.getPinnedMessages(roomId)
    if (!pinnedMessages.length) {
      return []
    }
    return await Promise.all(
      pinnedMessages.map(async (message) => {
        const [edits, reactions, receipts] = await Promise.all([
          this.matrixClient.getReplacements(roomId, message.messageId),
          this.matrixClient.getReactions(roomId, message.messageId),
          this.matrixClient.getReadReceipts(
            roomId,
            undefined,
            message.messageId,
          ),
        ])
        if (edits.length > 0) {
          message.content = edits
            .sort((a, b) => a.timestamp - b.timestamp)
            .at(-1)!.content
          message.content.isEdited = true
        }
        message.reactions = reactions
        message.receipts = receipts
        return message
      }),
    )
  }

  private async buildMessageContent(
    input: SendMessageInput | SendThreadMessageInput | SendReplyMessageInput,
  ): Promise<RoomMessageEventContent> {
    let formattedBody = input.message
    const userMentions: string[] = []
    let hasChatMention = false

    const roomId = input.recipient.value

    for (const mention of input.mentions) {
      // Format Handle mention
      if (mention.type === 'Handle') {
        const matrixUserId = `@${mention.handleId}:${this.matrixClient.homeServer}`
        const displayName = `@${mention.name}`
        const href = `https://matrix.to/#/${matrixUserId}`

        // Escape the display name
        const escapedDisplayName = displayName.replace(
          /[-/\\^$*+?.()|[\]{}]/g,
          '\\$&',
        )
        const regex = new RegExp(escapedDisplayName, 'g')
        formattedBody = formattedBody.replace(
          regex,
          `<a href="${href}">${displayName}</a>`,
        )
        userMentions.push(matrixUserId)
      } else {
        // Format Chat mention
        const chatTag = '@chat'
        formattedBody = formattedBody.replace(
          new RegExp(chatTag, 'g'),
          `<a href="https://matrix.to/#/${roomId}">${chatTag}</a>`,
        )
        hasChatMention = true
      }
    }
    // Construct the final content
    const content: RoomMessageEventContent = {
      body: input.message,
      msgtype: MsgType.Text,
      ...(input.mentions.length > 0 && {
        format: 'org.matrix.custom.html',
        formatted_body: formattedBody,
        'm.mentions': {
          user_ids: userMentions,
          ...(hasChatMention ? { room: true } : {}),
        },
      }),
    }
    return content
  }

  private async generateThumbnail(
    input: SendMediaInput,
  ): Promise<SendMediaInput> {
    if (input.thumbnail && input.thumbnailInfo?.blurHash) {
      return input // Already has valid thumbnail and blurhash
    }
    // If thumbnail is not available, try to generate one
    const thumbnailAndBlurhash =
      await this.matrixMediaService?.generateThumbnailAndBlurHash({
        file: input.file,
        mimeType: input.fileType,
      })
    if (!thumbnailAndBlurhash) {
      throw new SecureCommsError('Failed to generate thumbnail and blurhash.')
    }
    const { thumbnail, width, height, size, mimeType, blurHash } =
      thumbnailAndBlurhash
    if (!thumbnail || !width || !height || !mimeType || !blurHash) {
      throw new SecureCommsError('Thumbnail info is missing or incomplete.')
    }
    return {
      ...input,
      thumbnail,
      thumbnailInfo: { width, height, size, mimeType, blurHash },
    }
  }

  private async handleEncryptedFile(
    input: SendMediaInput,
    msgType: MsgType,
  ): Promise<RoomMessageEventContent> {
    const content = {
      msgtype: msgType,
      body: input.fileName,
      info: {},
    } as RoomMessageEventContent

    // handle thumbnail
    if (input.thumbnail) {
      const encryptedThumbnail = await encryptAttachment(input.thumbnail!)
      const thumbnailUrl = await this.matrixMediaService?.uploadMediaFile({
        file: encryptedThumbnail.data,
        fileName: `${input.fileName}.thumbnail.jpg`,
        fileType: input.thumbnailInfo!.mimeType,
        mediaCredential: input.mediaCredential,
      })
      ;(content as any).info.thumbnail_info = {
        mimetype: input.thumbnailInfo!.mimeType,
        size: input.thumbnailInfo!.size,
        w: input.thumbnailInfo!.width,
        h: input.thumbnailInfo!.height,
        blurhash: input.thumbnailInfo!.blurHash,
      }
      ;(content as any).info.thumbnail_file = {
        ...encryptedThumbnail.info,
        url: thumbnailUrl,
      }
    }

    // handle file
    const encryptedFile = await encryptAttachment(input.file)
    const fileUrl = await this.matrixMediaService?.uploadMediaFile({
      file: encryptedFile.data,
      fileName: input.fileName,
      fileType: input.fileType,
      mediaCredential: input.mediaCredential,
    })
    ;(content as any).info.mimetype = input.fileType
    ;(content as any).info.size = input.fileSize
    ;(content as any).file = {
      ...encryptedFile.info,
      url: fileUrl,
    }
    return content
  }

  private async handleUnencryptedFile(
    input: SendMediaInput,
    msgType: MsgType,
  ): Promise<RoomMessageEventContent> {
    const content = {
      msgtype: msgType,
      body: input.fileName,
      info: {},
    } as RoomMessageEventContent

    // handle thumbnail
    if (input.thumbnail) {
      const thumbnailUrl = await this.matrixMediaService?.uploadMediaFile({
        file: input.thumbnail,
        fileName: `${input.fileName}.thumbnail.jpg`,
        fileType: input.thumbnailInfo!.mimeType,
        mediaCredential: input.mediaCredential,
      })
      ;(content as any).info.thumbnail_info = {
        mimetype: input.thumbnailInfo!.mimeType,
        size: input.thumbnailInfo!.size,
        w: input.thumbnailInfo!.width,
        h: input.thumbnailInfo!.height,
        blurhash: input.thumbnailInfo!.blurHash,
      }
      ;(content as any).info.thumbnail_url = thumbnailUrl
    }

    // handle file
    const fileUrl = await this.matrixMediaService?.uploadMediaFile({
      file: input.file,
      fileName: input.fileName,
      fileType: input.fileType,
      mediaCredential: input.mediaCredential,
    })
    ;(content as any).info.mimetype = input.fileType
    ;(content as any).info.size = input.fileSize
    ;(content as any).url = fileUrl
    return content
  }

  private handleRedactReason(
    reason: RedactReasonEntity | undefined,
  ): string | undefined {
    if (!reason) {
      return undefined
    }
    const threadSuffix =
      reason.type !== 'editReaction' &&
      reason.type !== 'unknown' &&
      reason.threadId
        ? `: (in thread with Id: ${reason.threadId})`
        : ''
    switch (reason.type) {
      case 'deleteOwn':
        return `${reason.type}${threadSuffix}`
      case 'editReaction':
        return reason.type
      case 'moderation':
        return `${reason.type} ${reason.hide ? '(hidden)' : reason.reason}${threadSuffix}`
      case 'unknown':
        return 'Redacted for unknown reason'
    }
  }

  async createPoll(input: CreatePollInput): Promise<void> {
    const roomId = input.recipient.value
    const pollTypeTransformer = new PollTypeTransformer()
    await this.matrixClient.createPoll(
      roomId,
      pollTypeTransformer.fromEntityToMatrix(input.type),
      input.question,
      input.answers,
      input.maxSelections,
    )
  }

  async sendPollResponse(input: SendPollResponseInput): Promise<void> {
    const roomId = input.recipient.value
    await this.matrixClient.sendPollResponse(
      roomId,
      input.pollId,
      input.answers,
    )
  }

  async editPoll(input: EditPollInput): Promise<void> {
    const roomId = input.recipient.value
    // Polls are immutable, therefore an existing poll must be ended
    await this.matrixClient.endPoll(roomId, input.pollId)

    // Re-create the poll with updated values
    const pollTypeTransformer = new PollTypeTransformer()
    await this.matrixClient.createPoll(
      roomId,
      pollTypeTransformer.fromEntityToMatrix(input.type),
      input.question,
      input.answers,
      input.maxSelections,
    )
  }

  async endPoll(input: EndPollInput): Promise<void> {
    const roomId = input.recipient.value
    await this.matrixClient.endPoll(roomId, input.pollId)
  }

  async getPollResponses(
    input: GetPollResponsesInput,
  ): Promise<PollResponsesEntity> {
    const roomId = input.recipient.value
    return await this.matrixClient.getPollResponses(roomId, input.pollId)
  }
}
