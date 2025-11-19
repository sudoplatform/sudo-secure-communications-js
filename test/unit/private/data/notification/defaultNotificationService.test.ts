/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  IPushRules,
  MatrixEvent,
  PushRuleKind,
  PushRuleSet,
} from 'matrix-js-sdk/lib/matrix'
import { anything, instance, mock, reset, verify, when } from 'ts-mockito'
import { MatrixClientManager } from '../../../../../src/private/data/common/matrixClientManager'
import { MessageTransformer } from '../../../../../src/private/data/messaging/transformer/messageTransformer'
import { DefaultNotificationService } from '../../../../../src/private/data/notification/defaultNotificationService'
import { MatrixRoomsService } from '../../../../../src/private/data/rooms/matrixRoomsService'
import {
  MessageEntity,
  MessageStateEntity,
} from '../../../../../src/private/domain/entities/messaging/messageEntity'
import {
  ClearRecipientChatRulesInput,
  SetDefaultChatRulesInput,
  SetDefaultEventRulesInput,
  SetRecipientChatRulesInput,
} from '../../../../../src/private/domain/entities/notification/notificationService'
import {
  CustomRoomType,
  RoomEntity,
} from '../../../../../src/private/domain/entities/rooms/roomEntity'
import {
  ChannelId,
  ChannelInvite,
  ChatId,
  DirectChatInvite,
  GroupId,
  GroupInvite,
  HandleId,
  MessageNotification,
  MessageNotificationLevel,
  NotificationInfoType,
  NotificationSettings,
  Text,
} from '../../../../../src/public'

describe('DefaultNotificationService Test Suite', () => {
  const mockMatrixClientManager = mock<MatrixClientManager>()
  const mockRoomsService = mock<MatrixRoomsService>()

  let instanceUnderTest: DefaultNotificationService

  const testHandleId = new HandleId('testHandleId')
  const testChatId = new ChatId('testChatId')
  const testGroupId = new GroupId('testGroupId')
  const testChannelId = new ChannelId('testChannelId')
  const testEventId = 'testEventId'

  beforeEach(() => {
    reset(mockMatrixClientManager)
    reset(mockRoomsService)

    instanceUnderTest = new DefaultNotificationService(
      instance(mockMatrixClientManager),
      instance(mockRoomsService),
    )

    when(mockMatrixClientManager.getUserId()).thenReturn(
      Promise.resolve(testHandleId.value),
    )

    when(mockMatrixClientManager.getPushRules()).thenResolve({
      global: {
        [PushRuleKind.Underride]: [
          {
            rule_id: '.m.rule.message',
            actions: ['notify'],
            enabled: true,
          },
        ],
        [PushRuleKind.Override]: [
          {
            rule_id: '.m.rule.invite_for_me',
            actions: ['notify'],
            enabled: true,
          },
          {
            rule_id: 'custom.rule.room.testChatId',
            actions: ['notify'],
            enabled: true,
          },
        ],
      } as PushRuleSet,
    } as IPushRules)
  })

  describe('getDecodedInfo', () => {
    it('gets decoded invite info successfully', async () => {
      when(
        mockMatrixClientManager.fetchRoomEvent(anything(), testEventId),
      ).thenReturn(
        Promise.resolve(
          new MatrixEvent({
            type: 'm.room.member',
            state_key: 'testHandleId',
            content: {
              membership: 'invite',
              inviter: 'testInviterId',
            },
          }),
        ),
      )

      // chat invite
      const inputChatInvite = {
        handleId: testHandleId,
        eventId: testEventId,
        roomId: testChatId.value,
      }
      const expectedChatInvite: DirectChatInvite = {
        handleId: testHandleId,
        type: NotificationInfoType.invite,
        recipient: testChatId,
        chatId: testChatId,
      }
      when(mockRoomsService.get(testChatId.value)).thenReturn(
        Promise.resolve({
          roomId: testChatId.value,
          type: CustomRoomType.DIRECT_CHAT,
        } as unknown as RoomEntity),
      )
      const decodedInfoChat =
        await instanceUnderTest.getDecodedInfo(inputChatInvite)
      expect(decodedInfoChat).toEqual(expectedChatInvite)

      // group invite
      const inputGroupInvite = {
        handleId: testHandleId,
        eventId: testEventId,
        roomId: testGroupId.value,
      }
      const expectedGroupInvite: GroupInvite = {
        handleId: testHandleId,
        type: NotificationInfoType.invite,
        recipient: testGroupId,
        groupId: testGroupId,
      }
      when(mockRoomsService.get(testGroupId.value)).thenReturn(
        Promise.resolve({
          roomId: testGroupId.value,
          type: CustomRoomType.GROUP,
        } as unknown as RoomEntity),
      )
      const decodedInfoGroup =
        await instanceUnderTest.getDecodedInfo(inputGroupInvite)
      expect(decodedInfoGroup).toEqual(expectedGroupInvite)

      // channel invite
      const inputChannelInvite = {
        handleId: testHandleId,
        eventId: testEventId,
        roomId: testChannelId.value,
      }
      const expectedChannelInvite: ChannelInvite = {
        handleId: testHandleId,
        type: NotificationInfoType.invite,
        recipient: testChannelId,
        channelId: testChannelId,
      }
      when(mockRoomsService.get(testChannelId.value)).thenReturn(
        Promise.resolve({
          roomId: testChannelId.value,
          type: CustomRoomType.PUBLIC_INVITE_ONLY_CHANNEL,
        } as unknown as RoomEntity),
      )
      const decodedInfoChannel =
        await instanceUnderTest.getDecodedInfo(inputChannelInvite)
      expect(decodedInfoChannel).toEqual(expectedChannelInvite)
    })

    it('gets decoded message info successfully', async () => {
      when(
        mockMatrixClientManager.fetchRoomEvent(testChatId.value, testEventId),
      ).thenReturn(
        Promise.resolve(
          new MatrixEvent({
            type: 'm.room.message',
            event_id: 'testEventId',
            sender: 'testSenderId',
            content: {
              msgtype: 'm.text',
              body: 'testBody',
            },
          }),
        ),
      )

      const messageEntity: MessageEntity = {
        messageId: 'testMessageId',
        state: MessageStateEntity.COMMITTED,
        timestamp: 1717000000000,
        senderHandle: {
          handleId: new HandleId('testSenderId'),
          name: 'testSenderHandleName',
        },
        isOwn: false,
        content: {
          text: 'testBody',
          isEdited: false,
        } as Text,
        reactions: [],
        receipts: [],
        isVerified: false,
      }

      const input = {
        handleId: testHandleId,
        eventId: testEventId,
        roomId: testChatId.value,
      }
      const transformer = new MessageTransformer()
      const expected: MessageNotification = {
        handleId: testHandleId,
        type: NotificationInfoType.message,
        recipient: testChatId,
        message: transformer.fromEntityToAPI(messageEntity),
      }

      when(
        mockMatrixClientManager.getMessage(testEventId, testChatId.value),
      ).thenReturn(Promise.resolve(messageEntity))
      when(mockRoomsService.get(testChatId.value)).thenReturn(
        Promise.resolve({
          roomId: testChatId.value,
          type: CustomRoomType.DIRECT_CHAT,
        } as unknown as RoomEntity),
      )

      await expect(instanceUnderTest.getDecodedInfo(input)).resolves.toEqual(
        expected,
      )
    })
  })

  describe('getSettings', () => {
    it('gets settings successfully', async () => {
      const expected: NotificationSettings = {
        defaultChatRules: {
          messageLevel: MessageNotificationLevel.allMessages,
        },
        defaultEventRules: {
          invitations: true,
        },
        recipientChatRules: {
          [testChatId.value]: {
            messageLevel: MessageNotificationLevel.allMessages,
          },
        },
      }

      await expect(instanceUnderTest.getSettings()).resolves.toEqual(expected)

      verify(mockMatrixClientManager.getPushRules()).once()
    })
  })

  describe('setDefaultChatRules', () => {
    it('sets default chat rules successfully', async () => {
      const mockMatrixClientManager = mock<MatrixClientManager>()
      const mockRoomsService = mock<MatrixRoomsService>()

      const instanceUnderTest = new DefaultNotificationService(
        instance(mockMatrixClientManager),
        instance(mockRoomsService),
      )

      const input: SetDefaultChatRulesInput = {
        chatRules: {
          messageLevel: MessageNotificationLevel.allMessages,
        },
      }

      await expect(
        instanceUnderTest.setDefaultChatRules(input),
      ).resolves.not.toThrow()

      verify(
        mockMatrixClientManager.setPushRuleActions(
          anything(),
          anything(),
          anything(),
          anything(),
        ),
      ).times(6)
      verify(
        mockMatrixClientManager.setPushRuleEnabled(
          anything(),
          anything(),
          anything(),
          anything(),
        ),
      ).times(6)
    })
  })

  describe('setDefaultEventRules', () => {
    it('sets default event rules successfully', async () => {
      const inputTrue: SetDefaultEventRulesInput = {
        eventRules: {
          invitations: true,
        },
      }
      await expect(
        instanceUnderTest.setDefaultEventRules(inputTrue),
      ).resolves.not.toThrow()

      const inputFalse: SetDefaultEventRulesInput = {
        eventRules: {
          invitations: false,
        },
      }

      await expect(
        instanceUnderTest.setDefaultEventRules(inputFalse),
      ).resolves.not.toThrow()
    })
  })

  describe('setRecipientChatRules', () => {
    it('sets recipient chat rules successfully', async () => {
      const input: SetRecipientChatRulesInput = {
        recipient: testChatId,
        chatRules: {
          messageLevel: MessageNotificationLevel.allMessages,
        },
      }

      await expect(
        instanceUnderTest.setRecipientChatRules(input),
      ).resolves.not.toThrow()

      verify(
        mockMatrixClientManager.addPushRule(
          anything(),
          anything(),
          anything(),
          anything(),
        ),
      ).once()
    })
  })

  describe('clearRecipientChatRules', () => {
    it('clears recipient chat rules successfully', async () => {
      const input: ClearRecipientChatRulesInput = {
        recipient: testChatId,
      }

      await expect(
        instanceUnderTest.clearRecipientChatRules(input),
      ).resolves.not.toThrow()

      verify(
        mockMatrixClientManager.deletePushRule(
          anything(),
          anything(),
          anything(),
        ),
      ).once()
    })
  })
})
