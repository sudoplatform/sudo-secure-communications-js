/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { HandleId } from './handle';
import { Message } from './message';
import { ChannelId, ChatId, GroupId, Recipient } from './recipient';

// Placeholder, push notification payload from the server

export interface PlatformNotificationDataTemplate {
  type: string,
  handleId: string,
  eventId: string,
  roomId: string,
  counts?: Record<string, number> | undefined,
}

// MARK: Rules & Settings

export enum MessageNotificationLevel {
  allMessages = 'allMessages',
  mentions = 'mentionsAndKeywordsOnly',
  mute = 'mute',
}

export interface ChatNotificationRules {
  messageLevel: MessageNotificationLevel
}

export interface EventNotificationRules {
  invitations: boolean
}

export interface NotificationSettings {
  defaultChatRules: ChatNotificationRules,
  defaultEventRules: EventNotificationRules,
  recipientChatRules: Record<string, ChatNotificationRules>,
}

// MARK: NotificationInfo

export enum NotificationInfoType {
  invite = 'invite',
  message = 'message',
}

export interface NotificationInfo {
  handleId: HandleId
  type: NotificationInfoType
  recipient: Recipient
}

// Invite interface
export interface Invite extends NotificationInfo {
  // will be extended by specific invite types
}

// Specific invite types
export interface DirectChatInvite extends Invite {
  chatId: ChatId
}

export interface GroupInvite extends Invite { 
  groupId: GroupId
}

export interface ChannelInvite extends Invite { 
  channelId: ChannelId
}

// Message notification
export interface MessageNotification extends NotificationInfo {
  recipient: Recipient
  message: Message
}
