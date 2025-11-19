/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { DirectChatEntity } from './directChatEntity'
import { DirectChatInvitationEntity } from './directChatInvitationEntity'

/**
 * Core entity representation of a direct chats service used in business logic. Used to perform CRUD operations for direct chats.
 *
 * @interface DirectChatsService
 */
export interface DirectChatsService {
  /**
   * Create a direct chat.
   *
   * @param {string} handleIdToChatTo The identifier of the handle to start chatting to.
   * @returns {string} The identifier of the chat that was created.
   */
  create(handleIdToChatTo: string): Promise<string>

  /**
   * Accept an invitation to join a direct chat.
   *
   * @param {string} chatId The identifier of the chat to join.
   */
  acceptInvitation(chatId: string): Promise<void>

  /**
   * Decline an invitation to join a direct chat.
   *
   * @param {string} chatId The identifier of the chat to decline.
   */
  declineInvitation(chatId: string): Promise<void>

  /**
   * Retrieve a list of all direct chat invitations.
   *
   * @returns {DirectChatInvitationEntity[]} A list of direct chat invitations.
   */
  listInvitations(): Promise<DirectChatInvitationEntity[]>

  /**
   * Retrieve a list of all joined direct chats.
   *
   * @returns {DirectChatEntity[]} A list of joined direct chats.
   */
  listJoined(): Promise<DirectChatEntity[]>

  /**
   * Blocks a handle.
   *
   * @param {string} handleId The identifer of the handle to block.
   */
  blockHandle(handleId: string): Promise<void>

  /**
   * Unblocks a handle.
   *
   * @param {string} handleId The identifer of the handle to unblock.
   */
  unblockHandle(handleId: string): Promise<void>

  /**
   * Retrieves a list of all known blocked handles.
   *
   * @returns {string[]} A list of the handle identifiers of the handles
   *  that are blocked
   */
  listBlockedHandles(): Promise<string[]>
}
