/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { Handle } from './handle'
import { ChatId } from './recipient'

/**
 * The Sudo Platform SDK representation of a Direct Chat.
 * Contains the identifiers of a direct chat with another handle.
 *
 * @interface DirectChat
 * @property {ChatId} id The identifier of the direct chat.
 * @property {Handle} otherHandle The handle that is participating in the direct chat.
 */
export interface DirectChat {
  id: ChatId
  otherHandle: Handle
}

/**
 * The role of a member within a direct chat, ranked in descending order.
 * 
 * @property PARTICIPANT: The handle has power of making changes to the direct chat.
 * @property NOBODY: The handle has no power to make any changes to the direct chat.
 * 
 * @enum
 */
export enum DirectChatRole {
  PARTICIPANT = 'PARTICIPANT',
  NOBODY = 'NOBODY',
}

/**
 * Permissions of certain direct chat functions and capabilities. Each capability requires a minimum 
 * {@link DirectChatRole} for handles to be able to execute.
 */
export class DirectChatPermissions {
  /**
   * Constructs a new instance of direct chat permissions with role-based access control.
   * 
   * @property {DirectChatRole} deleteOthersMessages What role can delete anyone's messages.
   */
  constructor(
    public deleteOthersMessages: DirectChatRole,
  ) {}

  /**
   * The default permissions for a group.
   */
  static default = new DirectChatPermissions(
    DirectChatRole.NOBODY,
  )
}
