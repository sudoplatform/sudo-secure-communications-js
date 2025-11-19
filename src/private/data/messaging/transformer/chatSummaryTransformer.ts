/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { MessageTransformer } from './messageTransformer'
import { ChatSummary } from '../../../../public'
import { ChatSummaryEntity } from '../../../domain/entities/messaging/chatSummaryEntity'

export class ChatSummaryTransformer {
  fromAPIToEntity(data: ChatSummary): ChatSummaryEntity {
    const messageTransformer = new MessageTransformer()
    return {
      recipient: data.recipient,
      hasUnreadMessages: data.hasUnreadMessages,
      unreadCount: data.unreadCount,
      threadUnreadCount: data.threadUnreadCount,
      latestMessage: data.latestMessage
        ? messageTransformer.fromAPIToEntity(data.latestMessage)
        : undefined,
    }
  }

  fromEntityToAPI(entity: ChatSummaryEntity): ChatSummary {
    const messageTransformer = new MessageTransformer()
    return {
      recipient: entity.recipient,
      hasUnreadMessages: entity.hasUnreadMessages,
      unreadCount: entity.unreadCount,
      threadUnreadCount: entity.threadUnreadCount,
      latestMessage: entity.latestMessage
        ? messageTransformer.fromEntityToAPI(entity.latestMessage)
        : undefined,
    }
  }
}
