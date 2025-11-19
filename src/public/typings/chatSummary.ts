/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { Message } from './message'
import { Recipient } from './recipient'

/**
 * The Sudo Platform SDK representation of the unread count breakdown by message category.
 *
 * @interface UnreadCount
 * @property {number} all The total number of unread messages.
 * @property {number} mentions The total number of unread messages that mention this handle.
 */
export interface UnreadCount {
  all: number
  mentions: number
}

/**
 * The Sudo Platform SDK representation of a Chat Summary.
 *
 * @interface ChatSummary
 * @property {Recipient} recipient The recipient identifier for this chat summary.
 * @property {boolean} hasUnreadMessages True if this handle has unread messages in this chat.
 * @property {UnreadCount} unreadCount The unread messages counts in the chat, including from any threads.
 * @property {Record<string, UnreadCount>} threadUnreadCount A map of thread IDs to the unread message counts for that thread.
 * @property {Message} latestMessage The latest message in this chat, or undefined if one cannot be found.
 */
export interface ChatSummary {
  recipient: Recipient
  hasUnreadMessages: boolean
  unreadCount: UnreadCount
  threadUnreadCount: Record<string, UnreadCount>
  latestMessage?: Message
}
