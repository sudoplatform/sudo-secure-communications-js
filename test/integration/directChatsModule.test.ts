/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { DefaultLogger } from '@sudoplatform/sudo-common'
import { SudoUserClient } from '@sudoplatform/sudo-user'
import { v4 } from 'uuid'
import { setupSecureCommsClient } from './util/secureCommsClientLifecycle'
import { isHandleJoinedToDirectChat } from './util/util'
import { delay } from '../../src/private/util/delay'
import {
  ChatId,
  DirectChatExistsError,
  OwnedHandle,
  RoomNotFoundError,
  SecureCommsClient,
} from '../../src/public'

describe('SecureCommsClient DirectChatModule Test Suite', () => {
  jest.setTimeout(240000)
  const log = new DefaultLogger('SecureCommsClientIntegrationTests')

  let client1: SecureCommsClient
  let client2: SecureCommsClient

  let userClient1: SudoUserClient
  let userClient2: SudoUserClient
  let inviterHandle: OwnedHandle
  let inviteeHandle: OwnedHandle

  beforeEach(async () => {
    const client1Setup = await setupSecureCommsClient(log)
    const client2Setup = await setupSecureCommsClient(log)
    client1 = client1Setup.secureCommsClient
    client2 = client2Setup.secureCommsClient
    userClient1 = client1Setup.userClient
    userClient2 = client2Setup.userClient
  })

  afterEach(async () => {
    await client1.reset()
    await client2.reset()
    await userClient1.reset()
    await userClient2.reset()
  })

  it('creates a direct chat between two handles successfully', async () => {
    const inviterHandleName = `test_inviter_handle_${v4()}`
    inviterHandle = await client1.handles.provisionHandle({
      name: inviterHandleName,
    })
    await client1.startSyncing(inviterHandle.handleId)

    const inviteeHandleName = `test_invitee_handle_${v4()}`
    inviteeHandle = await client2.handles.provisionHandle({
      name: inviteeHandleName,
    })
    await client2.startSyncing(inviteeHandle.handleId)

    // Create new direct chat from inviter handle to invitee handle
    const chatId = await client1.directChats.createChat({
      handleId: inviterHandle.handleId,
      handleIdToChatTo: inviteeHandle.handleId,
    })
    expect(chatId).toBeDefined()

    await delay(5000)

    // Check if direct chat is created by inviter handle with an invite to invitee handle
    const joinedChats = await client1.directChats.listJoined(
      inviterHandle.handleId,
    )
    const directChat = joinedChats.find(
      (chat) =>
        chat.otherHandle.handleId.toString() ===
        inviteeHandle.handleId.toString(),
    )
    expect(directChat?.id).toEqual(chatId)

    // check if invitee handle was invited to direct chat by inviter handle
    const chatInvitations = await client2.directChats.listInvitations(
      inviteeHandle.handleId,
    )
    const directChatInvitation = chatInvitations.find(
      (invitation) =>
        invitation.inviterHandle.handleId.toString() ===
        inviterHandle.handleId.toString(),
    )
    expect(directChatInvitation).toBeDefined()
  })

  it('accepts invitation and joins a direct chat between handles successfully', async () => {
    const inviterHandleName = `test_inviter_handle_${v4()}`
    inviterHandle = await client1.handles.provisionHandle({
      name: inviterHandleName,
    })
    await client1.startSyncing(inviterHandle.handleId)

    const inviteeHandleName = `test_invitee_handle_${v4()}`
    inviteeHandle = await client2.handles.provisionHandle({
      name: inviteeHandleName,
    })
    await client2.startSyncing(inviteeHandle.handleId)

    // Create new direct chat from inviter handle to invitee handle
    const chatId = await client1.directChats.createChat({
      handleId: inviterHandle.handleId,
      handleIdToChatTo: inviteeHandle.handleId,
    })
    expect(chatId).toBeDefined()

    await delay(5000)

    // Invitee handle accepts a direct chat invitation from inviter handle
    const chatInvitations = await client2.directChats.listInvitations(
      inviteeHandle.handleId,
    )
    const directChatInvitation = chatInvitations.find(
      (invitation) => invitation.chatId.toString() === chatId.toString(),
    )
    expect(directChatInvitation).toBeDefined()

    await client2.directChats.acceptInvitation({
      handleId: inviteeHandle.handleId,
      chatId,
    })

    await delay(5000)

    // Check if invitee handle is joined to the direct chat
    const joined = await isHandleJoinedToDirectChat(
      client2,
      inviteeHandle.handleId,
      chatId,
    )
    expect(joined).toBeTruthy()
  })

  it('declines invitation to join direct chat between two handles successfully', async () => {
    const inviterHandleName = `test_inviter_handle_${v4()}`
    inviterHandle = await client1.handles.provisionHandle({
      name: inviterHandleName,
    })
    await client1.startSyncing(inviterHandle.handleId)

    const inviteeHandleName = `test_invitee_handle_${v4()}`
    inviteeHandle = await client2.handles.provisionHandle({
      name: inviteeHandleName,
    })
    await client2.startSyncing(inviteeHandle.handleId)

    // Create new direct chat from inviter handle to invitee handle
    const chatId = await client1.directChats.createChat({
      handleId: inviterHandle.handleId,
      handleIdToChatTo: inviteeHandle.handleId,
    })
    expect(chatId).toBeDefined()

    await delay(5000)

    // Invitee handle declines a direct chat invitation from inviter handle
    const chatInvitations = await client2.directChats.listInvitations(
      inviteeHandle.handleId,
    )
    const directChatInvitation = chatInvitations.find(
      (invitation) => invitation.chatId.toString() === chatId.toString(),
    )
    expect(directChatInvitation).toBeDefined()

    await client2.directChats.declineInvitation({
      handleId: inviteeHandle.handleId,
      chatId,
    })

    await delay(5000)

    // Check if invitee handle is not joined to the direct chat
    const joined = await isHandleJoinedToDirectChat(
      client2,
      inviteeHandle.handleId,
      chatId,
    )
    expect(joined).toBeFalsy()
  })

  it('should throw a DirectChatExistsError when a direct chat between two handles already exists', async () => {
    const inviterHandleName = `test_inviter_handle_${v4()}`
    inviterHandle = await client1.handles.provisionHandle({
      name: inviterHandleName,
    })
    await client1.startSyncing(inviterHandle.handleId)

    const inviteeHandleName = `test_invitee_handle_${v4()}`
    inviteeHandle = await client2.handles.provisionHandle({
      name: inviteeHandleName,
    })
    await client2.startSyncing(inviteeHandle.handleId)

    // Create new direct chat from inviter handle to invitee handle
    const chatId = await client1.directChats.createChat({
      handleId: inviterHandle.handleId,
      handleIdToChatTo: inviteeHandle.handleId,
    })
    expect(chatId).toBeDefined()

    await expect(
      client1.directChats.createChat({
        handleId: inviterHandle.handleId,
        handleIdToChatTo: inviteeHandle.handleId,
      }),
    ).rejects.toThrow(DirectChatExistsError)
  })

  it('should throw a RoomNotFoundError when attempting to accept an invitation to a non-existent direct chat', async () => {
    const inviterHandleName = `test_inviter_handle_${v4()}`
    inviterHandle = await client1.handles.provisionHandle({
      name: inviterHandleName,
    })

    const inviteeHandleName = `test_invitee_handle_${v4()}`
    inviteeHandle = await client2.handles.provisionHandle({
      name: inviteeHandleName,
    })

    await expect(
      client2.directChats.acceptInvitation({
        handleId: inviteeHandle.handleId,
        chatId: new ChatId('nonExistentChatId'),
      }),
    ).rejects.toThrow(RoomNotFoundError)
  })

  it('should throw a RoomNotFoundError when attempting to decline an invitation to a non-existent direct chat', async () => {
    const inviterHandleName = `test_inviter_handle_${v4()}`
    inviterHandle = await client1.handles.provisionHandle({
      name: inviterHandleName,
    })

    const inviteeHandleName = `test_invitee_handle_${v4()}`
    inviteeHandle = await client2.handles.provisionHandle({
      name: inviteeHandleName,
    })

    await expect(
      client2.directChats.declineInvitation({
        handleId: inviteeHandle.handleId,
        chatId: new ChatId('nonExistentChatId'),
      }),
    ).rejects.toThrow(RoomNotFoundError)
  })

  it('blocks and unblocks a handle successfully', async () => {
    const inviterHandleName = `test_inviter_handle_${v4()}`
    inviterHandle = await client1.handles.provisionHandle({
      name: inviterHandleName,
    })
    await client1.startSyncing(inviterHandle.handleId)

    const inviteeHandleName = `test_invitee_handle_${v4()}`
    inviteeHandle = await client2.handles.provisionHandle({
      name: inviteeHandleName,
    })
    await client2.startSyncing(inviteeHandle.handleId)

    // Inviter handle blocks the invitee handle
    await client1.directChats.blockHandle({
      handleId: inviterHandle.handleId,
      handleIdToBlock: inviteeHandle.handleId,
    })

    // Check if the invitee handle has been blocked
    let blockedHandles = await client1.directChats.listBlockedHandles(
      inviterHandle.handleId,
    )
    expect(blockedHandles).toEqual([inviteeHandle.handleId])

    // Inviter handle unblocks the invitee handle
    await client1.directChats.unblockHandle({
      handleId: inviterHandle.handleId,
      handleIdToUnblock: inviteeHandle.handleId,
    })

    // Check if the invitee handle has been unblocked
    blockedHandles = await client1.directChats.listBlockedHandles(
      inviterHandle.handleId,
    )
    expect(blockedHandles).toEqual([])
  })
})
