/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  ListSecureCommsPublicChannelsOrdering,
  ListSecureCommsPublicChannelsOrderingDirection,
  ListSecureCommsPublicChannelsOrderingField,
  ListedSecureCommsChannelInfo,
  ListedSecureCommsChannelInfoConnection,
  MediaBucketCredential,
  Owner,
  PublicSecureCommsChannelInfo,
  PublicSecureCommsChannelInfoConnection,
  PublicSecureCommsHandleInfo,
  SecureCommsChannel,
  SecureCommsChannelJoinRule,
  SecureCommsChannelPowerLevels,
  SecureCommsHandle,
  SecureCommsPublicChannelJoinRule,
  SecureCommsSession,
} from '../../src/gen/graphqlTypes'

export class GraphQLDataFactory {
  static readonly owner: Owner = {
    id: 'testId',
    issuer: 'testIssuer',
  }

  static readonly secureCommsSession: SecureCommsSession = {
    handleId: 'testHandleId',
    handleName: 'testHandleName',
    deviceId: 'testDeviceId',
    owner: 'testOwner',
    owners: [GraphQLDataFactory.owner],
    token: 'testToken',
    createdAtEpochMs: 1.0,
    expiresAtEpochMs: 2.0,
  }

  static readonly handle: SecureCommsHandle = {
    id: 'testHandleId',
    name: 'testHandleName',
    owner: 'testOwner',
    owners: [GraphQLDataFactory.owner],
    version: 1,
    createdAtEpochMs: 1.0,
    updatedAtEpochMs: 2.0,
  }

  static readonly publicHandleInfo: PublicSecureCommsHandleInfo = {
    id: 'testHandleId',
    name: 'testHandleName',
  }

  static readonly powerLevels: SecureCommsChannelPowerLevels = {
    ban: 100,
    events: [],
    eventsDefault: 100,
    invite: 100,
    kick: 100,
    notifications: [],
    redact: 100,
    stateDefault: 100,
    users: [],
    usersDefault: 100,
  }

  static readonly channel: SecureCommsChannel = {
    id: 'testChannelId',
    version: 1,
    creatorHandleId: 'testHandleId',
    name: 'testName',
    description: 'testDescription',
    avatarImageUrl: 'http://foobar.com',
    tags: ['test-tag-1', 'test-tag-2'],
    joinRule: SecureCommsChannelJoinRule.Public,
    members: [],
    powerLevels: this.powerLevels,
    createdAtEpochMs: 1.0,
    updatedAtEpochMs: 2.0,
  }

  static readonly publicChannelInfo: PublicSecureCommsChannelInfo = {
    id: 'testChannelId',
    version: 1,
    name: 'testName',
    avatarImageUrl: 'http://foobar.com',
    description: 'testDescription',
    tags: ['test-tag-1', 'test-tag-2'],
    joinRule: SecureCommsChannelJoinRule.Public,
    createdAtEpochMs: 1.0,
    updatedAtEpochMs: 2.0,
  }

  static readonly publicChannelInfoConnection: PublicSecureCommsChannelInfoConnection =
    {
      items: [GraphQLDataFactory.publicChannelInfo],
      nextToken: undefined,
    }

  static readonly listedChannelInfo: ListedSecureCommsChannelInfo = {
    id: 'testChannelId',
    version: 1,
    name: 'testName',
    description: 'testDescription',
    avatarImageUrl: 'http://foobar.com',
    joinRule: SecureCommsPublicChannelJoinRule.Public,
    tags: ['test-tag-1', 'test-tag-2'],
    memberCount: 0,
    createdAtEpochMs: 1.0,
    updatedAtEpochMs: 2.0,
  }

  static readonly listedChannelInfoConnection: ListedSecureCommsChannelInfoConnection =
    {
      items: [GraphQLDataFactory.listedChannelInfo],
      nextToken: undefined,
    }

  static readonly listPublicChannelsOrdering: ListSecureCommsPublicChannelsOrdering =
    {
      field: ListSecureCommsPublicChannelsOrderingField.Name,
      direction: ListSecureCommsPublicChannelsOrderingDirection.Asc,
    }

  static readonly mediaBucketCredential: MediaBucketCredential = {
    identityId: 'identityId',
    keyPrefix: 'key-prefix',
    accessKeyId: 'access-key-id',
    secretAccessKey: 'secret-access-key',
    sessionToken: 'session-token',
    expiration: 1,
  }
}
