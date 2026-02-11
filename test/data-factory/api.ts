/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { Owner } from '@sudoplatform/sudo-common'
import {
  Channel,
  ChannelId,
  ChannelInvitationRequest,
  ChannelJoinRule,
  ChannelMember,
  ChannelPermissions,
  ChannelPermissionsInput,
  ChannelRole,
  ChannelSortDirection,
  ChannelSortField,
  ChannelSortOrder,
  ChatId,
  ChatSummary,
  DirectChat,
  DirectChatInvitation,
  FileEncryptionInfo,
  Group,
  GroupId,
  GroupMember,
  GroupPermissions,
  GroupRole,
  HandleId,
  MembershipState,
  Message,
  MessageMention,
  MessageReaction,
  MessageReceipt,
  MessageState,
  OwnedHandle,
  PublicChannelJoinRule,
  PublicChannelSearchResult,
  SearchMessagesItem,
  SecureCommsSession,
} from '../../src/public'
import { PollResponses } from '../../src/public/typings/poll'

export class APIDataFactory {
  static readonly owner: Owner = {
    id: 'testId',
    issuer: 'testIssuer',
  }

  static readonly secureCommsSession: SecureCommsSession = {
    handleId: 'testHandleId',
    handleName: 'testHandleName',
    deviceId: 'testDeviceId',
    owner: 'testOwner',
    owners: [APIDataFactory.owner],
    token: 'testToken',
    createdAt: new Date(1.0),
    expiresAt: new Date(2.0),
  }

  static readonly handle: OwnedHandle = {
    handleId: new HandleId('testHandleId'),
    name: 'testHandleName',
    owner: 'testOwner',
    owners: [APIDataFactory.owner],
  }

  static readonly directChat: DirectChat = {
    id: new ChatId('testChatId'),
    otherHandle: {
      handleId: new HandleId('testOtherHandleId'),
      name: 'testOtherHandleName',
    },
  }

  static readonly directChatInvitation: DirectChatInvitation = {
    chatId: new ChatId('testChatId'),
    inviterHandle: {
      handleId: new HandleId('testInviterHandleId'),
      name: 'testInviterHandleName',
    },
  }

  static readonly group: Group = {
    groupId: new GroupId('testGroupId'),
    name: 'testName',
    description: 'testDescription',
    avatarUrl: 'http://foobar.com',
    permissions: { ...GroupPermissions.default },
    memberCount: 0,
  }

  static readonly groupPermissions: GroupPermissions = {
    sendMessages: GroupRole.PARTICIPANT,
    inviteHandles: GroupRole.PARTICIPANT,
    kickHandles: GroupRole.ADMIN,
    banHandles: GroupRole.ADMIN,
    changeGroupName: GroupRole.ADMIN,
    changeGroupDescription: GroupRole.ADMIN,
    changeGroupAvatar: GroupRole.ADMIN,
    deleteOthersMessages: GroupRole.NOBODY,
  }

  static readonly groupMember: GroupMember = {
    handle: { handleId: new HandleId('testHandleId'), name: 'testHandleName' },
    membership: MembershipState.JOINED,
    role: GroupRole.ADMIN,
  }

  static readonly channel: Channel = {
    channelId: new ChannelId('testChannelId'),
    name: 'testName',
    description: 'testDescription',
    avatarUrl: 'http://foobar.com',
    joinRule: ChannelJoinRule.PUBLIC,
    tags: ['test-tag-1', 'test-tag-2'],
    permissions: { ...ChannelPermissions.default },
    defaultMemberRole: ChannelRole.ADMIN,
    memberCount: 0,
    createdAt: new Date(1.0),
    updatedAt: new Date(2.0),
  }

  static readonly channelPermissions: ChannelPermissions = {
    sendMessages: ChannelRole.PARTICIPANT,
    inviteHandles: ChannelRole.PARTICIPANT,
    kickHandles: ChannelRole.MODERATOR,
    banHandles: ChannelRole.MODERATOR,
    changeChannelName: ChannelRole.MODERATOR,
    changeChannelDescription: ChannelRole.MODERATOR,
    changeChannelAvatar: ChannelRole.MODERATOR,
    deleteOthersMessages: ChannelRole.MODERATOR,
  }

  static readonly defaultChannelPermissionsInput: ChannelPermissionsInput = {
    sendMessages: ChannelRole.PARTICIPANT,
    inviteHandles: ChannelRole.PARTICIPANT,
    kickHandles: ChannelRole.MODERATOR,
    banHandles: ChannelRole.MODERATOR,
    changeChannelName: ChannelRole.MODERATOR,
    changeChannelDescription: ChannelRole.MODERATOR,
    changeChannelAvatar: ChannelRole.MODERATOR,
    deleteOthersMessages: ChannelRole.MODERATOR,
  }

  static readonly channelMember: ChannelMember = {
    handle: { handleId: new HandleId('testHandleId'), name: 'testHandleName' },
    membership: MembershipState.JOINED,
    role: ChannelRole.ADMIN,
  }

  static readonly channelInvitationRequest: ChannelInvitationRequest = {
    handleId: this.handle.handleId,
    channelId: this.channel.channelId,
    reason: 'some reason',
    createdAt: new Date(1.0),
  }

  static readonly publicChannelSearchResult: PublicChannelSearchResult = {
    channelId: new ChannelId('testChannelId'),
    name: 'testName',
    description: 'testDescription',
    avatarUrl: 'http://foobar.com',
    joinRule: PublicChannelJoinRule.PUBLIC,
    tags: ['test-tag-1', 'test-tag-2'],
    memberCount: 0,
    createdAt: new Date(1.0),
    updatedAt: new Date(2.0),
  }

  static readonly channelSortOrder: ChannelSortOrder = {
    field: ChannelSortField.NAME,
    direction: ChannelSortDirection.ASCENDING,
  }

  static readonly reaction: MessageReaction = {
    content: 'testEmoji',
    count: 1,
    senderHandleIds: [this.handle.handleId],
    eventIds: ['testReactionEventId'],
  }

  static readonly receipt: MessageReceipt = {
    timestamp: 10,
    handleId: this.handle.handleId,
  }

  static readonly messageHandleMention: MessageMention = {
    type: 'Handle',
    handleId: this.handle.handleId,
    name: this.handle.name,
  }

  static readonly messageChatMention: MessageMention = {
    type: 'Chat',
  }

  static readonly message: Message = {
    messageId: 'testMessageId',
    state: MessageState.COMMITTED,
    timestamp: 10,
    senderHandle: {
      handleId: this.handle.handleId,
      name: 'testSenderHandleName',
    },
    isOwn: false,
    content: { type: 'm.text', text: 'Foo message', isEdited: false },
    reactions: [this.reaction],
    receipts: [this.receipt],
    isVerified: true,
  }

  static readonly chatSummary: ChatSummary = {
    recipient: this.handle.handleId,
    hasUnreadMessages: false,
    unreadCount: {
      all: 4,
      mentions: 3,
    },
    threadUnreadCount: {
      threadId1: {
        all: 2,
        mentions: 1,
      },
    },
    latestMessage: this.message,
  }

  static readonly searchMessageItem: SearchMessagesItem = {
    messageId: 'testMessageId',
    recipient: this.handle.handleId,
    senderHandleId: new HandleId('testSenderHandleId'),
    repliedToMessageId: 'testRepliedToMessageId',
    body: 'testBody',
    filename: 'testFileName',
    mimeType: 'image/png',
    timestamp: 10,
  }

  static readonly fileEncryptionInfo: FileEncryptionInfo = {
    key: {
      kty: 'oct',
      key_ops: ['encrypt', 'decrypt'],
      alg: 'A256CTR',
      k: 'testKey',
      ext: true,
    },
    iv: 'testIV',
    v: 'Version 1.0',
    hashes: { sha256: 'test-cipher-text' },
  }

  static readonly pollResponses: PollResponses = {
    talliedAnswers: { answer1: 2, answer2: 3, answer3: 5 },
    totalVotes: 10,
    endedAt: 10,
  }
}
