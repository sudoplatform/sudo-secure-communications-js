/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { DefaultLogger, Logger } from '@sudoplatform/sudo-common'
import { DirectChatInvitationTransformer } from '../../private/data/directChats/transformer/directChatInvitationTransformer'
import { DirectChatTransformer } from '../../private/data/directChats/transformer/directChatTransformer'
import { SessionManager } from '../../private/data/session/sessionManager'
import { AcceptInvitationUseCase } from '../../private/domain/use-cases/directChats/acceptInvitationUseCase'
import { BlockHandleUseCase } from '../../private/domain/use-cases/directChats/blockHandleUseCase'
import { CreateChatUseCase } from '../../private/domain/use-cases/directChats/createChatUseCase'
import { DeclineInvitationUseCase } from '../../private/domain/use-cases/directChats/declineInvitationUseCase'
import { ListBlockedHandlesUseCase } from '../../private/domain/use-cases/directChats/listBlockedHandlesUseCase'
import { ListInvitationsUseCase } from '../../private/domain/use-cases/directChats/listInvitationsUseCase'
import { ListJoinedChatsUseCase } from '../../private/domain/use-cases/directChats/listJoinedChatsUseCase'
import { UnblockHandleUseCase } from '../../private/domain/use-cases/directChats/unblockHandleUseCase'
import { ChatId, HandleId } from '../typings'
import { DirectChat } from '../typings/directChat'
import { DirectChatInvitation } from '../typings/directChatInvitation'

/**
 * Properties required when creating a new chat.
 *
 * @interface CreateChatInput
 * @property {HandleId} handleId Identifier of the handle owned by this client.
 * @property {HandleId} handleIdToChatTo The identifier of the handle to start chatting to.
 */
export interface CreateChatInput {
  handleId: HandleId
  handleIdToChatTo: HandleId
}

/**
 * Properties required to accept an invitation to join a direct chat.
 *
 * @interface AcceptInvitationInput
 * @property {HandleId} handleId Identifier of the handle owned by this client.
 * @property {ChatId} chatId Identifier of the desired direct chat to join.
 */
export interface AcceptInvitationInput {
  handleId: HandleId
  chatId: ChatId
}

/**
 * Properties required to decline an invitation to join a direct chat.
 *
 * @interface DeclineInvitationInput
 * @property {HandleId} handleId Identifier of the handle owned by this client.
 * @property {ChatId} chatId Identifier of the desired direct chat to decline the invitation for.
 */
export interface DeclineInvitationInput {
  handleId: HandleId
  chatId: ChatId
}

/**
 * Properties required when blocking a handle.
 *
 * @interface BlockHandleInput
 * @property {HandleId} handleId Identifier of the handle owned by this client.
 * @property {HandleId} handleIdToBlock The identifier of the handle to block.
 */
export interface BlockHandleInput {
  handleId: HandleId
  handleIdToBlock: HandleId
}

/**
 * Properties required when unblocking a handle.
 *
 * @interface UnblockHandleInput
 * @property {HandleId} handleId Identifier of the handle owned by this client.
 * @property {HandleId} handleIdToUnblock The identifier of the handle to unblock.
 */
export interface UnblockHandleInput {
  handleId: HandleId
  handleIdToUnblock: HandleId
}

/**
 * Direct Chat management for the Secure Communications Service.
 */
export interface DirectChatsModule {
  /**
   * Creates a direct chat with another handle.
   *
   * @param {CreateChatInput} input Parameters used to create a new direct chat.
   * @returns {ChatId} The identifier of the direct chat.
   */
  createChat(input: CreateChatInput): Promise<ChatId>

  /**
   * Accept an invitation to join a direct chat.
   *
   * @param {AcceptInvitationInput} input Parameters used to accept an invitation
   *  to join a direct chat.
   */
  acceptInvitation(input: AcceptInvitationInput): Promise<void>

  /**
   * Decline an invitation to join a direct chat.
   *
   * @param {DeclineInvitationInput} input Parameters used to decline an invitation
   *  to join a direct chat.
   */
  declineInvitation(input: DeclineInvitationInput): Promise<void>

  /**
   * Retrieves a list of all direct chats that this handle has an invitation for.
   *
   * @param {HandleId} handleId Identifier of the handle owned by this client.
   * @returns {DirectChatInvitation[]} A list of direct chat invitations for this handle.
   */
  listInvitations(handleId: HandleId): Promise<DirectChatInvitation[]>

  /**
   * Retrieves a list of all direct chats that this handle has joined.
   *
   * @param {HandleId} handleId Identifier of the handle owned by this client.
   * @returns {DirectChat[]} A list of direct chats that this handle has joined.
   */
  listJoined(handleId: HandleId): Promise<DirectChat[]>

  /**
   * Blocks a handle.
   *
   * @param {BlockedHandleInput} input Parameters used to block a handle.
   */
  blockHandle(input: BlockHandleInput): Promise<void>

  /**
   * Unblocks a handle.
   *
   * @param {UnblockHandleInput} input Parameters used to unblock a handle
   */
  unblockHandle(input: UnblockHandleInput): Promise<void>

  /**
   * Retrieves a list of all known blocked handles for this handle.
   *
   * @param {HandleId} handleId Identifier of the handle owned by this client.
   * @returns {HandleId[]} A list of the handle identifiers of the handles
   *  that are blocked.
   */
  listBlockedHandles(handleId: HandleId): Promise<HandleId[]>
}

export class DefaultDirectChatsModule implements DirectChatsModule {
  private readonly log: Logger

  public constructor(private readonly sessionManager: SessionManager) {
    this.log = new DefaultLogger(this.constructor.name)
  }

  async createChat(input: CreateChatInput): Promise<ChatId> {
    this.log.debug(this.createChat.name, {
      input,
    })
    const useCase = new CreateChatUseCase(this.sessionManager)
    return await useCase.execute({
      handleId: input.handleId,
      handleIdToChatTo: input.handleIdToChatTo,
    })
  }

  async acceptInvitation(input: AcceptInvitationInput): Promise<void> {
    this.log.debug(this.acceptInvitation.name, {
      input,
    })
    const useCase = new AcceptInvitationUseCase(this.sessionManager)
    await useCase.execute({
      handleId: input.handleId,
      id: input.chatId,
    })
  }

  async declineInvitation(input: DeclineInvitationInput): Promise<void> {
    this.log.debug(this.declineInvitation.name, {
      input,
    })
    const useCase = new DeclineInvitationUseCase(this.sessionManager)
    await useCase.execute({
      handleId: input.handleId,
      id: input.chatId,
    })
  }

  async listInvitations(handleId: HandleId): Promise<DirectChatInvitation[]> {
    this.log.debug(this.listInvitations.name, {
      handleId,
    })
    const useCase = new ListInvitationsUseCase(this.sessionManager)
    const result = await useCase.execute(handleId)
    const transformer = new DirectChatInvitationTransformer()
    return result.map((invitation) => transformer.fromEntityToAPI(invitation))
  }

  async listJoined(handleId: HandleId): Promise<DirectChat[]> {
    this.log.debug(this.listJoined.name, {
      handleId,
    })
    const useCase = new ListJoinedChatsUseCase(this.sessionManager)
    const result = await useCase.execute(handleId)
    const transformer = new DirectChatTransformer()
    return result.map((chat) => transformer.fromEntityToAPI(chat))
  }

  async blockHandle(input: BlockHandleInput): Promise<void> {
    this.log.debug(this.blockHandle.name, {
      input,
    })
    const useCase = new BlockHandleUseCase(this.sessionManager)
    await useCase.execute({
      handleId: input.handleId,
      handleIdToBlock: input.handleIdToBlock,
    })
  }

  async unblockHandle(input: UnblockHandleInput): Promise<void> {
    this.log.debug(this.unblockHandle.name, {
      input,
    })
    const useCase = new UnblockHandleUseCase(this.sessionManager)
    await useCase.execute({
      handleId: input.handleId,
      handleIdToUnblock: input.handleIdToUnblock,
    })
  }

  async listBlockedHandles(handleId: HandleId): Promise<HandleId[]> {
    this.log.debug(this.listBlockedHandles.name, {
      handleId,
    })
    const useCase = new ListBlockedHandlesUseCase(this.sessionManager)
    return await useCase.execute(handleId)
  }
}
