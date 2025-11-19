/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  ConditionKind,
  IPushRules,
  MatrixEvent,
  PushRuleAction,
  PushRuleActionName,
  PushRuleKind,
} from 'matrix-js-sdk/lib/matrix'
import {
  ChannelId,
  ChannelInvite,
  ChatId,
  ChatNotificationRules,
  DirectChatInvite,
  EventNotificationRules,
  GroupId,
  GroupInvite,
  HandleId,
  Invite,
  MessageNotification,
  MessageNotificationLevel,
  NotificationInfo,
  NotificationInfoType,
  NotificationSettings,
  Recipient,
  SecureCommsError,
} from '../../../public'
import {
  ClearRecipientChatRulesInput,
  GetDecodedInfoInput,
  NotificationService,
  SetDefaultChatRulesInput,
  SetDefaultEventRulesInput,
  SetRecipientChatRulesInput,
} from '../../domain/entities/notification/notificationService'
import { CustomRoomType } from '../../domain/entities/rooms/roomEntity'
import { RoomsService } from '../../domain/entities/rooms/roomsService'
import { MatrixClientManager } from '../common/matrixClientManager'
import { MessageTransformer } from '../messaging/transformer/messageTransformer'

const INVITE_FOR_ME_RULE_ID = '.m.rule.invite_for_me'

export class DefaultNotificationService implements NotificationService {
  constructor(
    private readonly matrixClient: MatrixClientManager,
    private readonly roomService: RoomsService,
  ) {}

  async getDecodedInfo(input: GetDecodedInfoInput): Promise<NotificationInfo> {
    const roomId = input.roomId
    const eventId = input.eventId

    let notificationInfo: NotificationInfo | undefined = undefined

    const event = await this.matrixClient.fetchRoomEvent(roomId, eventId)
    if (!event) {
      throw new SecureCommsError('Failed to fetch room event')
    }

    if (event.isState()) {
      // invite
      notificationInfo = await this.getInviteInfo(roomId, event)
    } else {
      // message
      notificationInfo = await this.getMessageInfo(roomId, event)
    }

    return notificationInfo!
  }

  private async getInviteInfo(
    roomId: string,
    event: MatrixEvent,
  ): Promise<Invite> {
    if (event.getContent().membership !== 'invite') {
      throw new SecureCommsError('Event is not an invite')
    }

    const inviteNotif = await (async (roomId: string): Promise<Invite> => {
      const handleId = new HandleId(await this.matrixClient.getUserId())

      const room = await this.roomService.get(roomId)
      if (!room) {
        throw new SecureCommsError('Failed to get room')
      }
      if (
        room.type === CustomRoomType.PRIVATE_CHANNEL ||
        room.type === CustomRoomType.PUBLIC_CHANNEL ||
        room.type === CustomRoomType.PUBLIC_INVITE_ONLY_CHANNEL
      ) {
        return {
          handleId,
          type: NotificationInfoType.invite,
          recipient: new ChannelId(room.roomId),
          channelId: new ChannelId(room.roomId),
        } as ChannelInvite
      } else if (room.type === CustomRoomType.GROUP) {
        return {
          handleId,
          type: NotificationInfoType.invite,
          recipient: new GroupId(room.roomId),
          groupId: new GroupId(room.roomId),
        } as GroupInvite
      } else {
        return {
          handleId,
          type: NotificationInfoType.invite,
          recipient: new ChatId(room.roomId),
          chatId: new ChatId(room.roomId),
        } as DirectChatInvite
      }
    })(roomId)

    return inviteNotif
  }

  private async getMessageInfo(
    roomId: string,
    event: MatrixEvent,
  ): Promise<MessageNotification> {
    const handleId = new HandleId(await this.matrixClient.getUserId())

    const messageEntity = await this.matrixClient.getMessage(
      event.getId() ?? '',
      roomId,
    )
    if (!messageEntity) {
      throw new SecureCommsError('Failed to get message')
    }

    const recipient = await (async (roomId: string): Promise<Recipient> => {
      const room = await this.roomService.get(roomId)
      if (!room) {
        throw new SecureCommsError('Failed to get room')
      }
      if (
        room.type === CustomRoomType.PRIVATE_CHANNEL ||
        room.type === CustomRoomType.PUBLIC_CHANNEL ||
        room.type === CustomRoomType.PUBLIC_INVITE_ONLY_CHANNEL
      ) {
        return new ChannelId(roomId)
      } else if (room.type === CustomRoomType.GROUP) {
        return new GroupId(roomId)
      } else {
        return new ChatId(roomId)
      }
    })(roomId)

    const transformer = new MessageTransformer()

    const msgNotif: MessageNotification = {
      handleId,
      type: NotificationInfoType.message,
      recipient,
      message: transformer.fromEntityToAPI(messageEntity),
    }

    return msgNotif
  }

  async getSettings(): Promise<NotificationSettings> {
    const rules = await this.matrixClient.getPushRules()

    // room rules
    const overrideRules = rules?.global?.override || []
    const recipientChatRules: Record<string, ChatNotificationRules> = {}

    overrideRules.forEach((rule) => {
      if (!rule.enabled) return

      const roomIdMatch = rule.rule_id.match(/^custom\.(rule)\.room\.(.+)$/)
      if (!roomIdMatch) return

      const roomId = roomIdMatch[2]

      if (rule.actions?.includes(PushRuleActionName.Notify)) {
        recipientChatRules[roomId] = {
          messageLevel: MessageNotificationLevel.allMessages,
        }
      }
    })

    // event rules
    const defaultEventRules: EventNotificationRules = {
      invitations: await this.isInviteForMeEnabled(rules),
    }

    // default chat rules
    const globalUnderrides = rules.global?.underride ?? []
    const globalOverrides = rules.global?.override ?? []

    const isMessageNotify = globalUnderrides.some(
      (r) =>
        r.rule_id === '.m.rule.message' &&
        r.actions?.includes(PushRuleActionName.Notify),
    )

    const isMentionsOnly = globalOverrides.some(
      (r) =>
        r.rule_id === '.m.rule.is_user_mention' &&
        r.actions?.includes(PushRuleActionName.Notify),
    )

    const defaultChatRules: ChatNotificationRules = {
      messageLevel: isMessageNotify
        ? MessageNotificationLevel.allMessages
        : isMentionsOnly
          ? MessageNotificationLevel.mentions
          : MessageNotificationLevel.mute,
    }

    const notifSettings: NotificationSettings = {
      defaultChatRules,
      defaultEventRules,
      recipientChatRules: recipientChatRules,
    }
    return notifSettings
  }

  // Invite event rules

  private async isInviteForMeEnabled(pushRules?: IPushRules): Promise<boolean> {
    const ruleId = INVITE_FOR_ME_RULE_ID
    const kind = PushRuleKind.Override
    const rules = pushRules ?? (await this.matrixClient.getPushRules())
    const rule = rules.global?.[kind]?.find((r) => r.rule_id === ruleId)

    if (rule) {
      if (rule.enabled) {
        if (rule.actions?.includes(PushRuleActionName.Notify)) {
          return true
        }
      }
    }
    return false
  }

  private async setInviteForMeEnabled(enabled: boolean): Promise<void> {
    const ruleId = INVITE_FOR_ME_RULE_ID
    const kind = PushRuleKind.Override
    const rules = await this.matrixClient.getPushRules()
    const existing = rules.global?.[kind]?.find((r) => r.rule_id === ruleId)

    if (!existing) {
      // If rule doesn't exist, create it with the appropriate actions
      if (enabled) {
        await this.matrixClient.addPushRule('global', kind, ruleId, {
          conditions: [
            {
              kind: ConditionKind.EventMatch,
              key: 'type',
              pattern: 'm.room.member',
            },
            {
              kind: ConditionKind.EventMatch,
              key: 'content.membership',
              pattern: 'invite',
            },
            {
              kind: ConditionKind.EventMatch,
              key: 'state_key',
              pattern: '@*',
            },
          ],
          actions: [PushRuleActionName.Notify],
        })
      }
      return
    }

    // Update actions if needed
    const currentActions = existing.actions ?? []
    const shouldNotify = currentActions.includes(PushRuleActionName.Notify)

    if (enabled && !shouldNotify) {
      // Re-set actions to include notify
      await this.matrixClient.setPushRuleActions('global', kind, ruleId, [
        PushRuleActionName.Notify,
      ])
    } else if (!enabled && shouldNotify) {
      await this.matrixClient.setPushRuleActions('global', kind, ruleId, [])
    }
    await this.matrixClient.setPushRuleEnabled('global', kind, ruleId, enabled)
  }

  async setDefaultChatRules(input: SetDefaultChatRulesInput): Promise<void> {
    const { messageLevel } = input.chatRules
    const actions: PushRuleAction[] = []
    if (messageLevel == MessageNotificationLevel.allMessages) {
      actions.push(PushRuleActionName.Notify)
    }
    // Unencrypted messages
    await this.matrixClient.setPushRuleActions(
      'global',
      PushRuleKind.Underride,
      '.m.rule.message',
      actions,
    )
    await this.matrixClient.setPushRuleEnabled(
      'global',
      PushRuleKind.Underride,
      '.m.rule.message',
      messageLevel === MessageNotificationLevel.allMessages,
    )
    // Encrypted messages
    await this.matrixClient.setPushRuleActions(
      'global',
      PushRuleKind.Underride,
      '.m.rule.encrypted',
      actions,
    )
    await this.matrixClient.setPushRuleEnabled(
      'global',
      PushRuleKind.Underride,
      '.m.rule.encrypted',
      messageLevel === MessageNotificationLevel.allMessages,
    )

    // Mentions messages
    await this.matrixClient.setPushRuleActions(
      'global',
      PushRuleKind.Override,
      '.m.rule.contains_display_name',
      actions,
    )
    await this.matrixClient.setPushRuleEnabled(
      'global',
      PushRuleKind.Override,
      '.m.rule.contains_display_name',
      messageLevel === MessageNotificationLevel.allMessages,
    )

    if (messageLevel == MessageNotificationLevel.mentions) {
      actions.push(PushRuleActionName.Notify)
    }
    await this.matrixClient.setPushRuleActions(
      'global',
      PushRuleKind.Override,
      '.m.rule.is_user_mention',
      actions,
    )

    await this.matrixClient.setPushRuleEnabled(
      'global',
      PushRuleKind.Override,
      '.m.rule.is_user_mention',
      messageLevel === MessageNotificationLevel.mentions,
    )

    await this.matrixClient.setPushRuleActions(
      'global',
      PushRuleKind.Override,
      '.m.rule.roomnotif',
      actions,
    )

    await this.matrixClient.setPushRuleEnabled(
      'global',
      PushRuleKind.Override,
      '.m.rule.roomnotif',
      messageLevel === MessageNotificationLevel.mentions,
    )

    await this.matrixClient.setPushRuleActions(
      'global',
      PushRuleKind.Override,
      '.m.rule.is_room_mention',
      actions,
    )

    await this.matrixClient.setPushRuleEnabled(
      'global',
      PushRuleKind.Override,
      '.m.rule.is_room_mention',
      messageLevel === MessageNotificationLevel.mentions,
    )
  }

  async setDefaultEventRules(input: SetDefaultEventRulesInput): Promise<void> {
    return this.setInviteForMeEnabled(input.eventRules.invitations)
  }

  async setRecipientChatRules(
    input: SetRecipientChatRulesInput,
  ): Promise<void> {
    const actions: PushRuleAction[] = []
    if (input.chatRules.messageLevel == MessageNotificationLevel.allMessages) {
      actions.push(PushRuleActionName.Notify)
    }
    try {
      await this.clearRecipientChatRules({ recipient: input.recipient })
    } catch (err) {
      // Ignore error if rule doesn't exist
    }
    return this.matrixClient.addPushRule(
      'global',
      PushRuleKind.Override,
      `custom.rule.room.${input.recipient.value}`,
      {
        conditions: [
          {
            kind: ConditionKind.EventMatch,
            key: 'room_id',
            pattern: input.recipient.value,
          },
        ],
        actions: actions,
      },
    )
  }

  async clearRecipientChatRules(
    input: ClearRecipientChatRulesInput,
  ): Promise<void> {
    return this.matrixClient.deletePushRule(
      'global',
      PushRuleKind.Override,
      `custom.rule.room.${input.recipient.value}`,
    )
  }
}
