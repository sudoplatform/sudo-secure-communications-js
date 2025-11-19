/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  ChannelId,
  ChatId,
  GroupId,
  HandleId,
  MembershipState,
  SecureCommsClient,
} from '../../../src/public'

export const isHandleJoinedToDirectChat = async (
  client: SecureCommsClient,
  handleId: HandleId,
  chatId: ChatId,
): Promise<boolean> => {
  const joinedChats = await client.directChats.listJoined(handleId)
  const joinedDirectChat = joinedChats.find(
    (chat) => chat.id.toString() === chatId.toString(),
  )
  return joinedDirectChat ? true : false
}

export const isHandleExpectedMembershipInChannel = async (
  client: SecureCommsClient,
  handleId: HandleId,
  channelId: ChannelId,
  targetHandleId: HandleId,
  membership: MembershipState,
) => {
  const members = await client.channels.getChannelMembers({
    handleId,
    channelId,
  })
  const targetMember = members.find((member) =>
    member.handle.handleId.toString().includes(targetHandleId.toString()),
  )
  expect(targetMember?.membership).toBe(membership)
}

export const isHandleExpectedMembershipInGroup = async (
  client: SecureCommsClient,
  handleId: HandleId,
  groupId: GroupId,
  targetHandleId: HandleId,
  membership: MembershipState,
) => {
  const members = await client.groups.getGroupMembers({
    handleId,
    groupId,
  })
  const targetMember = members.find((member) =>
    member.handle.handleId.toString().includes(targetHandleId.toString()),
  )
  expect(targetMember?.membership).toBe(membership)
}
