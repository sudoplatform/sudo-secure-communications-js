/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { MatrixClient, MsgType } from 'matrix-js-sdk/lib/matrix'
import {
  anything,
  capture,
  instance,
  mock,
  reset,
  verify,
  when,
} from 'ts-mockito'
import { MatrixClientManager } from '../../../../../src/private/data/common/matrixClientManager'
import { MatrixMediaService } from '../../../../../src/private/data/media/matrixMediaService'
import { MatrixMessagingService } from '../../../../../src/private/data/messaging/matrixMessagingService'
import {
  DeleteOwnRedactReasonEntity,
  MessageMentionEntity,
} from '../../../../../src/private/domain/entities/messaging/messageEntity'
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
  MarkAsReadInput,
  PinUnpinMessageInput,
  SearchMessagesInput,
  SendMediaInput,
  SendMessageInput,
  SendPollResponseInput,
  SendReplyMessageInput,
  SendThreadMessageInput,
  SendTypingNotificationInput,
  ToggleReactionInput,
} from '../../../../../src/private/domain/entities/messaging/messagingService'
import { PollTypeEntity } from '../../../../../src/private/domain/entities/messaging/pollEntity'
import {
  ChannelId,
  GroupId,
  HandleId,
  Recipient,
} from '../../../../../src/public'
import { EntityDataFactory } from '../../../../data-factory/entity'

describe('MatrixMessagingService Test Suite', () => {
  const mockMatrixClient = mock<MatrixClient>()
  const mockMatrixClientManager = mock<MatrixClientManager>()
  const mockMatrixMediaService = mock<MatrixMediaService>()

  let instanceUnderTest: MatrixMessagingService
  const matrixClientManagerInstance = instance(mockMatrixClientManager)

  beforeAll(() => {
    Object.defineProperty(matrixClientManagerInstance, 'homeServer', {
      value: 'testHomeServer.com',
      configurable: true,
    })
  })

  beforeEach(() => {
    reset(mockMatrixClient)
    reset(mockMatrixClientManager)
    reset(mockMatrixMediaService)

    instanceUnderTest = new MatrixMessagingService(
      matrixClientManagerInstance,
      instance(mockMatrixMediaService),
    )
  })

  describe('sendMessage', () => {
    it('calls matrixClient correctly', async () => {
      const handleId = new HandleId('testHandleId')
      const message = 'Send a message'
      let mentions: MessageMentionEntity[] = []

      const input: SendMessageInput = {
        recipient: handleId,
        message,
        mentions,
      }
      await expect(instanceUnderTest.sendMessage(input)).resolves.not.toThrow()

      const [idArg, contentArg] = capture(
        mockMatrixClientManager.sendMessage,
      ).first()
      expect(idArg).toStrictEqual<typeof idArg>(handleId.toString())
      expect(contentArg).toStrictEqual<typeof contentArg>({
        body: message,
        msgtype: MsgType.Text,
      })
      verify(mockMatrixClientManager.sendMessage(anything(), anything())).once()
    })

    it('formats content with mentions and calls matrixClient correctly', async () => {
      const handleId = new HandleId('testHandleId')
      const message = 'Hello @testHandleName and @chat'

      const input: SendMessageInput = {
        recipient: handleId,
        message,
        mentions: [
          EntityDataFactory.messageHandleMention,
          EntityDataFactory.messageChatMention,
        ],
      }

      await expect(instanceUnderTest.sendMessage(input)).resolves.not.toThrow()

      const [idArg, contentArg] = capture(
        mockMatrixClientManager.sendMessage,
      ).first()

      expect(idArg).toStrictEqual<typeof idArg>(handleId.toString())
      expect(contentArg).toStrictEqual<typeof contentArg>({
        body: message,
        msgtype: MsgType.Text,
        format: 'org.matrix.custom.html',
        formatted_body:
          'Hello <a href="https://matrix.to/#/@testHandleId:testHomeServer.com\">@testHandleName</a> and <a href="https://matrix.to/#/testHandleId">@chat</a>',
        'm.mentions': {
          user_ids: ['@testHandleId:testHomeServer.com'],
          room: true,
        },
      })

      verify(mockMatrixClientManager.sendMessage(anything(), anything())).once()
    })
  })

  describe('sendThread', () => {
    it('calls matrixClient correctly', async () => {
      const handleId = new HandleId('testHandleId')
      const message = 'Send a message'
      const threadId = 'threadId'
      let mentions: MessageMentionEntity[] = []

      const input: SendThreadMessageInput = {
        recipient: handleId,
        threadId,
        message,
        mentions,
      }
      await expect(instanceUnderTest.sendThread(input)).resolves.not.toThrow()

      const [idArg, threadArg, contentArg] = capture(
        mockMatrixClientManager.sendThreadMessage,
      ).first()
      expect(idArg).toStrictEqual<typeof idArg>(handleId.toString())
      expect(threadArg).toStrictEqual<typeof threadArg>(threadId)
      expect(contentArg).toStrictEqual<typeof contentArg>({
        body: message,
        msgtype: MsgType.Text,
      })
      verify(
        mockMatrixClientManager.sendThreadMessage(
          anything(),
          anything(),
          anything(),
        ),
      ).once()
    })

    it('formats content with mentions and calls matrixClient correctly', async () => {
      const handleId = new HandleId('testHandleId')
      const message = 'Hello @testHandleName and @chat'
      const threadId = 'threadId'

      const input: SendThreadMessageInput = {
        recipient: handleId,
        threadId,
        message,
        mentions: [
          EntityDataFactory.messageHandleMention,
          EntityDataFactory.messageChatMention,
        ],
      }
      await expect(instanceUnderTest.sendThread(input)).resolves.not.toThrow()

      const [idArg, threadArg, contentArg] = capture(
        mockMatrixClientManager.sendThreadMessage,
      ).first()

      expect(idArg).toStrictEqual<typeof idArg>(handleId.toString())
      expect(threadArg).toStrictEqual<typeof threadArg>(threadId)
      expect(contentArg).toStrictEqual<typeof contentArg>({
        body: message,
        msgtype: MsgType.Text,
        format: 'org.matrix.custom.html',
        formatted_body:
          'Hello <a href="https://matrix.to/#/@testHandleId:testHomeServer.com\">@testHandleName</a> and <a href="https://matrix.to/#/testHandleId">@chat</a>',
        'm.mentions': {
          user_ids: ['@testHandleId:testHomeServer.com'],
          room: true,
        },
      })

      verify(
        mockMatrixClientManager.sendThreadMessage(
          anything(),
          anything(),
          anything(),
        ),
      ).once()
    })
  })

  describe('sendReply', () => {
    it('calls matrixClient correctly', async () => {
      const handleId = new HandleId('testHandleId')
      const message = 'Send a message'
      const replyToMessageId = 'replyToMessageId'
      let mentions: MessageMentionEntity[] = []

      const input: SendReplyMessageInput = {
        recipient: handleId,
        replyToMessageId,
        message,
        mentions,
      }
      await expect(instanceUnderTest.sendReply(input)).resolves.not.toThrow()

      const [idArg, replyArg, contentArg] = capture(
        mockMatrixClientManager.sendReplyMessage,
      ).first()
      expect(idArg).toStrictEqual<typeof idArg>(handleId.toString())
      expect(replyArg).toStrictEqual<typeof replyArg>(replyToMessageId)
      expect(contentArg).toStrictEqual<typeof contentArg>({
        body: message,
        msgtype: MsgType.Text,
      })
      verify(
        mockMatrixClientManager.sendReplyMessage(
          anything(),
          anything(),
          anything(),
        ),
      ).once()
    })

    it('formats content with mentions and calls matrixClient correctly', async () => {
      const handleId = new HandleId('testHandleId')
      const message = 'Hello @testHandleName and @chat'
      const replyToMessageId = 'replyToMessageId'

      const input: SendReplyMessageInput = {
        recipient: handleId,
        replyToMessageId,
        message,
        mentions: [
          EntityDataFactory.messageHandleMention,
          EntityDataFactory.messageChatMention,
        ],
      }
      await expect(instanceUnderTest.sendReply(input)).resolves.not.toThrow()

      const [idArg, replyArg, contentArg] = capture(
        mockMatrixClientManager.sendReplyMessage,
      ).first()
      expect(idArg).toStrictEqual<typeof idArg>(handleId.toString())
      expect(replyArg).toStrictEqual<typeof replyArg>(replyToMessageId)
      expect(contentArg).toStrictEqual<typeof contentArg>({
        body: message,
        msgtype: MsgType.Text,
        format: 'org.matrix.custom.html',
        formatted_body:
          'Hello <a href="https://matrix.to/#/@testHandleId:testHomeServer.com\">@testHandleName</a> and <a href="https://matrix.to/#/testHandleId">@chat</a>',
        'm.mentions': {
          user_ids: ['@testHandleId:testHomeServer.com'],
          room: true,
        },
      })

      verify(
        mockMatrixClientManager.sendReplyMessage(
          anything(),
          anything(),
          anything(),
        ),
      ).once()
    })
  })

  describe('sendMedia', () => {
    it('calls matrixClient correctly', async () => {
      const channelId = new ChannelId('testChannelId')
      const threadId = 'threadId'
      const replyToMessageId = 'replyToMessageId'
      const mxcUrl = 'mxc://example.com/file'
      const mediaCredential = EntityDataFactory.mediaCredential

      when(mockMatrixMediaService.uploadMediaFile(anything())).thenResolve(
        mxcUrl,
      )

      // send media as unencrypted basic message
      await (async () => {
        const input: SendMediaInput = {
          recipient: channelId, // unencrypted
          file: new ArrayBuffer(100),
          fileName: 'fileName.pdf',
          fileSize: 100,
          fileType: 'application/pdf',
          mediaCredential,
          // no thread / reply, as a regular message
        }
        await expect(instanceUnderTest.sendMedia(input)).resolves.not.toThrow()
        verify(
          mockMatrixClientManager.sendMessage(anything(), anything()),
        ).once()
        const [idArg, contentArg] = capture(
          mockMatrixClientManager.sendMessage,
        ).first()
        expect(idArg).toStrictEqual<typeof idArg>(channelId.toString())
        expect(contentArg).toStrictEqual<typeof contentArg>({
          msgtype: MsgType.File,
          body: input.fileName,
          info: { mimetype: input.fileType, size: input.fileSize },
          url: mxcUrl,
        })
      })()

      // send media as reply message
      await (async () => {
        const input: SendMediaInput = {
          recipient: channelId, // unencrypted
          file: new ArrayBuffer(100),
          fileName: 'fileName.pdf',
          fileSize: 100,
          fileType: 'application/pdf',
          replyToMessageId,
          mediaCredential,
        }
        await expect(instanceUnderTest.sendMedia(input)).resolves.not.toThrow()
        verify(
          mockMatrixClientManager.sendReplyMessage(
            anything(),
            anything(),
            anything(),
          ),
        ).once()
        const [idArg, replyArg, contentArg] = capture(
          mockMatrixClientManager.sendReplyMessage,
        ).first()
        expect(idArg).toStrictEqual<typeof idArg>(channelId.toString())
        expect(replyArg).toStrictEqual<typeof replyArg>(replyToMessageId)
        expect(contentArg).toStrictEqual<typeof contentArg>({
          msgtype: MsgType.File,
          body: input.fileName,
          info: { mimetype: input.fileType, size: input.fileSize },
          url: mxcUrl,
        })
      })()

      // send media as thread message
      await (async () => {
        const input: SendMediaInput = {
          recipient: channelId, // unencrypted
          file: new ArrayBuffer(100),
          fileName: 'fileName.pdf',
          fileSize: 100,
          fileType: 'application/pdf',
          threadId,
          mediaCredential,
        }
        await expect(instanceUnderTest.sendMedia(input)).resolves.not.toThrow()
        verify(
          mockMatrixClientManager.sendThreadMessage(
            anything(),
            anything(),
            anything(),
          ),
        ).once()
        const [idArg, threadIdArg, contentArg] = capture(
          mockMatrixClientManager.sendThreadMessage,
        ).first()
        expect(idArg).toStrictEqual<typeof idArg>(channelId.toString())
        expect(threadIdArg).toStrictEqual<typeof threadIdArg>(threadId)
        expect(contentArg).toStrictEqual<typeof contentArg>({
          msgtype: MsgType.File,
          body: input.fileName,
          info: { mimetype: input.fileType, size: input.fileSize },
          url: mxcUrl,
        })
      })()
    })

    it('generates unencrypted thumbnail if necessary', async () => {
      const roomId = 'testRoomId'
      const channelId = new ChannelId('testChannelId')
      const mxcUrl = 'mxc://example.com/file'
      const mediaCredential = EntityDataFactory.mediaCredential

      when(mockMatrixMediaService.uploadMediaFile(anything())).thenResolve(
        mxcUrl,
      )

      const input: SendMediaInput = {
        recipient: channelId, // unencrypted
        file: new ArrayBuffer(100),
        fileName: 'fileName.jpg',
        fileSize: 100,
        fileType: 'image/jpeg', // image will trigger thumbnail generation
        mediaCredential,
      }

      when(mockMatrixMediaService.getMsgType(anything())).thenReturn(
        MsgType.Image,
      )
      when(
        mockMatrixMediaService.generateThumbnailAndBlurHash(anything()),
      ).thenResolve({
        thumbnail: new ArrayBuffer(50),
        width: 100,
        height: 101,
        size: 50,
        mimeType: 'image/jpeg',
        blurHash: 'blurhash',
      })

      await expect(instanceUnderTest.sendMedia(input)).resolves.not.toThrow()
      const [idArg, contentArg] = capture(
        mockMatrixClientManager.sendMessage,
      ).first()
      expect(idArg).toStrictEqual<typeof idArg>(channelId.toString())
      expect(contentArg).toStrictEqual<typeof contentArg>({
        msgtype: MsgType.Image,
        body: input.fileName,
        info: {
          mimetype: input.fileType,
          size: input.fileSize,
          thumbnail_info: {
            w: 100,
            h: 101,
            size: 50,
            mimetype: 'image/jpeg',
            blurhash: 'blurhash',
          } as any,
          thumbnail_url: mxcUrl,
        },
        url: mxcUrl,
      })
    })

    it('generates encrypted thumbnail if necessary', async () => {
      const channelId = new HandleId('testHandleId')
      const mxcUrl = 'mxc://example.com/file'
      const mediaCredential = EntityDataFactory.mediaCredential

      when(mockMatrixMediaService.uploadMediaFile(anything())).thenResolve(
        mxcUrl,
      )

      const input: SendMediaInput = {
        recipient: channelId, // unencrypted
        file: new ArrayBuffer(100),
        fileName: 'fileName.mp4',
        fileSize: 100,
        fileType: 'video/mp4', // video will trigger thumbnail generation
        mediaCredential,
      }

      when(mockMatrixMediaService.getMsgType(anything())).thenReturn(
        MsgType.Video,
      )
      when(
        mockMatrixMediaService.generateThumbnailAndBlurHash(anything()),
      ).thenResolve({
        thumbnail: new ArrayBuffer(50),
        width: 100,
        height: 101,
        size: 50,
        mimeType: 'image/jpeg',
        blurHash: 'blurhash',
      })

      await expect(instanceUnderTest.sendMedia(input)).resolves.not.toThrow()
      const [idArg, contentArg] = capture(
        mockMatrixClientManager.sendMessage,
      ).first()
      expect(idArg).toStrictEqual<typeof idArg>(channelId.toString())
      expect(contentArg).toStrictEqual<typeof contentArg>({
        msgtype: MsgType.Video,
        body: input.fileName,
        info: {
          mimetype: input.fileType,
          size: input.fileSize,
          thumbnail_file: {
            hashes: expect.any(Object),
            iv: expect.any(String),
            v: expect.any(String),
            url: mxcUrl,
            key: expect.any(Object),
          },
          thumbnail_info: {
            w: 100,
            h: 101,
            size: 50,
            mimetype: 'image/jpeg',
            blurhash: 'blurhash',
          } as any,
        },
        file: {
          hashes: expect.any(Object),
          iv: expect.any(String),
          v: expect.any(String),
          url: mxcUrl,
          key: expect.any(Object),
        },
      })
    })
  })

  describe('get', () => {
    it('calls matrixClient correctly and returns partial result', async () => {
      const handleId = new HandleId('testHandleId')
      const messageId = 'messageId'
      when(
        mockMatrixClientManager.getMessage(anything(), anything()),
      ).thenResolve(EntityDataFactory.partialMessage)
      when(
        mockMatrixClientManager.getReplacements(anything(), anything()),
      ).thenResolve([])
      when(
        mockMatrixClientManager.getReactions(anything(), anything()),
      ).thenResolve([])
      when(
        mockMatrixClientManager.getReadReceipts(
          anything(),
          anything(),
          anything(),
        ),
      ).thenResolve([])

      const input: GetMessageInput = {
        recipient: handleId,
        messageId,
      }
      await expect(instanceUnderTest.get(input)).resolves.toEqual(
        EntityDataFactory.partialMessage,
      )

      const [idArg, eventIdArg] = capture(
        mockMatrixClientManager.getMessage,
      ).first()
      expect(idArg).toStrictEqual<typeof idArg>(input.messageId)
      expect(eventIdArg).toStrictEqual<typeof eventIdArg>(handleId.toString())
      verify(mockMatrixClientManager.getMessage(anything(), anything())).once()
      verify(
        mockMatrixClientManager.getReplacements(anything(), anything()),
      ).once()
      verify(
        mockMatrixClientManager.getReactions(anything(), anything()),
      ).once()
      verify(
        mockMatrixClientManager.getReadReceipts(
          anything(),
          anything(),
          anything(),
        ),
      ).once()
    })

    it('calls matrixClient correctly and returns result', async () => {
      const handleId = new HandleId('testHandleId')
      const messageId = 'messageId'
      when(
        mockMatrixClientManager.getMessage(anything(), anything()),
      ).thenResolve(EntityDataFactory.partialMessage)
      when(
        mockMatrixClientManager.getReplacements(anything(), anything()),
      ).thenResolve([])
      when(
        mockMatrixClientManager.getReactions(anything(), anything()),
      ).thenResolve([EntityDataFactory.reaction])
      when(
        mockMatrixClientManager.getReadReceipts(
          anything(),
          anything(),
          anything(),
        ),
      ).thenResolve([])

      const input: GetMessageInput = {
        recipient: handleId,
        messageId,
      }
      await expect(instanceUnderTest.get(input)).resolves.toEqual({
        ...EntityDataFactory.message,
        receipts: [],
      })

      const [idArg, eventIdArg] = capture(
        mockMatrixClientManager.getMessage,
      ).first()
      expect(idArg).toStrictEqual<typeof idArg>(input.messageId)
      expect(eventIdArg).toStrictEqual<typeof eventIdArg>(handleId.toString())
      verify(mockMatrixClientManager.getMessage(anything(), anything())).once()
      verify(
        mockMatrixClientManager.getReplacements(anything(), anything()),
      ).once()
      verify(
        mockMatrixClientManager.getReactions(anything(), anything()),
      ).once()
      verify(
        mockMatrixClientManager.getReadReceipts(
          anything(),
          anything(),
          anything(),
        ),
      ).once()
    })

    it('calls matrixClient correctly and returns edited result', async () => {
      const handleId = new HandleId('testHandleId')
      const messageId = 'messageId'
      when(
        mockMatrixClientManager.getMessage(anything(), anything()),
      ).thenResolve(EntityDataFactory.partialMessage)
      when(
        mockMatrixClientManager.getReplacements(anything(), anything()),
      ).thenResolve([
        {
          ...EntityDataFactory.partialMessage,
          content: { type: 'm.text', text: 'Edited message', isEdited: false },
        },
      ])
      when(
        mockMatrixClientManager.getReactions(anything(), anything()),
      ).thenResolve([EntityDataFactory.reaction])
      when(
        mockMatrixClientManager.getReadReceipts(
          anything(),
          anything(),
          anything(),
        ),
      ).thenResolve([EntityDataFactory.receipt])

      const input: GetMessageInput = {
        recipient: handleId,
        messageId,
      }
      await expect(instanceUnderTest.get(input)).resolves.toEqual({
        ...EntityDataFactory.message,
        content: { type: 'm.text', text: 'Edited message', isEdited: true },
      })

      const [idArg, eventIdArg] = capture(
        mockMatrixClientManager.getMessage,
      ).first()
      expect(idArg).toStrictEqual<typeof idArg>(input.messageId)
      expect(eventIdArg).toStrictEqual<typeof eventIdArg>(handleId.toString())
      verify(mockMatrixClientManager.getMessage(anything(), anything())).once()
      verify(
        mockMatrixClientManager.getReplacements(anything(), anything()),
      ).once()
      verify(
        mockMatrixClientManager.getReactions(anything(), anything()),
      ).once()
      verify(
        mockMatrixClientManager.getReadReceipts(
          anything(),
          anything(),
          anything(),
        ),
      ).once()
    })

    it('calls matrixClient correctly with undefined result', async () => {
      const handleId = new HandleId('testHandleId')
      const messageId = 'messageId'
      when(
        mockMatrixClientManager.getMessage(anything(), anything()),
      ).thenResolve(undefined)

      const input: GetMessageInput = {
        recipient: handleId,
        messageId,
      }
      await expect(instanceUnderTest.get(input)).resolves.toEqual(undefined)

      const [idArg, eventIdArg] = capture(
        mockMatrixClientManager.getMessage,
      ).first()
      expect(idArg).toStrictEqual<typeof idArg>(input.messageId)
      expect(eventIdArg).toStrictEqual<typeof eventIdArg>(handleId.toString())
      verify(mockMatrixClientManager.getMessage(anything(), anything())).once()
    })
  })

  describe('edit', () => {
    it('calls matrixClient correctly', async () => {
      const handleId = new HandleId('testHandleId')
      const message = 'Edit a message'

      const input: EditMessageInput = {
        recipient: handleId,
        messageId: 'messageId',
        message,
      }
      await expect(instanceUnderTest.edit(input)).resolves.not.toThrow()

      const [idArg, eventIdArg, contentArg] = capture(
        mockMatrixClientManager.editMessage,
      ).first()
      expect(idArg).toStrictEqual<typeof idArg>(handleId.toString())
      expect(eventIdArg).toStrictEqual<typeof eventIdArg>(input.messageId)
      expect(contentArg).toStrictEqual<typeof contentArg>({
        msgtype: MsgType.Text,
        body: 'Edit a message',
      })
      verify(
        mockMatrixClientManager.editMessage(anything(), anything(), anything()),
      ).once()
    })
  })

  describe('delete', () => {
    it('calls matrixClient correctly', async () => {
      const handleId = new HandleId('testHandleId')

      const input: DeleteMessageInput = {
        recipient: handleId,
        messageId: 'messageId',
      }
      await expect(instanceUnderTest.delete(input)).resolves.not.toThrow()

      const [idArg, eventIdArg] = capture(
        mockMatrixClientManager.deleteMessage,
      ).first()
      expect(idArg).toStrictEqual<typeof idArg>(handleId.toString())
      expect(eventIdArg).toStrictEqual<typeof eventIdArg>(input.messageId)
      verify(
        mockMatrixClientManager.deleteMessage(
          anything(),
          anything(),
          anything(),
        ),
      ).once()
    })

    it('calls matrixClient correctly with a redaction reason', async () => {
      const handleId = new HandleId('testHandleId')

      const input: DeleteMessageInput = {
        recipient: handleId,
        messageId: 'messageId',
        reason: {
          type: 'deleteOwn',
        } as DeleteOwnRedactReasonEntity,
      }
      await expect(instanceUnderTest.delete(input)).resolves.not.toThrow()

      const [idArg, eventIdArg, reasonArg] = capture(
        mockMatrixClientManager.deleteMessage,
      ).first()
      expect(idArg).toStrictEqual<typeof idArg>(handleId.toString())
      expect(eventIdArg).toStrictEqual<typeof eventIdArg>(input.messageId)
      expect(reasonArg).toStrictEqual<typeof reasonArg>('deleteOwn')
      verify(
        mockMatrixClientManager.deleteMessage(
          anything(),
          anything(),
          anything(),
        ),
      ).once()
    })
  })

  describe('list', () => {
    it('calls matrixClient correctly and returns a single result', async () => {
      const handleId = new HandleId('testHandleId')
      when(
        mockMatrixClientManager.listMessages(
          anything(),
          anything(),
          anything(),
        ),
      ).thenResolve({
        messages: [EntityDataFactory.partialMessage],
        nextToken: undefined,
      })
      when(
        mockMatrixClientManager.getReplacements(anything(), anything()),
      ).thenResolve([])
      when(
        mockMatrixClientManager.getReactions(anything(), anything()),
      ).thenResolve([])
      when(
        mockMatrixClientManager.getReadReceipts(
          anything(),
          anything(),
          anything(),
        ),
      ).thenResolve([])

      const input: ListMessagesInput = {
        recipient: handleId,
      }
      const result = await instanceUnderTest.list(input)

      expect(result).toStrictEqual({
        messages: [EntityDataFactory.partialMessage],
        nextToken: undefined,
      })
      const [roomIdArg, pageTokenArg, pageSizeArg] = capture(
        mockMatrixClientManager.listMessages,
      ).first()
      expect(roomIdArg).toStrictEqual<typeof roomIdArg>(handleId.toString())
      expect(pageTokenArg).toStrictEqual<typeof pageTokenArg>(undefined)
      expect(pageSizeArg).toStrictEqual<typeof pageSizeArg>(undefined)
      verify(
        mockMatrixClientManager.listMessages(
          anything(),
          anything(),
          anything(),
        ),
      ).once()
      verify(
        mockMatrixClientManager.getReplacements(anything(), anything()),
      ).once()
      verify(
        mockMatrixClientManager.getReactions(anything(), anything()),
      ).once()
      verify(
        mockMatrixClientManager.getReadReceipts(
          anything(),
          anything(),
          anything(),
        ),
      ).once()
    })

    it('calls matrixClient correctly and returns a single edited result', async () => {
      const handleId = new HandleId('testHandleId')
      when(
        mockMatrixClientManager.listMessages(
          anything(),
          anything(),
          anything(),
        ),
      ).thenResolve({
        messages: [EntityDataFactory.partialMessage],
        nextToken: undefined,
      })
      when(
        mockMatrixClientManager.getReplacements(anything(), anything()),
      ).thenResolve([
        {
          ...EntityDataFactory.partialMessage,
          content: { type: 'm.text', text: 'Edited message', isEdited: false },
        },
      ])
      when(
        mockMatrixClientManager.getReactions(anything(), anything()),
      ).thenResolve([EntityDataFactory.reaction])
      when(
        mockMatrixClientManager.getReadReceipts(
          anything(),
          anything(),
          anything(),
        ),
      ).thenResolve([EntityDataFactory.receipt])

      const input: ListMessagesInput = {
        recipient: handleId,
      }
      const result = await instanceUnderTest.list(input)

      expect(result).toStrictEqual({
        messages: [
          {
            ...EntityDataFactory.message,
            content: { type: 'm.text', text: 'Edited message', isEdited: true },
          },
        ],
        nextToken: undefined,
      })
      const [roomIdArg, pageTokenArg, pageSizeArg] = capture(
        mockMatrixClientManager.listMessages,
      ).first()
      expect(roomIdArg).toStrictEqual<typeof roomIdArg>(handleId.toString())
      expect(pageTokenArg).toStrictEqual<typeof pageTokenArg>(undefined)
      expect(pageSizeArg).toStrictEqual<typeof pageSizeArg>(undefined)
      verify(
        mockMatrixClientManager.listMessages(
          anything(),
          anything(),
          anything(),
        ),
      ).once()
      verify(
        mockMatrixClientManager.getReplacements(anything(), anything()),
      ).once()
      verify(
        mockMatrixClientManager.getReactions(anything(), anything()),
      ).once()
      verify(
        mockMatrixClientManager.getReadReceipts(
          anything(),
          anything(),
          anything(),
        ),
      ).once()
    })

    it('calls matrixClient correctly and returns multiple results correctly', async () => {
      const handleId = new HandleId('testHandleId')
      when(
        mockMatrixClientManager.listMessages(
          anything(),
          anything(),
          anything(),
        ),
      ).thenResolve({
        messages: [
          EntityDataFactory.partialMessage,
          { ...EntityDataFactory.partialMessage, messageId: 'testMessageId2' },
        ],
        nextToken: undefined,
      })
      when(
        mockMatrixClientManager.getReplacements(anything(), anything()),
      ).thenResolve([])
      when(
        mockMatrixClientManager.getReactions(anything(), anything()),
      ).thenResolve([])
      when(
        mockMatrixClientManager.getReadReceipts(
          anything(),
          anything(),
          anything(),
        ),
      ).thenResolve([])

      const limit = 10
      const nextToken = 'nextToken'
      const input: ListMessagesInput = {
        recipient: handleId,
        limit,
        nextToken,
      }
      const result = await instanceUnderTest.list(input)

      expect(result).toStrictEqual({
        messages: [
          EntityDataFactory.partialMessage,
          { ...EntityDataFactory.partialMessage, messageId: 'testMessageId2' },
        ],
        nextToken: undefined,
      })
      const [roomIdArg, limitArg, nextTokenArg] = capture(
        mockMatrixClientManager.listMessages,
      ).first()
      expect(roomIdArg).toStrictEqual<typeof roomIdArg>(handleId.toString())
      expect(limitArg).toStrictEqual<typeof limitArg>(limit)
      expect(nextTokenArg).toStrictEqual<typeof nextTokenArg>(nextToken)
      verify(
        mockMatrixClientManager.listMessages(
          anything(),
          anything(),
          anything(),
        ),
      ).once()
      verify(
        mockMatrixClientManager.getReplacements(anything(), anything()),
      ).twice()
      verify(
        mockMatrixClientManager.getReactions(anything(), anything()),
      ).twice()
      verify(
        mockMatrixClientManager.getReadReceipts(
          anything(),
          anything(),
          anything(),
        ),
      ).twice()
    })

    it('calls matrixClient correctly and returns empty result correctly', async () => {
      const handleId = new HandleId('testHandleId')
      when(
        mockMatrixClientManager.listMessages(
          anything(),
          anything(),
          anything(),
        ),
      ).thenResolve({
        messages: [],
        nextToken: undefined,
      })

      const input: ListMessagesInput = {
        recipient: handleId,
      }
      const result = await instanceUnderTest.list(input)

      expect(result).toStrictEqual({
        messages: [],
        nextToken: undefined,
      })
      const [roomIdArg, pageTokenArg, pageSizeArg] = capture(
        mockMatrixClientManager.listMessages,
      ).first()
      expect(roomIdArg).toStrictEqual<typeof roomIdArg>(handleId.toString())
      expect(pageTokenArg).toStrictEqual<typeof pageTokenArg>(undefined)
      expect(pageSizeArg).toStrictEqual<typeof pageSizeArg>(undefined)
      verify(
        mockMatrixClientManager.listMessages(
          anything(),
          anything(),
          anything(),
        ),
      ).once()
    })
  })

  describe('getChatSummaries', () => {
    it('calls matrixClient correctly and returns a single result correctly', async () => {
      const rcptH = new HandleId('handleId1')
      const rcptG = new GroupId('groupId1')
      const recipients = [rcptH, rcptG]
      when(mockMatrixClientManager.getChatSummaries(anything())).thenResolve([
        EntityDataFactory.chatSummary,
      ])

      const input: GetChatSummariesInput = {
        recipients,
      }
      const result = await instanceUnderTest.getChatSummaries(input)

      expect(result).toStrictEqual([EntityDataFactory.chatSummary])
      const [idArg] = capture(mockMatrixClientManager.getChatSummaries).first()
      const roomIds = new Map<Recipient, string>()
      roomIds.set(rcptH, rcptH.toString()) // handleId mapped to room Id
      roomIds.set(rcptG, rcptG.toString()) // groupId is already the room Id
      expect(idArg).toStrictEqual<typeof idArg>(roomIds)
      verify(mockMatrixClientManager.getChatSummaries(anything())).once()
    })
  })

  describe('searchMessages', () => {
    it('calls matrixClient correctly and returns a single result', async () => {
      when(
        mockMatrixClientManager.searchMessages(
          anything(),
          anything(),
          anything(),
        ),
      ).thenResolve({
        messages: [EntityDataFactory.searchMessageItem],
        nextToken: undefined,
      })

      const input: SearchMessagesInput = {
        searchText: 'testBody',
      }
      const result = await instanceUnderTest.searchMessages(input)

      expect(result).toStrictEqual({
        messages: [EntityDataFactory.searchMessageItem],
        nextToken: undefined,
      })
      const [searchText, pageTokenArg, pageSizeArg] = capture(
        mockMatrixClientManager.searchMessages,
      ).first()
      expect(searchText).toStrictEqual<typeof searchText>('testBody')
      expect(pageTokenArg).toStrictEqual<typeof pageTokenArg>(undefined)
      expect(pageSizeArg).toStrictEqual<typeof pageSizeArg>(undefined)
      verify(
        mockMatrixClientManager.searchMessages(
          anything(),
          anything(),
          anything(),
        ),
      ).once()
    })

    it('calls matrixClient correctly and returns multiple results correctly', async () => {
      when(
        mockMatrixClientManager.searchMessages(
          anything(),
          anything(),
          anything(),
        ),
      ).thenResolve({
        messages: [
          EntityDataFactory.searchMessageItem,
          {
            ...EntityDataFactory.searchMessageItem,
            messageId: 'testMessageId2',
          },
        ],
        nextToken: undefined,
      })
      const limit = 10
      const nextToken = 'nextToken'
      const input: SearchMessagesInput = {
        searchText: 'testBody',
        limit,
        nextToken,
      }
      const result = await instanceUnderTest.searchMessages(input)

      expect(result).toStrictEqual({
        messages: [
          EntityDataFactory.searchMessageItem,
          {
            ...EntityDataFactory.searchMessageItem,
            messageId: 'testMessageId2',
          },
        ],
        nextToken: undefined,
      })
      const [searchText, limitArg, nextTokenArg] = capture(
        mockMatrixClientManager.searchMessages,
      ).first()
      expect(searchText).toStrictEqual<typeof searchText>('testBody')
      expect(limitArg).toStrictEqual<typeof limitArg>(limit)
      expect(nextTokenArg).toStrictEqual<typeof nextTokenArg>(nextToken)
      verify(
        mockMatrixClientManager.searchMessages(
          anything(),
          anything(),
          anything(),
        ),
      ).once()
    })

    it('calls matrixClient correctly and returns empty result correctly', async () => {
      when(
        mockMatrixClientManager.searchMessages(
          anything(),
          anything(),
          anything(),
        ),
      ).thenResolve({
        messages: [],
        nextToken: undefined,
      })

      const input: SearchMessagesInput = {
        searchText: 'testBody',
      }
      const result = await instanceUnderTest.searchMessages(input)

      expect(result).toStrictEqual({
        messages: [],
        nextToken: undefined,
      })
      const [searchText, pageTokenArg, pageSizeArg] = capture(
        mockMatrixClientManager.searchMessages,
      ).first()
      expect(searchText).toStrictEqual<typeof searchText>('testBody')
      expect(pageTokenArg).toStrictEqual<typeof pageTokenArg>(undefined)
      expect(pageSizeArg).toStrictEqual<typeof pageSizeArg>(undefined)
      verify(
        mockMatrixClientManager.searchMessages(
          anything(),
          anything(),
          anything(),
        ),
      ).once()
    })
  })

  describe('markAsRead', () => {
    it('calls matrixClient correctly', async () => {
      const handleId = new HandleId('testHandleId')
      const input: MarkAsReadInput = {
        recipient: handleId,
      }
      when(mockMatrixClientManager.sendReadReceipt(anything())).thenResolve()

      await expect(instanceUnderTest.markAsRead(input)).resolves.not.toThrow()

      const [idArg] = capture(mockMatrixClientManager.sendReadReceipt).first()
      expect(idArg).toStrictEqual<typeof idArg>(handleId.toString())
      verify(mockMatrixClientManager.sendReadReceipt(anything())).once()
    })
  })

  describe('sendTypingNotification', () => {
    it('calls matrixClient correctly', async () => {
      const handleId = new HandleId('testHandleId')
      when(
        mockMatrixClientManager.sendTypingNotification(anything(), anything()),
      ).thenResolve()

      const input: SendTypingNotificationInput = {
        recipient: handleId,
        isTyping: true,
      }
      await expect(
        instanceUnderTest.sendTypingNotification(input),
      ).resolves.not.toThrow()

      const [idArg] = capture(
        mockMatrixClientManager.sendTypingNotification,
      ).first()
      expect(idArg).toStrictEqual<typeof idArg>(handleId.toString())
      verify(
        mockMatrixClientManager.sendTypingNotification(anything(), anything()),
      ).once()
    })
  })

  describe('toggleReaction', () => {
    it('calls matrixClient correctly', async () => {
      const handleId = new HandleId('testHandleId')
      when(
        mockMatrixClientManager.toggleReaction(
          anything(),
          anything(),
          anything(),
          anything(),
        ),
      ).thenResolve()

      const input: ToggleReactionInput = {
        recipient: handleId,
        messageId: 'messageId',
        content: 'content',
        customFields: {
          testField: 'testFieldValue',
        },
      }
      await expect(
        instanceUnderTest.toggleReaction(input),
      ).resolves.not.toThrow()

      const [idArg, eventIdArg, contentArg] = capture(
        mockMatrixClientManager.toggleReaction,
      ).first()
      expect(idArg).toStrictEqual<typeof idArg>(handleId.toString())
      expect(eventIdArg).toStrictEqual<typeof eventIdArg>(input.messageId)
      expect(contentArg).toStrictEqual<typeof contentArg>(input.content)
      verify(
        mockMatrixClientManager.toggleReaction(
          anything(),
          anything(),
          anything(),
          anything(),
        ),
      ).once()
    })
  })

  describe('pinUnpinMessage', () => {
    it('calls matrixClient correctly', async () => {
      const handleId = new HandleId('testHandleId')
      when(
        mockMatrixClientManager.pinUnpinMessage(anything(), anything()),
      ).thenResolve()

      const input: PinUnpinMessageInput = {
        recipient: handleId,
        messageId: 'messageId',
      }
      await expect(
        instanceUnderTest.pinUnpinMessage(input),
      ).resolves.not.toThrow()

      const [idArg, eventIdArg] = capture(
        mockMatrixClientManager.pinUnpinMessage,
      ).first()
      expect(idArg).toStrictEqual<typeof idArg>(handleId.toString())
      expect(eventIdArg).toStrictEqual<typeof eventIdArg>(input.messageId)
      verify(
        mockMatrixClientManager.pinUnpinMessage(anything(), anything()),
      ).once()
    })
  })

  describe('getPinnedMessages', () => {
    it('calls matrixClient correctly and returns a single result', async () => {
      const handleId = new HandleId('testHandleId')
      when(mockMatrixClientManager.getPinnedMessages(anything())).thenResolve([
        EntityDataFactory.partialMessage,
      ])
      when(
        mockMatrixClientManager.getReplacements(anything(), anything()),
      ).thenResolve([])
      when(
        mockMatrixClientManager.getReactions(anything(), anything()),
      ).thenResolve([])
      when(
        mockMatrixClientManager.getReadReceipts(
          anything(),
          anything(),
          anything(),
        ),
      ).thenResolve([])

      const input: GetPinnedMessagesInput = {
        recipient: handleId,
      }
      const result = await instanceUnderTest.getPinnedMessages(input)

      expect(result).toStrictEqual([EntityDataFactory.partialMessage])
      const [roomIdArg] = capture(
        mockMatrixClientManager.getPinnedMessages,
      ).first()
      expect(roomIdArg).toStrictEqual<typeof roomIdArg>(handleId.toString())
      verify(mockMatrixClientManager.getPinnedMessages(anything())).once()
      verify(
        mockMatrixClientManager.getReplacements(anything(), anything()),
      ).once()
      verify(
        mockMatrixClientManager.getReactions(anything(), anything()),
      ).once()
      verify(
        mockMatrixClientManager.getReadReceipts(
          anything(),
          anything(),
          anything(),
        ),
      ).once()
    })

    it('calls matrixClient correctly and returns a single edited result', async () => {
      const handleId = new HandleId('testHandleId')
      when(mockMatrixClientManager.getPinnedMessages(anything())).thenResolve([
        EntityDataFactory.partialMessage,
      ])
      when(
        mockMatrixClientManager.getReplacements(anything(), anything()),
      ).thenResolve([
        {
          ...EntityDataFactory.partialMessage,
          content: { type: 'm.text', text: 'Edited message', isEdited: false },
        },
      ])
      when(
        mockMatrixClientManager.getReactions(anything(), anything()),
      ).thenResolve([EntityDataFactory.reaction])
      when(
        mockMatrixClientManager.getReadReceipts(
          anything(),
          anything(),
          anything(),
        ),
      ).thenResolve([EntityDataFactory.receipt])

      const input: GetPinnedMessagesInput = {
        recipient: handleId,
      }
      const result = await instanceUnderTest.getPinnedMessages(input)

      expect(result).toStrictEqual([
        {
          ...EntityDataFactory.message,
          content: { type: 'm.text', text: 'Edited message', isEdited: true },
        },
      ])
      const [roomIdArg] = capture(
        mockMatrixClientManager.getPinnedMessages,
      ).first()
      expect(roomIdArg).toStrictEqual<typeof roomIdArg>(handleId.toString())
      verify(mockMatrixClientManager.getPinnedMessages(anything())).once()
      verify(
        mockMatrixClientManager.getReplacements(anything(), anything()),
      ).once()
      verify(
        mockMatrixClientManager.getReactions(anything(), anything()),
      ).once()
      verify(
        mockMatrixClientManager.getReadReceipts(
          anything(),
          anything(),
          anything(),
        ),
      ).once()
    })

    it('calls matrixClient correctly and returns multiple results correctly', async () => {
      const handleId = new HandleId('testHandleId')
      when(mockMatrixClientManager.getPinnedMessages(anything())).thenResolve([
        EntityDataFactory.partialMessage,
        { ...EntityDataFactory.partialMessage, messageId: 'testMessageId2' },
      ])
      when(
        mockMatrixClientManager.getReplacements(anything(), anything()),
      ).thenResolve([])
      when(
        mockMatrixClientManager.getReactions(anything(), anything()),
      ).thenResolve([])
      when(
        mockMatrixClientManager.getReadReceipts(
          anything(),
          anything(),
          anything(),
        ),
      ).thenResolve([])

      const input: GetPinnedMessagesInput = {
        recipient: handleId,
      }
      const result = await instanceUnderTest.getPinnedMessages(input)

      expect(result).toStrictEqual([
        EntityDataFactory.partialMessage,
        { ...EntityDataFactory.partialMessage, messageId: 'testMessageId2' },
      ])
      const [roomIdArg] = capture(
        mockMatrixClientManager.getPinnedMessages,
      ).first()
      expect(roomIdArg).toStrictEqual<typeof roomIdArg>(handleId.toString())
      verify(mockMatrixClientManager.getPinnedMessages(anything())).once()
      verify(
        mockMatrixClientManager.getReplacements(anything(), anything()),
      ).twice()
      verify(
        mockMatrixClientManager.getReactions(anything(), anything()),
      ).twice()
      verify(
        mockMatrixClientManager.getReadReceipts(
          anything(),
          anything(),
          anything(),
        ),
      ).twice()
    })

    it('calls matrixClient correctly and returns empty result correctly', async () => {
      const handleId = new HandleId('testHandleId')
      when(mockMatrixClientManager.getPinnedMessages(anything())).thenResolve(
        [],
      )

      const input: GetPinnedMessagesInput = {
        recipient: handleId,
      }
      const result = await instanceUnderTest.getPinnedMessages(input)

      expect(result).toStrictEqual([])
      const [roomIdArg] = capture(
        mockMatrixClientManager.getPinnedMessages,
      ).first()
      expect(roomIdArg).toStrictEqual<typeof roomIdArg>(handleId.toString())
      verify(mockMatrixClientManager.getPinnedMessages(anything())).once()
    })
  })

  describe('createPoll', () => {
    it('calls matrixClient correctly', async () => {
      const handleId = new HandleId('testHandleId')
      const type = PollTypeEntity.DISCLOSED
      const question = 'What is the capital of France?'
      const answers = ['Paris', 'London', 'Berlin']
      const maxSelections = 1
      const input: CreatePollInput = {
        recipient: handleId,
        type,
        question,
        answers,
        maxSelections,
      }

      await expect(instanceUnderTest.createPoll(input)).resolves.not.toThrow()

      const [idArg, typeArg, questionArg, answersArg, maxSelectionsArg] =
        capture(mockMatrixClientManager.createPoll).first()
      expect(idArg).toStrictEqual<typeof idArg>(handleId.toString())
      expect(typeArg).toStrictEqual<typeof typeArg>(
        'org.matrix.msc3381.poll.disclosed',
      )
      expect(questionArg).toStrictEqual<typeof questionArg>(question)
      expect(answersArg).toStrictEqual<typeof answersArg>(answers)
      expect(maxSelectionsArg).toStrictEqual<typeof maxSelectionsArg>(
        maxSelections,
      )
      verify(
        mockMatrixClientManager.createPoll(
          anything(),
          anything(),
          anything(),
          anything(),
          anything(),
        ),
      ).once()
    })
  })

  describe('sendPollResponse', () => {
    it('calls matrixClient correctly', async () => {
      const recipient = new HandleId('testRecipientHandleId')
      const answers = ['Paris']
      const pollId = 'pollId'
      const input: SendPollResponseInput = {
        recipient,
        pollId,
        answers,
      }

      await expect(
        instanceUnderTest.sendPollResponse(input),
      ).resolves.not.toThrow()

      const [recipientArg, pollIdArg, answersArg] = capture(
        mockMatrixClientManager.sendPollResponse,
      ).first()
      expect(recipientArg).toStrictEqual<typeof recipientArg>(
        recipient.toString(),
      )
      expect(pollIdArg).toStrictEqual<typeof pollIdArg>(pollId)
      expect(answersArg).toStrictEqual<typeof answersArg>(answers)
      verify(
        mockMatrixClientManager.sendPollResponse(
          anything(),
          anything(),
          anything(),
        ),
      ).once()
    })
  })

  describe('editPoll', () => {
    it('calls matrixClient correctly', async () => {
      const handleId = new HandleId('testHandleId')
      const pollId = 'pollId'
      const type = PollTypeEntity.DISCLOSED
      const question = 'What is the capital of France?'
      const answers = ['Paris', 'London', 'Berlin']
      const maxSelections = 1
      const input: EditPollInput = {
        recipient: handleId,
        pollId,
        type,
        question,
        answers,
        maxSelections,
      }

      await expect(instanceUnderTest.editPoll(input)).resolves.not.toThrow()

      const [roomIdArg, pollIdArg] = capture(
        mockMatrixClientManager.endPoll,
      ).first()
      expect(roomIdArg).toStrictEqual<typeof roomIdArg>(handleId.toString())
      expect(pollIdArg).toStrictEqual<typeof pollIdArg>(pollId)
      verify(mockMatrixClientManager.endPoll(anything(), anything())).once()

      const [idArg, typeArg, questionArg, answersArg, maxSelectionsArg] =
        capture(mockMatrixClientManager.createPoll).first()
      expect(idArg).toStrictEqual<typeof idArg>(handleId.toString())
      expect(typeArg).toStrictEqual<typeof typeArg>(
        'org.matrix.msc3381.poll.disclosed',
      )
      expect(questionArg).toStrictEqual<typeof questionArg>(question)
      expect(answersArg).toStrictEqual<typeof answersArg>(answers)
      expect(maxSelectionsArg).toStrictEqual<typeof maxSelectionsArg>(
        maxSelections,
      )
      verify(
        mockMatrixClientManager.createPoll(
          anything(),
          anything(),
          anything(),
          anything(),
          anything(),
        ),
      ).once()
    })
  })

  describe('endPoll', () => {
    it('calls matrixClient correctly', async () => {
      const recipient = new HandleId('testRecipientHandleId')
      const pollId = 'pollId'
      const input: EndPollInput = {
        recipient,
        pollId,
      }

      await expect(instanceUnderTest.endPoll(input)).resolves.not.toThrow()

      const [recipientArg, pollIdArg] = capture(
        mockMatrixClientManager.endPoll,
      ).first()
      expect(recipientArg).toStrictEqual<typeof recipientArg>(
        recipient.toString(),
      )
      expect(pollIdArg).toStrictEqual<typeof pollIdArg>(pollId)
      verify(mockMatrixClientManager.endPoll(anything(), anything())).once()
    })
  })

  describe('getPollResponses', () => {
    it('calls matrixClient correctly and returns a result correctly', async () => {
      const handleId = new HandleId('testHandleId')
      const pollId = 'testPollId'
      when(
        mockMatrixClientManager.getPollResponses(anything(), anything()),
      ).thenResolve(EntityDataFactory.pollResponses)

      const input: GetPollResponsesInput = {
        recipient: handleId,
        pollId,
      }
      const result = await instanceUnderTest.getPollResponses(input)

      expect(result).toStrictEqual(EntityDataFactory.pollResponses)
      const [roomIdArg, pollIdArg] = capture(
        mockMatrixClientManager.getPollResponses,
      ).first()
      expect(roomIdArg).toStrictEqual<typeof roomIdArg>(handleId.toString())
      expect(pollIdArg).toStrictEqual<typeof pollIdArg>(pollId)
      verify(
        mockMatrixClientManager.getPollResponses(anything(), anything()),
      ).once()
    })

    it('calls matrixClient correctly and returns empty result correctly', async () => {
      const handleId = new HandleId('testHandleId')
      const pollId = 'testPollId'
      when(
        mockMatrixClientManager.getPollResponses(anything(), anything()),
      ).thenResolve({
        endedAt: undefined,
        talliedAnswers: {},
        totalVotes: 0,
      })

      const input: GetPollResponsesInput = {
        recipient: handleId,
        pollId,
      }
      const result = await instanceUnderTest.getPollResponses(input)

      expect(result).toStrictEqual({
        endedAt: undefined,
        talliedAnswers: {},
        totalVotes: 0,
      })
      const [roomIdArg, pollIdArg] = capture(
        mockMatrixClientManager.getPollResponses,
      ).first()
      expect(roomIdArg).toStrictEqual<typeof roomIdArg>(handleId.toString())
      expect(pollIdArg).toStrictEqual<typeof pollIdArg>(pollId)
      verify(
        mockMatrixClientManager.getPollResponses(anything(), anything()),
      ).once()
    })
  })
})
