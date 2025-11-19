/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  anything,
  capture,
  instance,
  mock,
  reset,
  verify,
  when,
} from 'ts-mockito'
import { v4 } from 'uuid'
import {
  ListSecureCommsPublicChannelsOrderingDirection,
  ListSecureCommsPublicChannelsOrderingField,
  SecureCommsChannelJoinRule,
  SecureCommsChannelOptionalProperties,
  SecureCommsPublicChannelJoinRule,
} from '../../../../../src/gen/graphqlTypes'
import { DefaultChannelsService } from '../../../../../src/private/data/channels/defaultChannelsService'
import { ApiClient } from '../../../../../src/private/data/common/apiClient'
import {
  ChannelJoinRuleEntity,
  ChannelSortDirectionEntity,
  ChannelSortFieldEntity,
  PublicChannelJoinRuleEntity,
} from '../../../../../src/private/domain/entities/channels/channelEntity'
import {
  CreateChannelInput,
  DeleteChannelInput,
  UpdateChannelInput,
} from '../../../../../src/private/domain/entities/channels/channelsService'
import { EntityDataFactory } from '../../../../data-factory/entity'
import { GraphQLDataFactory } from '../../../../data-factory/graphQL'

describe('DefaultChannelsService Test Suite', () => {
  const mockAppSync = mock<ApiClient>()
  let instanceUnderTest: DefaultChannelsService

  beforeEach(() => {
    reset(mockAppSync)
    instanceUnderTest = new DefaultChannelsService(instance(mockAppSync))
  })

  describe('create', () => {
    it('calls appSync and returns result correctly', async () => {
      when(mockAppSync.createSecureCommsChannel(anything())).thenResolve(
        GraphQLDataFactory.channel,
      )

      const selfHandleId = 'fooHandleId'
      const name = 'fooName'
      const description = 'fooDescription'
      const tags = ['tag-1', 'tag-2']
      const avatarUrl = 'http://foobar.com'
      const input: CreateChannelInput = {
        selfHandleId,
        name,
        description,
        tags,
        avatarUrl,
        invitedHandleIds: [],
        joinRule: ChannelJoinRuleEntity.PUBLIC,
        powerLevels: undefined,
      }
      const result = await instanceUnderTest.create(input)

      const { permissions, defaultMemberRole, ...expected } =
        EntityDataFactory.channel
      expect(result).toStrictEqual(expected)
      const [inputArgs] = capture(mockAppSync.createSecureCommsChannel).first()
      expect(inputArgs).toStrictEqual<typeof inputArgs>({
        creatorHandleId: selfHandleId,
        name,
        description: description,
        tags,
        powerLevels: undefined,
        avatarImageUrl: avatarUrl,
        joinRule: SecureCommsChannelJoinRule.Public,
        invitations: [],
      })
      verify(mockAppSync.createSecureCommsChannel(anything())).once()
    })
  })

  describe('get', () => {
    it('calls appSync and returns result correctly', async () => {
      when(mockAppSync.getSecureCommsChannel(anything())).thenResolve(
        GraphQLDataFactory.publicChannelInfo,
      )

      const id = 'fooId'
      const result = await instanceUnderTest.get(id)

      const { permissions, defaultMemberRole, ...expected } =
        EntityDataFactory.channel
      expect(result).toStrictEqual(expected)
      const [inputArg] = capture(mockAppSync.getSecureCommsChannel).first()
      expect(inputArg).toStrictEqual<typeof inputArg>(id)
      verify(mockAppSync.getSecureCommsChannel(anything())).once()
    })

    it('calls appSync correctly with undefined result', async () => {
      when(mockAppSync.getSecureCommsChannel(anything())).thenResolve(undefined)

      const id = 'fooId'
      const result = await instanceUnderTest.get(id)

      expect(result).toStrictEqual(undefined)
      const [inputArg] = capture(mockAppSync.getSecureCommsChannel).first()
      expect(inputArg).toStrictEqual<typeof inputArg>(id)
      verify(mockAppSync.getSecureCommsChannel(anything())).once()
    })
  })

  describe('update', () => {
    it('calls appSync and returns result correctly when setting fields', async () => {
      const channelId = 'testChannelId'
      const selfHandleId = 'fooHandleId'
      const name = 'updatedName'
      when(mockAppSync.updateSecureCommsChannel(anything())).thenResolve({
        ...GraphQLDataFactory.publicChannelInfo,
        name,
      })

      const input: UpdateChannelInput = {
        channelId,
        selfHandleId,
        name: { value: name },
      }
      const result = await instanceUnderTest.update(input)

      const { permissions, defaultMemberRole, ...expected } =
        EntityDataFactory.channel
      expect(result).toStrictEqual({
        ...expected,
        name,
      })
      const [inputArgs] = capture(mockAppSync.updateSecureCommsChannel).first()
      expect(inputArgs).toStrictEqual<typeof inputArgs>({
        id: channelId,
        handleId: selfHandleId,
        set: {
          name: 'updatedName',
          tags: undefined,
          description: undefined,
          avatarImageUrl: undefined,
          joinRule: undefined,
        },
        unset: [],
      })
      verify(mockAppSync.updateSecureCommsChannel(anything())).once()
    })

    it('calls appSync and returns result correctly when unsetting description field', async () => {
      const channelId = 'testChannelId'
      const selfHandleId = 'fooHandleId'
      const name = 'updatedName'
      when(mockAppSync.updateSecureCommsChannel(anything())).thenResolve({
        ...GraphQLDataFactory.publicChannelInfo,
        name,
      })

      const input: UpdateChannelInput = {
        channelId,
        selfHandleId,
        name: { value: name },
        description: { value: undefined },
      }
      const result = await instanceUnderTest.update(input)

      const { permissions, defaultMemberRole, ...expected } =
        EntityDataFactory.channel
      expect(result).toStrictEqual({
        ...expected,
        name,
      })
      const [inputArgs] = capture(mockAppSync.updateSecureCommsChannel).first()
      expect(inputArgs).toStrictEqual<typeof inputArgs>({
        id: channelId,
        handleId: selfHandleId,
        set: {
          name: 'updatedName',
          tags: undefined,
          description: undefined,
          avatarImageUrl: undefined,
          joinRule: undefined,
        },
        unset: [SecureCommsChannelOptionalProperties.Description],
      })
      verify(mockAppSync.updateSecureCommsChannel(anything())).once()
    })

    it('calls appSync and returns result correctly when unsetting avatarUrl field', async () => {
      const channelId = 'testChannelId'
      const selfHandleId = 'fooHandleId'
      const name = 'updatedName'
      when(mockAppSync.updateSecureCommsChannel(anything())).thenResolve({
        ...GraphQLDataFactory.publicChannelInfo,
        name,
      })

      const input: UpdateChannelInput = {
        channelId,
        selfHandleId,
        name: { value: name },
        avatarUrl: { value: undefined },
      }
      const result = await instanceUnderTest.update(input)

      const { permissions, defaultMemberRole, ...expected } =
        EntityDataFactory.channel
      expect(result).toStrictEqual({
        ...expected,
        name,
      })
      const [inputArgs] = capture(mockAppSync.updateSecureCommsChannel).first()
      expect(inputArgs).toStrictEqual<typeof inputArgs>({
        id: channelId,
        handleId: selfHandleId,
        set: {
          name: 'updatedName',
          tags: undefined,
          description: undefined,
          avatarImageUrl: undefined,
          joinRule: undefined,
        },
        unset: [SecureCommsChannelOptionalProperties.AvatarImageUrl],
      })
      verify(mockAppSync.updateSecureCommsChannel(anything())).once()
    })
  })

  describe('delete', () => {
    it('calls appSync correctly', async () => {
      const channelId = 'testChannelId'
      const selfHandleId = 'testHandleId'
      when(
        mockAppSync.deleteSecureCommsChannel(anything(), anything()),
      ).thenResolve()

      const input: DeleteChannelInput = {
        channelId,
        selfHandleId,
      }
      await expect(instanceUnderTest.delete(input)).resolves.not.toThrow()

      const [idArg] = capture(mockAppSync.deleteSecureCommsChannel).first()
      expect(idArg).toStrictEqual<typeof idArg>(channelId)
      verify(
        mockAppSync.deleteSecureCommsChannel(anything(), anything()),
      ).once()
    })
  })

  describe('list', () => {
    it('calls appSync and returns result correctly', async () => {
      const id = v4()
      when(mockAppSync.listSecureCommsChannels(anything())).thenResolve({
        items: [GraphQLDataFactory.publicChannelInfo],
        unprocessedIds: [],
      })
      const result = await instanceUnderTest.list([id])

      const { permissions, defaultMemberRole, ...expected } =
        EntityDataFactory.channel
      expect(result).toStrictEqual({
        channels: [expected],
        unprocessedIds: [],
      })
      const [inputArg] = capture(mockAppSync.listSecureCommsChannels).first()
      expect(inputArg).toStrictEqual<typeof inputArg>([id])
      verify(mockAppSync.listSecureCommsChannels(anything())).once()
    })
  })

  describe('search', () => {
    it('calls appSync and returns result correctly', async () => {
      const handleId = 'handleId'
      const order = {
        field: ChannelSortFieldEntity.NAME,
        direction: ChannelSortDirectionEntity.ASCENDING,
      }
      const searchTerm = 'foo'
      const joinRule = PublicChannelJoinRuleEntity.PUBLIC
      const isJoined = true
      when(mockAppSync.listSecureCommsPublicChannels(anything())).thenResolve(
        GraphQLDataFactory.listedChannelInfoConnection,
      )
      const result = await instanceUnderTest.search({
        selfHandleId: handleId,
        order,
        searchTerm,
        joinRule,
        isJoined,
      })

      expect(result).toStrictEqual({
        channels: [EntityDataFactory.publicChannelSearchResult],
        nextToken: undefined,
      })
      const [inputArg] = capture(
        mockAppSync.listSecureCommsPublicChannels,
      ).first()
      expect(inputArg).toStrictEqual<typeof inputArg>({
        handleId: handleId.toString(),
        ordering: {
          field: ListSecureCommsPublicChannelsOrderingField.Name,
          direction: ListSecureCommsPublicChannelsOrderingDirection.Asc,
        },
        search: searchTerm,
        isJoined,
        joinRule: SecureCommsPublicChannelJoinRule.Public,
        tags: undefined,
        limit: undefined,
        nextToken: undefined,
      })
      verify(mockAppSync.listSecureCommsPublicChannels(anything())).once()
    })
  })
})
