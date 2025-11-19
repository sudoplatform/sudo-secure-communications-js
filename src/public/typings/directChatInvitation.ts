/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { Handle } from './handle'
import { ChatId } from './recipient'

/**
 * The Sudo Platform SDK representation of a Direct Chat Invitation.
 * Contains the indentifiers of an invitation to a direct chat with another handle.
 * 
 * @interface DirectChatInvitation
 * @property {ChatId} chatId The identifier of the direct chat.
 * @property {Handle} inviterHandle The other handle participating in the direct chat.
 */
export interface DirectChatInvitation {
  chatId: ChatId
  inviterHandle: Handle
}
