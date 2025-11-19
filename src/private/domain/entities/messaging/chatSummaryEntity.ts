/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { MessageEntity } from './messageEntity'
import { Recipient } from '../../../../public'

/**
 * Core entity representation of the unread count breakdown by message category.
 *
 * @interface UnreadCountEntity
 * @property {number} all The total number of unread messages.
 * @property {number} mentions The total number of unread messages that mention this handle.
 */
export interface UnreadCountEntity {
  all: number
  mentions: number
}

/**
 * Core entity representation of a chat summary business rule.
 *
 * @interface ChatSummaryEntity
 * @property {Recipient} recipient The recipient identifier for this chat summary.
 * @property {boolean} hasUnreadMessages True if this handle has unread messages in this chat.
 * @property {UnreadCountEntity} unreadCount The unread messages counts in the chat, including from any threads.
 * @property {Record<string, UnreadCountEntity>} threadUnreadCount A map of thread IDs to the unread message counts for that thread.
 * @property {MessageEntity} latestMessage The latest message in this chat, or undefined if one cannot be found.
 */
export interface ChatSummaryEntity {
  recipient: Recipient
  hasUnreadMessages: boolean
  unreadCount: UnreadCountEntity
  threadUnreadCount: Record<string, UnreadCountEntity>
  latestMessage?: MessageEntity
}
