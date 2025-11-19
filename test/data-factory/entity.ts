/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { SecureCommsServiceConfig } from '../../src/private/data/common/config'
import {
  ChannelEntity,
  ChannelJoinRuleEntity,
  ChannelPermissionsEntity,
  ChannelPermissionsInputEntity,
  ChannelRoleEntity,
  ChannelSortDirectionEntity,
  ChannelSortFieldEntity,
  ChannelSortOrderEntity,
  PublicChannelJoinRuleEntity,
  PublicChannelSearchResultEntity,
} from '../../src/private/domain/entities/channels/channelEntity'
import { ChannelInvitationRequestEntity } from '../../src/private/domain/entities/channels/channelInvitationRequestEntity'
import {
  ChannelMemberEntity,
  GroupMemberEntity,
  MembershipStateEntity,
  RoomMemberEntity,
} from '../../src/private/domain/entities/common/memberEntity'
import { OwnerEntity } from '../../src/private/domain/entities/common/ownerEntity'
import { PowerLevelsEntity } from '../../src/private/domain/entities/common/powerLevelsEntity'
import { DirectChatEntity } from '../../src/private/domain/entities/directChats/directChatEntity'
import { DirectChatInvitationEntity } from '../../src/private/domain/entities/directChats/directChatInvitationEntity'
import {
  GroupEntity,
  GroupPermissionsEntity,
  GroupRoleEntity,
} from '../../src/private/domain/entities/groups/groupEntity'
import {
  HandleEntity,
  OwnedHandleEntity,
} from '../../src/private/domain/entities/handle/handleEntity'
import { FileEncryptionInfoEntity } from '../../src/private/domain/entities/media/fileEncryptionInfoEntity'
import {
  MediaCredentialEntity,
  RoomMediaCredentialEntity,
} from '../../src/private/domain/entities/media/mediaCredentialEntity'
import { ChatSummaryEntity } from '../../src/private/domain/entities/messaging/chatSummaryEntity'
import {
  MessageEntity,
  MessageMentionEntity,
  MessageReactionEntity,
  MessageReceiptEntity,
  MessageStateEntity,
  SearchMessagesItemEntity,
} from '../../src/private/domain/entities/messaging/messageEntity'
import { PollResponsesEntity } from '../../src/private/domain/entities/messaging/pollEntity'
import {
  CustomRoomType,
  RoomEntity,
} from '../../src/private/domain/entities/rooms/roomEntity'
import { RoomPowerLevelsEntity } from '../../src/private/domain/entities/rooms/roomPowerLevelsEntity'
import { SecureCommsSessionEntity } from '../../src/private/domain/entities/session/secureCommsSessionEntity'
import { ChannelId, ChatId, GroupId, HandleId } from '../../src/public'

export class EntityDataFactory {
  static readonly secureCommsConfig: SecureCommsServiceConfig = {
    region: 'us-east-1',
    serviceEndpointUrl: 'api.service.com',
    homeServer: 'api.homeserver.com',
    advancedSearchEnabled: false,
    roomMediaBucket: 'bucket.roomMediaBucket.com',
    publicMediaBucket: 'bucket.publicMediaBucket.com',
  }

  static readonly owner: OwnerEntity = {
    id: 'testId',
    issuer: 'testIssuer',
  }

  static readonly secureCommsSession: SecureCommsSessionEntity = {
    handleId: 'testHandleId',
    handleName: 'testHandleName',
    deviceId: 'testDeviceId',
    owner: 'testOwner',
    owners: [EntityDataFactory.owner],
    token: 'testToken',
    createdAt: new Date(1.0),
    expiresAt: new Date(2.0),
  }

  static readonly ownedHandle: OwnedHandleEntity = {
    handleId: new HandleId('testHandleId'),
    name: 'testHandleName',
    owner: 'testOwner',
    owners: [EntityDataFactory.owner],
  }

  static readonly handle: HandleEntity = {
    handleId: this.ownedHandle.handleId,
    name: 'testHandleName',
  }

  static readonly directChatPowerLevels: PowerLevelsEntity = {
    usersDefault: 100,
    redact: 101,
  }

  static readonly groupPowerLevels: PowerLevelsEntity = {
    usersDefault: 25,
    eventsDefault: 25,
    invite: 25,
    kick: 100,
    ban: 100,
    events: {
      'm.room.name': 25,
      'm.room.topic': 25,
      'm.room.avatar': 25,
    },
    redact: 101,
  }

  static readonly channelPowerLevels: PowerLevelsEntity = {
    usersDefault: 25,
    eventsDefault: 25,
    invite: 25,
    kick: 100,
    ban: 100,
    events: {
      'm.room.name': 25,
      'm.room.topic': 25,
      'm.room.avatar': 25,
    },
  }

  static readonly groupRoomPowerLevels: RoomPowerLevelsEntity = {
    users_default: 25,
    events_default: 25,
    redact: 101,
    invite: 25,
    kick: 100,
    ban: 100,
  }

  static readonly channelRoomPowerLevels: RoomPowerLevelsEntity = {
    users_default: 25,
    events_default: 25,
    redact: 25,
    invite: 25,
    kick: 100,
    ban: 100,
  }

  static readonly directChat: DirectChatEntity = {
    chatId: new ChatId('testChatId'),
    otherHandle: {
      handleId: new HandleId('testOtherHandleId'),
      name: 'testOtherHandleName',
    },
  }

  static readonly directChatInvitation: DirectChatInvitationEntity = {
    chatId: new ChatId('testChatId'),
    inviterHandle: {
      handleId: new HandleId('testInviterHandleId'),
      name: 'testInviterHandleName',
    },
  }

  static readonly channelRoom: RoomEntity = {
    roomId: 'testRoomId',
    type: CustomRoomType.PUBLIC_CHANNEL,
    name: 'testName',
    description: 'testDescription',
    avatarUrl: 'http://foobar.com',
    powerLevels: this.channelRoomPowerLevels,
    memberCount: 0,
  }

  static readonly groupRoom: RoomEntity = {
    roomId: 'testRoomId',
    type: CustomRoomType.GROUP,
    name: 'testName',
    description: 'testDescription',
    avatarUrl: 'http://foobar.com',
    powerLevels: this.groupRoomPowerLevels,
    memberCount: 0,
  }

  static readonly roomMember: RoomMemberEntity = {
    handle: this.handle,
    membership: MembershipStateEntity.JOINED,
    powerLevel: 100,
  }

  static readonly group: GroupEntity = {
    groupId: new GroupId('testGroupId'),
    name: 'testName',
    description: 'testDescription',
    avatarUrl: 'http://foobar.com',
    permissions: GroupPermissionsEntity.default,
    memberCount: 0,
  }

  static readonly groupPermissions: GroupPermissionsEntity = {
    sendMessages: GroupRoleEntity.PARTICIPANT,
    inviteHandles: GroupRoleEntity.PARTICIPANT,
    kickHandles: GroupRoleEntity.ADMIN,
    banHandles: GroupRoleEntity.ADMIN,
    changeGroupName: GroupRoleEntity.ADMIN,
    changeGroupDescription: GroupRoleEntity.ADMIN,
    changeGroupAvatar: GroupRoleEntity.ADMIN,
    deleteOthersMessages: GroupRoleEntity.NOBODY,
  }

  static readonly groupMember: GroupMemberEntity = {
    handle: this.handle,
    membership: MembershipStateEntity.JOINED,
    role: GroupRoleEntity.ADMIN,
  }

  static readonly channel: ChannelEntity = {
    channelId: new ChannelId('testChannelId'),
    name: 'testName',
    description: 'testDescription',
    avatarUrl: 'http://foobar.com',
    joinRule: ChannelJoinRuleEntity.PUBLIC,
    tags: ['test-tag-1', 'test-tag-2'],
    permissions: ChannelPermissionsEntity.default,
    defaultMemberRole: ChannelRoleEntity.ADMIN,
    memberCount: 0,
    createdAt: new Date(1.0),
    updatedAt: new Date(2.0),
  }

  static readonly channelPermissions: ChannelPermissionsEntity = {
    sendMessages: ChannelRoleEntity.PARTICIPANT,
    inviteHandles: ChannelRoleEntity.PARTICIPANT,
    kickHandles: ChannelRoleEntity.MODERATOR,
    banHandles: ChannelRoleEntity.MODERATOR,
    changeChannelName: ChannelRoleEntity.MODERATOR,
    changeChannelDescription: ChannelRoleEntity.MODERATOR,
    changeChannelAvatar: ChannelRoleEntity.MODERATOR,
    deleteOthersMessages: ChannelRoleEntity.MODERATOR,
  }

  static readonly defaultChannelPermissionsInput: ChannelPermissionsInputEntity =
    {
      sendMessages: ChannelRoleEntity.PARTICIPANT,
      inviteHandles: ChannelRoleEntity.PARTICIPANT,
      kickHandles: ChannelRoleEntity.MODERATOR,
      banHandles: ChannelRoleEntity.MODERATOR,
      changeChannelName: ChannelRoleEntity.MODERATOR,
      changeChannelDescription: ChannelRoleEntity.MODERATOR,
      changeChannelAvatar: ChannelRoleEntity.MODERATOR,
      deleteOthersMessages: ChannelRoleEntity.MODERATOR,
    }

  static readonly channelMember: ChannelMemberEntity = {
    handle: this.handle,
    membership: MembershipStateEntity.JOINED,
    role: ChannelRoleEntity.ADMIN,
  }

  static readonly channelInvitationRequest: ChannelInvitationRequestEntity = {
    handleId: this.handle.handleId,
    channelId: this.channel.channelId,
    reason: 'some reason',
    createdAt: new Date(1.0),
  }

  static readonly publicChannelSearchResult: PublicChannelSearchResultEntity = {
    channelId: new ChannelId('testChannelId'),
    name: 'testName',
    description: 'testDescription',
    avatarUrl: 'http://foobar.com',
    joinRule: PublicChannelJoinRuleEntity.PUBLIC,
    tags: ['test-tag-1', 'test-tag-2'],
    memberCount: 0,
    createdAt: new Date(1.0),
    updatedAt: new Date(2.0),
  }

  static readonly channelSortOrder: ChannelSortOrderEntity = {
    field: ChannelSortFieldEntity.NAME,
    direction: ChannelSortDirectionEntity.ASCENDING,
  }

  static readonly reaction: MessageReactionEntity = {
    content: 'testEmoji',
    count: 1,
    senderHandleIds: [this.handle.handleId],
  }

  static readonly receipt: MessageReceiptEntity = {
    timestamp: 10,
    handleId: this.handle.handleId,
  }

  static readonly messageHandleMention: MessageMentionEntity = {
    type: 'Handle',
    handleId: this.ownedHandle.handleId,
    name: this.ownedHandle.name,
  }

  static readonly messageChatMention: MessageMentionEntity = { type: 'Chat' }

  static readonly partialMessage: MessageEntity = {
    messageId: 'testMessageId',
    state: MessageStateEntity.COMMITTED,
    timestamp: 10,
    senderHandle: {
      handleId: this.handle.handleId,
      name: 'testSenderHandleName',
    },
    isOwn: false,
    content: { type: 'm.text', text: 'Foo message', isEdited: false },
    reactions: [],
    receipts: [],
    isVerified: true,
  }

  static readonly message: MessageEntity = {
    messageId: 'testMessageId',
    state: MessageStateEntity.COMMITTED,
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

  static readonly chatSummary: ChatSummaryEntity = {
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

  static readonly searchMessageItem: SearchMessagesItemEntity = {
    messageId: 'testMessageId',
    recipient: this.handle.handleId,
    senderHandleId: new HandleId('testSenderHandleId'),
    repliedToMessageId: 'testRepliedToMessageId',
    filename: 'testFileName',
    mimeType: 'image/png',
    body: 'testBody',
    timestamp: 10,
  }

  static readonly fileEncryptionInfo: FileEncryptionInfoEntity = {
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

  static readonly roomMediaCredential: RoomMediaCredentialEntity = {
    keyPrefix: 'key-prefix',
    accessKeyId: 'access-key-id',
    secretAccessKey: 'secret-access-key',
    sessionToken: 'session-token',
    expiry: 1,
  }

  static readonly mediaCredential: MediaCredentialEntity = {
    bucket: 'bucket',
    region: 'region',
    keyPrefix: 'key-prefix',
    forWrite: true,
    accessKeyId: 'access-key-id',
    secretAccessKey: 'secret-access-key',
    sessionToken: 'session-token',
  }

  static readonly pollResponses: PollResponsesEntity = {
    talliedAnswers: { answer1: 2, answer2: 3, answer3: 5 },
    totalVotes: 10,
    endedAt: 10,
  }
}
