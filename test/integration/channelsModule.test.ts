/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { DefaultLogger } from '@sudoplatform/sudo-common'
import { SudoUserClient } from '@sudoplatform/sudo-user'
import { v4 } from 'uuid'
import { getSecureCommsServiceConfig } from '../../src/private/data/common/config'
import { delay } from '../../src/private/util/delay'
import {
  ChannelId,
  ChannelJoinRule,
  ChannelNameNotAvailableError,
  ChannelNotFoundError,
  ChannelPermissions,
  ChannelRole,
  ChannelSortDirection,
  ChannelSortField,
  CreateChannelInput,
  HandleId,
  HandleNotFoundError,
  InvalidArgumentError,
  InvalidChannelStateError,
  MembershipState,
  OwnedHandle,
  SecureCommsClient,
  UnacceptableWordsError,
  UnauthorizedError,
} from '../../src/public'
import { APIDataFactory } from '../data-factory/api'
import {
  setupSecureCommsClient,
  setupSudoPlatformConfig,
} from './util/secureCommsClientLifecycle'
import { isHandleExpectedMembershipInChannel } from './util/util'

describe('SecureCommsClient ChannelsModule Test Suite', () => {
  jest.setTimeout(240000)
  const log = new DefaultLogger('SecureCommsClientIntegrationTests')

  setupSudoPlatformConfig(log)
  const config = getSecureCommsServiceConfig()

  function runTestsIfAdvancedSearchEnabled(f: () => void) {
    const name = 'tests requiring advanced search'
    if (config.advancedSearchEnabled) {
      describe(name, f)
    } else {
      describe.skip(name, f)
    }
  }

  let client1: SecureCommsClient
  let client2: SecureCommsClient

  let userClient1: SudoUserClient
  let userClient2: SudoUserClient
  let inviterHandle: OwnedHandle
  let inviteeHandle: OwnedHandle

  let channelIdsToCleanup: ChannelId[] = []

  beforeEach(async () => {
    const client1Setup = await setupSecureCommsClient(log)
    const client2Setup = await setupSecureCommsClient(log)
    client1 = client1Setup.secureCommsClient
    client2 = client2Setup.secureCommsClient
    userClient1 = client1Setup.userClient
    userClient2 = client2Setup.userClient
  })

  afterEach(async () => {
    if (channelIdsToCleanup.length > 0) {
      for (const channelId of channelIdsToCleanup) {
        await client1.channels
          .updateChannel({
            handleId: inviterHandle!.handleId,
            channelId,
            joinRule: { value: ChannelJoinRule.PRIVATE },
          })
          .catch((err) => {
            if (err.name !== 'ChannelNotFoundError') {
              console.error(
                { err, channelId },
                'unable to update channel to private on cleanup',
              )
            }
          })
          .then(() =>
            client1.channels
              .deleteChannel({
                handleId: inviterHandle!.handleId,
                channelId,
              })
              .catch((err) => {
                if (err.name !== 'ChannelNotFoundError') {
                  console.error(
                    { err, channelId },
                    'unable to delete channel on cleanup',
                  )
                }
              }),
          )

        await delay(1000)
      }
      channelIdsToCleanup = []
    }
    await client1.reset()
    await client2.reset()
    await userClient1.reset()
    await userClient2.reset()
  })

  describe('createChannel, getChannel, getChannels and searchPublicChannels', () => {
    it('creates and retrieves a channel successfully', async () => {
      const handleName = `test_handle_${v4()}`
      inviterHandle = await client1.handles.provisionHandle({
        name: handleName,
      })

      const name = `channel-${v4()}`
      const description = 'channel-description'
      const tags = ['tag-1', 'tag-2']
      const channel = await client1.channels.createChannel({
        handleId: inviterHandle.handleId,
        name,
        description,
        joinRule: ChannelJoinRule.PUBLIC,
        tags,
        invitedHandleIds: [],
        permissions: APIDataFactory.defaultChannelPermissionsInput,
        defaultMemberRole: ChannelRole.REACT_ONLY_PARTICIPANT,
      })
      channelIdsToCleanup.push(channel.channelId)
      expect(channel).toEqual({
        channelId: expect.any(ChannelId),
        name,
        description,
        avatarurl: undefined,
        joinRule: ChannelJoinRule.PUBLIC,
        tags,
        permissions: ChannelPermissions.default,
        defaultMemberRole: undefined,
        memberCount: expect.any(Number),
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      })

      // Retrieve channel with getChannel
      const retrievedChannel = await client1.channels.getChannel({
        handleId: inviterHandle.handleId,
        channelId: channel.channelId,
      })
      expect(retrievedChannel).toEqual({
        channelId: expect.any(ChannelId),
        name,
        description,
        tags,
        avatarUrl: undefined,
        joinRule: ChannelJoinRule.PUBLIC,
        memberCount: expect.any(Number),
        permissions: ChannelPermissions.default,
        defaultMemberRole: undefined,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      })

      // Retrieve a single channel with getChannels
      const listedChannels = await client1.channels.getChannels({
        handleId: inviterHandle.handleId,
        channelIds: [channel.channelId],
      })
      expect(listedChannels).toHaveLength(1)
    })

    it('creates and retrieves multiple channels ignoring unknown input ids successfully', async () => {
      const handleName = `test_handle_${v4()}`
      inviterHandle = await client1.handles.provisionHandle({
        name: handleName,
      })

      const channelIds: ChannelId[] = []
      for (let i = 0; i < 2; i++) {
        const channel = await client1.channels.createChannel({
          handleId: inviterHandle.handleId,
          name: `channel-${i}-${v4()}`,
          description: 'channel-description',
          joinRule: ChannelJoinRule.PUBLIC,
          tags: ['tag-1', 'tag-2'],
          invitedHandleIds: [],
          permissions: APIDataFactory.defaultChannelPermissionsInput,
          defaultMemberRole: ChannelRole.REACT_ONLY_PARTICIPANT,
        })
        channelIds.push(channel.channelId)
        await delay(1000)
      }
      channelIdsToCleanup.push(...channelIds)

      const listedChannels = await client1.channels.getChannels({
        handleId: inviterHandle.handleId,
        channelIds: [...channelIds, new ChannelId(v4())],
      })
      expect(listedChannels).toHaveLength(2)
    })

    // Public channel search
    runTestsIfAdvancedSearchEnabled(() => {
      it('searches for public channel and returns single expected channel matching search query', async () => {
        const handleName = `test_handle_${v4()}`
        inviterHandle = await client1.handles.provisionHandle({
          name: handleName,
        })

        const seed = v4()
        const name = `${seed}-cba name`
        const description = `${seed}-fed description`
        const tags = [`${seed}-ihg tag`, `${seed}-lkj tag`]
        const channel = await client1.channels.createChannel({
          handleId: inviterHandle.handleId,
          name,
          description,
          joinRule: ChannelJoinRule.PUBLIC,
          tags,
          invitedHandleIds: [],
          permissions: APIDataFactory.defaultChannelPermissionsInput,
          defaultMemberRole: ChannelRole.REACT_ONLY_PARTICIPANT,
        })
        expect(channel).toBeDefined()
        channelIdsToCleanup.push(channel.channelId)

        await delay(5000)

        // Search by name
        const searchedChannelsByName =
          await client1.channels.searchPublicChannels({
            handleId: inviterHandle.handleId,
            order: {
              field: ChannelSortField.NAME,
              direction: ChannelSortDirection.ASCENDING,
            },
            searchTerm: `${seed}-cba`,
          })
        let foundChannel = searchedChannelsByName.items.filter(
          (foundChannel) =>
            foundChannel.channelId.toString() == channel.channelId.toString(),
        )
        expect(foundChannel).toHaveLength(1)
        expect(foundChannel[0]).toEqual({
          channelId: channel.channelId,
          name,
          description,
          avatarUrl: channel.avatarUrl,
          joinRule: channel.joinRule,
          tags,
          memberCount: expect.any(Number),
          createdAt: channel.createdAt,
          updatedAt: channel.updatedAt,
        })

        // Search by description
        const searchedChannelsByDescription =
          await client1.channels.searchPublicChannels({
            handleId: inviterHandle.handleId,
            order: {
              field: ChannelSortField.NAME,
              direction: ChannelSortDirection.ASCENDING,
            },
            searchTerm: `${seed}-fed`,
          })
        foundChannel = searchedChannelsByDescription.items.filter(
          (foundChannel) =>
            foundChannel.channelId.toString() == channel.channelId.toString(),
        )
        expect(foundChannel).toHaveLength(1)
        expect(foundChannel[0]).toEqual({
          channelId: channel.channelId,
          name,
          description,
          avatarUrl: channel.avatarUrl,
          joinRule: channel.joinRule,
          tags,
          memberCount: expect.any(Number),
          createdAt: channel.createdAt,
          updatedAt: channel.updatedAt,
        })
      })

      it('searches for public channels and returns multiple expected channels matching search query', async () => {
        if (!config.advancedSearchEnabled) {
          return
        }

        const handleName = `test_handle_${v4()}`
        inviterHandle = await client1.handles.provisionHandle({
          name: handleName,
        })

        const seed = v4()
        const description = [`${seed} qwe`, `${seed} rty`].join()
        const tags = [`${seed} uio`, `${seed} pas`]
        for (let i = 0; i < 2; ++i) {
          const name = `${v4()} qwe`
          const channel = await client1.channels.createChannel({
            handleId: inviterHandle.handleId,
            name,
            description,
            joinRule: ChannelJoinRule.PUBLIC,
            tags,
            invitedHandleIds: [],
            permissions: APIDataFactory.defaultChannelPermissionsInput,
            defaultMemberRole: ChannelRole.REACT_ONLY_PARTICIPANT,
          })
          expect(channel).toBeDefined()
          channelIdsToCleanup.push(channel.channelId)
        }

        await delay(5000)

        const searchedChannelsByKeyword =
          await client1.channels.searchPublicChannels({
            handleId: inviterHandle.handleId,
            order: {
              field: ChannelSortField.NAME,
              direction: ChannelSortDirection.ASCENDING,
            },
            searchTerm: `rty`,
          })
        const foundChannels = searchedChannelsByKeyword.items.filter(
          (foundChannel) =>
            foundChannel.channelId.toString() ===
              channelIdsToCleanup[0].toString() ||
            foundChannel.channelId.toString() ===
              channelIdsToCleanup[1].toString(),
        )
        expect(foundChannels).toHaveLength(2)
      })

      it('searches for public hannels and returns empty channels for non-existent public channels', async () => {
        const handleName = `test_handle_${v4()}`
        inviterHandle = await client1.handles.provisionHandle({
          name: handleName,
        })

        const searchedChannels = await client1.channels.searchPublicChannels({
          handleId: inviterHandle.handleId,
          order: {
            field: ChannelSortField.NAME,
            direction: ChannelSortDirection.ASCENDING,
          },
          searchTerm: 'nonExistent',
        })
        expect(searchedChannels.items).toHaveLength(0)
      })
    })

    it('lists empty channels for empty ids input', async () => {
      const handleName = `test_handle_${v4()}`
      inviterHandle = await client1.handles.provisionHandle({
        name: handleName,
      })
      await client1.startSyncing(inviterHandle.handleId)

      const listedChannels = await client1.channels.getChannels({
        handleId: inviterHandle.handleId,
        channelIds: [],
      })
      expect(listedChannels).toHaveLength(0)
    })

    it('lists empty channels for non-existent channels', async () => {
      const handleName = `test_handle_${v4()}`
      inviterHandle = await client1.handles.provisionHandle({
        name: handleName,
      })
      await client1.startSyncing(inviterHandle.handleId)

      const listedChannels = await client1.channels.getChannels({
        handleId: inviterHandle.handleId,
        channelIds: [new ChannelId(v4()), new ChannelId(v4())],
      })
      expect(listedChannels).toHaveLength(0)
    })

    it('should throw an InvalidArgumentError when input ids exceed the limit', async () => {
      const handleName = `test_handle_${v4()}`
      inviterHandle = await client1.handles.provisionHandle({
        name: handleName,
      })
      await client1.startSyncing(inviterHandle.handleId)

      const channelIds: ChannelId[] = []
      for (let i = 0; i < 101; ++i) channelIds.push(new ChannelId(v4()))

      await expect(
        client1.channels.getChannels({
          handleId: inviterHandle.handleId,
          channelIds,
        }),
      ).rejects.toThrow(InvalidArgumentError)
    })

    it('should throw a ChannelNameNotAvailableError when attempting to create a channel that contains a name that already exists', async () => {
      const handleName = `test_handle_${v4()}`
      inviterHandle = await client1.handles.provisionHandle({
        name: handleName,
      })

      const name = `channel-${v4()}`
      const description = 'channel-description'
      const tags = ['tag-1', 'tag-2']
      const input: CreateChannelInput = {
        handleId: inviterHandle.handleId,
        name,
        description,
        joinRule: ChannelJoinRule.PUBLIC,
        tags,
        invitedHandleIds: [],
        permissions: APIDataFactory.defaultChannelPermissionsInput,
        defaultMemberRole: ChannelRole.REACT_ONLY_PARTICIPANT,
      }
      const channel = await client1.channels.createChannel(input)
      channelIdsToCleanup.push(channel.channelId)
      expect(channel).toBeDefined()

      await expect(client1.channels.createChannel(input)).rejects.toThrow(
        ChannelNameNotAvailableError,
      )
    })

    it('should throw a HandleNotFoundError when an attempting to invite a non-existent handle', async () => {
      const handleName = `test_handle_${v4()}`
      inviterHandle = await client1.handles.provisionHandle({
        name: handleName,
      })

      const name = `channel-${v4()}`
      const description = 'channel-description'
      const tags = ['tag-1', 'tag-2']
      await expect(
        client1.channels.createChannel({
          handleId: inviterHandle.handleId,
          name,
          description,
          joinRule: ChannelJoinRule.PUBLIC,
          tags,
          invitedHandleIds: [new HandleId(v4())],
          permissions: APIDataFactory.defaultChannelPermissionsInput,
          defaultMemberRole: ChannelRole.REACT_ONLY_PARTICIPANT,
        }),
      ).rejects.toThrow(HandleNotFoundError)
    })

    it('should throw a InvalidArgumentError when an attempting to create a channel inviting the creator', async () => {
      const handleName = `test_handle_${v4()}`
      inviterHandle = await client1.handles.provisionHandle({
        name: handleName,
      })

      const name = `channel-${v4()}`
      const description = 'channel-description'
      const tags = ['tag-1', 'tag-2']
      await expect(
        client1.channels.createChannel({
          handleId: inviterHandle.handleId,
          name,
          description,
          joinRule: ChannelJoinRule.PUBLIC,
          tags,
          invitedHandleIds: [inviterHandle.handleId],
          permissions: APIDataFactory.defaultChannelPermissionsInput,
          defaultMemberRole: ChannelRole.REACT_ONLY_PARTICIPANT,
        }),
      ).rejects.toThrow(InvalidArgumentError)
    })

    it('should throw an UnacceptableWordsError when attempting to create a channel with an unacceptable name', async () => {
      const handleName = `test_handle_${v4()}`
      inviterHandle = await client1.handles.provisionHandle({
        name: handleName,
      })

      const name = `excludedpartial-${v4()}`
      const description = 'channel-description'
      await expect(
        client1.groups.createGroup({
          handleId: inviterHandle.handleId,
          name,
          description,
          invitedHandleIds: [],
        }),
      ).rejects.toThrow(UnacceptableWordsError)
    })

    it('should throw an UnacceptableWordsError when attempting to create a group with an unacceptable description', async () => {
      const handleName = `test_handle_${v4()}`
      inviterHandle = await client1.handles.provisionHandle({
        name: handleName,
      })

      const name = 'channel-name'
      const description = `excludedpartial-${v4()}`
      await expect(
        client1.groups.createGroup({
          handleId: inviterHandle.handleId,
          name,
          description,
          invitedHandleIds: [],
        }),
      ).rejects.toThrow(UnacceptableWordsError)
    })

    it('returns undefined for non-existent channel when attempting to retrieve a channel', async () => {
      const handleName = `test_handle_${v4()}`
      inviterHandle = await client1.handles.provisionHandle({
        name: handleName,
      })

      await expect(
        client1.channels.getChannel({
          handleId: inviterHandle.handleId,
          channelId: new ChannelId(v4()),
        }),
      ).resolves.toBeUndefined()
    })
  })

  describe('createChannel, updateChannel and deleteChannel', () => {
    it('creates, updates and deletes a channel and returns expected output', async () => {
      const handleName = `test_handle_${v4()}`
      inviterHandle = await client1.handles.provisionHandle({
        name: handleName,
      })

      const name = `channel-${v4()}`
      const description = 'channel-description'
      const tags = ['tag-1', 'tag-2']
      const channel = await client1.channels.createChannel({
        handleId: inviterHandle.handleId,
        name,
        description,
        joinRule: ChannelJoinRule.PUBLIC,
        tags,
        invitedHandleIds: [],
        permissions: APIDataFactory.defaultChannelPermissionsInput,
        defaultMemberRole: ChannelRole.REACT_ONLY_PARTICIPANT,
      })
      expect(channel).toBeDefined()
      channelIdsToCleanup.push(channel.channelId)

      await delay(5000)

      const retrievedChannel = await client1.channels.getChannel({
        handleId: inviterHandle.handleId,
        channelId: channel.channelId,
      })
      expect(retrievedChannel).toBeDefined()

      const updatedName = `new-channel-${v4()}`
      const updatedChannel = await client1.channels.updateChannel({
        handleId: inviterHandle.handleId,
        channelId: channel.channelId,
        name: { value: updatedName },
        tags: { value: ['new-tag-1'] },
        joinRule: { value: ChannelJoinRule.PRIVATE },
      })

      await delay(2000)

      expect(updatedChannel).toEqual({
        ...retrievedChannel,
        name: updatedName,
        tags: ['new-tag-1'],
        joinRule: ChannelJoinRule.PRIVATE,
        updatedAt: expect.any(Date),
      })

      await expect(
        client1.channels.deleteChannel({
          handleId: inviterHandle.handleId,
          channelId: channel.channelId,
        }),
      ).resolves.not.toThrow()
    })

    it('should throw a ChannelNotFoundError when attempting to update a non-existent channel', async () => {
      const handleName = `test_handle_${v4()}`
      inviterHandle = await client1.handles.provisionHandle({
        name: handleName,
      })

      await expect(
        client1.channels.updateChannel({
          handleId: inviterHandle.handleId,
          channelId: new ChannelId('nonExistentId'),
          name: { value: `new-channel-${v4()}` },
        }),
      ).rejects.toThrow(ChannelNotFoundError)
    })

    it('should throw an UnacceptableWordsError when attempting to update name with unacceptable words', async () => {
      const handleName = `test_handle_${v4()}`
      inviterHandle = await client1.handles.provisionHandle({
        name: handleName,
      })

      const name = `channel-${v4()}`
      const description = 'channel-description'
      const tags = ['tag-1', 'tag-2']
      const channel = await client1.channels.createChannel({
        handleId: inviterHandle.handleId,
        name,
        description,
        joinRule: ChannelJoinRule.PUBLIC,
        tags,
        invitedHandleIds: [],
        permissions: APIDataFactory.defaultChannelPermissionsInput,
        defaultMemberRole: ChannelRole.REACT_ONLY_PARTICIPANT,
      })
      expect(channel).toBeDefined()
      channelIdsToCleanup.push(channel.channelId)

      await expect(
        client1.channels.updateChannel({
          handleId: inviterHandle.handleId,
          channelId: channel.channelId,
          name: { value: `excludedpartial-${v4()}` },
        }),
      ).rejects.toThrow(UnacceptableWordsError)
    })

    it('should throw a HandleNotFoundError when attempting to update a channel for a non-existent handle', async () => {
      const handleName = `test_handle_${v4()}`
      inviterHandle = await client1.handles.provisionHandle({
        name: handleName,
      })

      const name = `channel-${v4()}`
      const description = 'channel-description'
      const tags = ['tag-1', 'tag-2']
      const channel = await client1.channels.createChannel({
        handleId: inviterHandle.handleId,
        name,
        description,
        joinRule: ChannelJoinRule.PUBLIC,
        tags,
        invitedHandleIds: [],
        permissions: APIDataFactory.defaultChannelPermissionsInput,
        defaultMemberRole: ChannelRole.REACT_ONLY_PARTICIPANT,
      })
      expect(channel).toBeDefined()
      channelIdsToCleanup.push(channel.channelId)

      await delay(2000)

      await expect(
        client1.channels.updateChannel({
          handleId: new HandleId(v4()),
          channelId: channel.channelId,
          name: { value: `new-channel-${v4()}` },
        }),
      ).rejects.toThrow(HandleNotFoundError)
    })

    it('should throw a ChannelNotFoundError when attempting to delete a non-existent channel', async () => {
      const handleName = `test_handle_${v4()}`
      inviterHandle = await client1.handles.provisionHandle({
        name: handleName,
      })

      await expect(
        client1.channels.deleteChannel({
          handleId: inviterHandle.handleId,
          channelId: new ChannelId('nonExistentId'),
        }),
      ).rejects.toThrow(ChannelNotFoundError)
    })

    it('should throw an InvalidChannelStateError when attempting to delete a public channel', async () => {
      const handleName = `test_handle_${v4()}`
      inviterHandle = await client1.handles.provisionHandle({
        name: handleName,
      })

      const name = `channel-${v4()}`
      const description = 'channel-description'
      const tags = ['tag-1', 'tag-2']
      const channel = await client1.channels.createChannel({
        handleId: inviterHandle.handleId,
        name,
        description,
        joinRule: ChannelJoinRule.PUBLIC,
        tags,
        invitedHandleIds: [],
        permissions: APIDataFactory.defaultChannelPermissionsInput,
        defaultMemberRole: ChannelRole.REACT_ONLY_PARTICIPANT,
      })
      expect(channel).toBeDefined()
      channelIdsToCleanup.push(channel.channelId)

      await delay(2000)

      await expect(
        client1.channels.deleteChannel({
          handleId: inviterHandle.handleId,
          channelId: channel.channelId,
        }),
      ).rejects.toThrow(InvalidChannelStateError)
    })

    it('should throw a HandleNotFoundError when attempting to delete a channel for a non-existent handle', async () => {
      const handleName = `test_handle_${v4()}`
      inviterHandle = await client1.handles.provisionHandle({
        name: handleName,
      })

      const name = `channel-${v4()}`
      const description = 'channel-description'
      const tags = ['tag-1', 'tag-2']
      const channel = await client1.channels.createChannel({
        handleId: inviterHandle.handleId,
        name,
        description,
        joinRule: ChannelJoinRule.PUBLIC,
        tags,
        invitedHandleIds: [],
        permissions: APIDataFactory.defaultChannelPermissionsInput,
        defaultMemberRole: ChannelRole.REACT_ONLY_PARTICIPANT,
      })
      expect(channel).toBeDefined()
      channelIdsToCleanup.push(channel.channelId)

      await expect(
        client1.channels.deleteChannel({
          handleId: new HandleId(v4()),
          channelId: channel.channelId,
        }),
      ).rejects.toThrow(HandleNotFoundError)
    })
  })

  describe('joinChannel, leaveChannel and getChannelMembers', () => {
    it('joins, leaves and lists joined channels successfully', async () => {
      const handleName = `test_handle_${v4()}`
      inviterHandle = await client1.handles.provisionHandle({
        name: handleName,
      })
      const handleName2 = `test_handle2_${v4()}`
      inviteeHandle = await client1.handles.provisionHandle({
        name: handleName2,
      })

      await client1.startSyncing(inviterHandle.handleId)
      await client1.startSyncing(inviteeHandle.handleId)

      const name = `channel-${v4()}`
      const description = 'channel-description'
      const tags = ['tag-1', 'tag-2']
      const channel = await client1.channels.createChannel({
        handleId: inviterHandle.handleId,
        name,
        description,
        joinRule: ChannelJoinRule.PUBLIC,
        tags,
        invitedHandleIds: [],
        permissions: APIDataFactory.defaultChannelPermissionsInput,
        defaultMemberRole: ChannelRole.REACT_ONLY_PARTICIPANT,
      })
      expect(channel).toBeDefined()
      channelIdsToCleanup.push(channel.channelId)

      await delay(2000)

      await client1.channels.joinChannel({
        handleId: inviterHandle.handleId,
        channelId: channel.channelId,
      })

      await client1.channels.joinChannel({
        handleId: inviteeHandle.handleId,
        channelId: channel.channelId,
      })

      // Check if the handles joined to the channel
      const members = await client1.channels.getChannelMembers({
        handleId: inviterHandle.handleId,
        channelId: channel.channelId,
      })
      const expectedMembers = [
        {
          handle: {
            handleId: new HandleId(inviterHandle.handleId.toString()),
            name: inviterHandle.name,
          },
          membership: MembershipState.JOINED,
          role: ChannelRole.ADMIN,
        },
        {
          handle: {
            handleId: new HandleId(inviteeHandle.handleId.toString()),
            name: inviteeHandle.name,
          },
          membership: MembershipState.JOINED,
          role: ChannelRole.REACT_ONLY_PARTICIPANT,
        },
      ]
      expect(members.length).toBeGreaterThanOrEqual(expectedMembers.length)
      expectedMembers.forEach((expectedMember) => {
        expect(members).toContainEqual(expectedMember)
      })

      let joinedChannels = await client1.channels.listJoined(
        inviteeHandle.handleId,
      )
      expect(joinedChannels).toHaveLength(1)

      // Set channel to private so it's out of the public directory. We lose the ability to delete the channel once
      // we leave the channel.
      await client1.channels.updateChannel({
        handleId: inviterHandle.handleId,
        channelId: channel.channelId,
        joinRule: { value: ChannelJoinRule.PRIVATE },
      })

      await client1.channels.leaveChannel({
        handleId: inviteeHandle.handleId,
        channelId: channel.channelId,
      })

      // Check if the handle has left the channel
      joinedChannels = await client1.channels.listJoined(inviteeHandle.handleId)
      expect(joinedChannels).toHaveLength(0)
    })
  })

  describe('createChannel, listJoined invitation and membership lifecycle', () => {
    it('send and accept invitation and list channels that the user has joined successfully', async () => {
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

      const name = `channel-${v4()}`
      const description = 'channel-description'
      const tags = ['tag-1', 'tag-2']
      const channel = await client1.channels.createChannel({
        handleId: inviterHandle.handleId,
        name,
        description,
        joinRule: ChannelJoinRule.PUBLIC,
        tags,
        invitedHandleIds: [],
        permissions: APIDataFactory.defaultChannelPermissionsInput,
        defaultMemberRole: ChannelRole.PARTICIPANT,
      })

      expect(channel).toBeDefined()
      channelIdsToCleanup.push(channel.channelId)

      await delay(5000)

      // Inviter handle sends invitation to invitee handle
      await client1.channels.sendInvitations({
        handleId: inviterHandle.handleId,
        channelId: channel.channelId,
        targetHandleIds: [inviteeHandle.handleId],
      })

      // Check if the inviter handle is joined to the channel
      await isHandleExpectedMembershipInChannel(
        client1,
        inviterHandle.handleId,
        channel.channelId,
        inviterHandle.handleId,
        MembershipState.JOINED,
      )

      // Check if the inviteeHandle has an active invitation to the channel
      const invitations = await client2.channels.listInvitations(
        inviteeHandle.handleId,
      )
      const invitedChannelId = invitations.find(
        (invite) =>
          invite.channelId.toString() === channel.channelId.toString(),
      )?.channelId
      expect(invitedChannelId).not.toBeUndefined()

      // Invitee handle accepts the invitation from the inviter handle
      await client2.channels.acceptInvitation({
        handleId: inviteeHandle.handleId,
        channelId: channel.channelId,
      })

      await delay(5000)

      // Retrieve the channels the inviter handle has joined
      const inviterJoinedChannels = await client1.channels.listJoined(
        inviterHandle.handleId,
      )
      expect(inviterJoinedChannels).toContainEqual(
        expect.objectContaining({
          channelId: channel.channelId,
          name: channel.name,
          avatarUrl: channel.avatarUrl,
          joinRule: ChannelJoinRule.PUBLIC,
        }),
      )

      // Retrieve the channels the invitee handle has joined
      const inviteeJoinedChannels = await client2.channels.listJoined(
        inviteeHandle.handleId,
      )
      expect(inviteeJoinedChannels).toContainEqual(
        expect.objectContaining({
          channelId: channel.channelId,
          name: channel.name,
          avatarUrl: channel.avatarUrl,
          joinRule: ChannelJoinRule.PUBLIC,
        }),
      )

      // Check whether the channel members have the correct roles assigned
      const client1Members = await client1.channels.getChannelMembers({
        handleId: inviterHandle.handleId,
        channelId: channel.channelId,
      })
      expect(
        client1Members.some(
          (member) =>
            member.membership === MembershipState.JOINED &&
            member.role === ChannelRole.ADMIN,
        ),
      ).toBeTruthy()
      expect(
        client1Members.some(
          (member) =>
            member.membership === MembershipState.JOINED &&
            member.role === ChannelRole.PARTICIPANT,
        ),
      ).toBeTruthy()

      await delay(5000)

      // Check the current membership state of the inviter handle
      const inviterMembership = await client1.channels.getChannelMembership({
        handleId: inviterHandle.handleId,
        channelId: channel.channelId,
      })
      expect(inviterMembership).toBe(MembershipState.JOINED)

      // Check the current membership state of the invitee handle
      const inviteeMembership = await client2.channels.getChannelMembership({
        handleId: inviteeHandle.handleId,
        channelId: channel.channelId,
      })
      expect(inviteeMembership).toBe(MembershipState.JOINED)

      let client2Members = await client2.channels.getChannelMembers({
        handleId: inviteeHandle.handleId,
        channelId: channel.channelId,
      })

      let inviteeMember = client2Members.find(
        (member) =>
          member.handle.handleId.toString() ===
          inviteeHandle.handleId.toString(),
      )
      expect(inviteeMember?.role).toBe(ChannelRole.PARTICIPANT)

      // Update the role of the invitee handle from PARTICIPANT to MODERATOR
      await client1.channels.updateChannelMemberRole({
        handleId: inviterHandle.handleId,
        channelId: channel.channelId,
        targetHandleId: inviteeHandle.handleId,
        role: ChannelRole.MODERATOR,
      })

      client2Members = await client2.channels.getChannelMembers({
        handleId: inviteeHandle.handleId,
        channelId: channel.channelId,
      })
      inviteeMember = client2Members.find(
        (member) =>
          member.handle.handleId.toString() ===
          inviteeHandle.handleId.toString(),
      )
      expect(inviteeMember?.role).toBe(ChannelRole.MODERATOR)
    })

    it('send invitation and decline invitation to join a channel successfully', async () => {
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

      const name = `channel-${v4()}`
      const description = 'channel-description'
      const tags = ['tag-1', 'tag-2']
      const channel = await client1.channels.createChannel({
        handleId: inviterHandle.handleId,
        name,
        description,
        joinRule: ChannelJoinRule.PUBLIC,
        tags,
        invitedHandleIds: [],
        permissions: APIDataFactory.defaultChannelPermissionsInput,
        defaultMemberRole: ChannelRole.PARTICIPANT,
      })
      expect(channel).toBeDefined()
      channelIdsToCleanup.push(channel.channelId)

      await delay(5000)

      // Inviter handle sends invitation to invitee handle
      await client1.channels.sendInvitations({
        handleId: inviterHandle.handleId,
        channelId: channel.channelId,
        targetHandleIds: [inviteeHandle.handleId],
      })

      // Check if the inviter handle is joined to the channel
      await isHandleExpectedMembershipInChannel(
        client1,
        inviterHandle.handleId,
        channel.channelId,
        inviterHandle.handleId,
        MembershipState.JOINED,
      )

      // Check if the inviteeHandle has an active invitation to the channel
      const invitations = await client2.channels.listInvitations(
        inviteeHandle.handleId,
      )
      const invitedChannelId = invitations.find(
        (invite) =>
          invite.channelId.toString() === channel.channelId.toString(),
      )?.channelId
      expect(invitedChannelId).not.toBeUndefined()

      // Invitee handle declines the invitation from the inviter handle
      await client2.channels.declineInvitation({
        handleId: inviteeHandle.handleId,
        channelId: channel.channelId,
      })

      await delay(5000)

      // Retrieve the channels the invitee handle has joined which should be none
      const inviteeJoinedChannels = await client2.channels.listJoined(
        inviteeHandle.handleId,
      )
      expect(inviteeJoinedChannels.length).toEqual(0)

      // Invitee should have no access to member list
      await expect(
        client2.channels.getChannelMembers({
          handleId: inviteeHandle.handleId,
          channelId: channel.channelId,
        }),
      ).rejects.toThrow(UnauthorizedError)

      // Check whether the channel members have the correct roles assigned
      const client1Members = await client1.channels.getChannelMembers({
        handleId: inviterHandle.handleId,
        channelId: channel.channelId,
      })
      expect(
        client1Members.some(
          (member) =>
            member.membership === MembershipState.JOINED &&
            member.role === ChannelRole.ADMIN,
        ),
      ).toBeTruthy()
    })

    it('send invitation and withdraw invitation successfully', async () => {
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

      const name = `channel-${v4()}`
      const description = 'channel-description'
      const tags = ['tag-1', 'tag-2']
      const channel = await client1.channels.createChannel({
        handleId: inviterHandle.handleId,
        name,
        description,
        joinRule: ChannelJoinRule.PUBLIC,
        tags,
        invitedHandleIds: [],
        permissions: APIDataFactory.defaultChannelPermissionsInput,
        defaultMemberRole: ChannelRole.PARTICIPANT,
      })
      expect(channel).toBeDefined()
      channelIdsToCleanup.push(channel.channelId)

      await delay(5000)

      // Inviter handle sends invitation to invitee handle
      await client1.channels.sendInvitations({
        handleId: inviterHandle.handleId,
        channelId: channel.channelId,
        targetHandleIds: [inviteeHandle.handleId],
      })

      // Check if the inviter handle is joined to the channel
      await isHandleExpectedMembershipInChannel(
        client1,
        inviterHandle.handleId,
        channel.channelId,
        inviterHandle.handleId,
        MembershipState.JOINED,
      )

      // Check if the inviteeHandle has an active invitation to the channel
      const invitations = await client2.channels.listInvitations(
        inviteeHandle.handleId,
      )
      const invitedChannelId = invitations.find(
        (invite) =>
          invite.channelId.toString() === channel.channelId.toString(),
      )?.channelId
      expect(invitedChannelId).not.toBeUndefined()

      // Inviter handle withdraws the invitation from the invitee handle
      await client1.channels.withdrawInvitation({
        handleId: inviterHandle.handleId,
        channelId: channel.channelId,
        targetHandleId: inviteeHandle.handleId,
      })

      // Invitee should have no access to member list
      await expect(
        client2.channels.getChannelMembers({
          handleId: inviteeHandle.handleId,
          channelId: channel.channelId,
        }),
      ).rejects.toThrow(UnauthorizedError)

      // Check whether the channel members have the correct roles assigned
      const client1Members = await client1.channels.getChannelMembers({
        handleId: inviterHandle.handleId,
        channelId: channel.channelId,
      })
      expect(
        client1Members.some(
          (member) =>
            member.membership === MembershipState.JOINED &&
            member.role === ChannelRole.ADMIN,
        ),
      ).toBeTruthy()
    })
  })

  describe('invitation request (knock) lifecycle', () => {
    it('send invitation request and withdraw invitation request successfully', async () => {
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

      const name = `channel-${v4()}`
      const description = 'channel-description'
      const tags = ['tag-1', 'tag-2']
      const channel = await client1.channels.createChannel({
        handleId: inviterHandle.handleId,
        name,
        description,
        joinRule: ChannelJoinRule.PUBLIC_WITH_INVITE,
        tags,
        invitedHandleIds: [],
        permissions: APIDataFactory.defaultChannelPermissionsInput,
        defaultMemberRole: ChannelRole.PARTICIPANT,
      })
      expect(channel).toBeDefined()
      channelIdsToCleanup.push(channel.channelId)

      // Invitee handle sends an invitation request (knock) to join channel
      await client2.channels.sendInvitationRequest({
        handleId: inviteeHandle.handleId,
        channelId: channel.channelId,
      })

      // Check if invitee handle has requested to join channel
      await isHandleExpectedMembershipInChannel(
        client1,
        inviterHandle.handleId,
        channel.channelId,
        inviteeHandle.handleId,
        MembershipState.REQUESTED,
      )

      // Invitee handle withdraws an invitation request
      await client2.channels.withdrawInvitationRequest({
        handleId: inviteeHandle.handleId,
        channelId: channel.channelId,
      })

      // Check if invitee handle has withdrawn request (invitee handle in left state)
      await isHandleExpectedMembershipInChannel(
        client1,
        inviterHandle.handleId,
        channel.channelId,
        inviteeHandle.handleId,
        MembershipState.LEFT,
      )
    })

    it('send invitation request and decline invitation request successfully', async () => {
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

      const name = `channel-${v4()}`
      const description = 'channel-description'
      const tags = ['tag-1', 'tag-2']
      const channel = await client1.channels.createChannel({
        handleId: inviterHandle.handleId,
        name,
        description,
        joinRule: ChannelJoinRule.PUBLIC_WITH_INVITE,
        tags,
        invitedHandleIds: [],
        permissions: APIDataFactory.defaultChannelPermissionsInput,
        defaultMemberRole: ChannelRole.PARTICIPANT,
      })
      expect(channel).toBeDefined()
      channelIdsToCleanup.push(channel.channelId)

      // Invitee handle sends an invitation request (knock) to join channel
      await client2.channels.sendInvitationRequest({
        handleId: inviteeHandle.handleId,
        channelId: channel.channelId,
      })

      // Check if invitee handle has requested to join channel
      await isHandleExpectedMembershipInChannel(
        client1,
        inviterHandle.handleId,
        channel.channelId,
        inviteeHandle.handleId,
        MembershipState.REQUESTED,
      )

      // Inviter handle declines invitation for invitee handle to join the channel
      await client1.channels.declineInvitationRequest({
        handleId: inviterHandle.handleId,
        channelId: channel.channelId,
        targetHandleId: inviteeHandle.handleId,
        reason: 'Declining this invite',
      })

      // Check if channel has declined invitee handle (invitee handle in left state)
      await isHandleExpectedMembershipInChannel(
        client1,
        inviterHandle.handleId,
        channel.channelId,
        inviteeHandle.handleId,
        MembershipState.LEFT,
      )
    })

    it('send invitation request and accept invitation request successfully', async () => {
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

      const name = `channel-${v4()}`
      const description = 'channel-description'
      const tags = ['tag-1', 'tag-2']
      const channel = await client1.channels.createChannel({
        handleId: inviterHandle.handleId,
        name,
        description,
        joinRule: ChannelJoinRule.PUBLIC_WITH_INVITE,
        tags,
        invitedHandleIds: [],
        permissions: APIDataFactory.defaultChannelPermissionsInput,
        defaultMemberRole: ChannelRole.PARTICIPANT,
      })
      expect(channel).toBeDefined()
      channelIdsToCleanup.push(channel.channelId)

      // Invitee handle sends an invitation request (knock) to join channel
      await client2.channels.sendInvitationRequest({
        handleId: inviteeHandle.handleId,
        channelId: channel.channelId,
      })

      // Check if invitee handle has requested to join channel
      await isHandleExpectedMembershipInChannel(
        client1,
        inviterHandle.handleId,
        channel.channelId,
        inviteeHandle.handleId,
        MembershipState.REQUESTED,
      )

      // Inviter handle accepts invitation request for invitee handle to join channel
      await client1.channels.acceptInvitationRequest({
        handleId: inviterHandle.handleId,
        channelId: channel.channelId,
        targetHandleId: inviteeHandle.handleId,
      })

      // Check if channel has accepted invitee handle (invitee handle in invited state)
      await isHandleExpectedMembershipInChannel(
        client1,
        inviterHandle.handleId,
        channel.channelId,
        inviteeHandle.handleId,
        MembershipState.INVITED,
      )
    })

    it.skip('send invitation request and list sent and received invitation requests successfully', async () => {
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

      const name = `channel-${v4()}`
      const description = 'channel-description'
      const tags = ['tag-1', 'tag-2']
      const channel = await client1.channels.createChannel({
        handleId: inviterHandle.handleId,
        name,
        description,
        joinRule: ChannelJoinRule.PUBLIC_WITH_INVITE,
        tags,
        invitedHandleIds: [],
        permissions: APIDataFactory.defaultChannelPermissionsInput,
        defaultMemberRole: ChannelRole.PARTICIPANT,
      })
      expect(channel).toBeDefined()
      channelIdsToCleanup.push(channel.channelId)

      await delay(5000)

      // Invitee handle sends an invitation request (knock) to join channel
      await client2.channels.sendInvitationRequest({
        handleId: inviteeHandle.handleId,
        channelId: channel.channelId,
      })

      // Check if invitee handle has requested to join channel
      await isHandleExpectedMembershipInChannel(
        client1,
        inviterHandle.handleId,
        channel.channelId,
        inviteeHandle.handleId,
        MembershipState.REQUESTED,
      )

      // Inviter handle lists all received channel invitation requests
      const receivedInvitationRequests =
        await client1.channels.listReceivedInvitationRequests({
          handleId: inviterHandle.handleId,
          channelId: channel.channelId,
        })
      expect(receivedInvitationRequests).toEqual([
        {
          channelId: channel.channelId,
          handleId: inviteeHandle.handleId,
          reason: undefined,
          createdAt: undefined,
        },
      ])

      // Invitee handle lists all channels they have sent an invitation request for
      const sentInvitationRequests =
        await client2.channels.listSentInvitationRequests(
          inviteeHandle.handleId,
        )
      expect(sentInvitationRequests).toEqual([
        { ...channel, memberCount: expect.any(Number) },
      ])

      // Inviter handle lists all channels they have sent an invitation request for
      const inviterSentInvitationRequests =
        await client1.channels.listSentInvitationRequests(
          inviterHandle.handleId,
        )
      expect(inviterSentInvitationRequests).toEqual([])
    })
  })

  describe('kickHandle, banHandle and unbanHandle', () => {
    it('should ban and unbans a handle from a channel successfully', async () => {
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

      const name = `channel-${v4()}`
      const description = 'channel-description'
      const tags = ['tag-1', 'tag-2']
      const channel = await client1.channels.createChannel({
        handleId: inviterHandle.handleId,
        name,
        description,
        joinRule: ChannelJoinRule.PUBLIC,
        tags,
        invitedHandleIds: [inviteeHandle.handleId],
        permissions: APIDataFactory.defaultChannelPermissionsInput,
        defaultMemberRole: ChannelRole.PARTICIPANT,
      })
      expect(channel).toBeDefined()
      channelIdsToCleanup.push(channel.channelId)

      // Check if inviter and invitee handles are joined to the channel
      const memberHandleIds = (
        await client1.channels.getChannelMembers({
          handleId: inviterHandle.handleId,
          channelId: channel.channelId,
        })
      ).map((member) => member.handle.handleId.toString())
      const expectedIds = [
        inviterHandle.handleId.toString(),
        inviteeHandle.handleId.toString(),
      ]
      expect(
        expectedIds.every((item) => memberHandleIds.includes(item)),
      ).toBeTruthy()

      // Inviter handle bans the invitee handle from the channel
      await client1.channels.banHandle({
        handleId: inviterHandle.handleId,
        channelId: channel.channelId,
        targetHandleId: inviteeHandle.handleId,
      })

      // Check whether invitee handle has membership state BANNED
      await isHandleExpectedMembershipInChannel(
        client1,
        inviterHandle.handleId,
        channel.channelId,
        inviteeHandle.handleId,
        MembershipState.BANNED,
      )

      // Inviter handle unbans the invitee handle from the channel
      await client1.channels.unbanHandle({
        handleId: inviterHandle.handleId,
        channelId: channel.channelId,
        targetHandleId: inviteeHandle.handleId,
      })

      // Check whether invitee handle has membership state LEFT
      await isHandleExpectedMembershipInChannel(
        client1,
        inviterHandle.handleId,
        channel.channelId,
        inviteeHandle.handleId,
        MembershipState.LEFT,
      )
    })

    it('should kick a handle from a channel successfully', async () => {
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

      const name = `channel-${v4()}`
      const description = 'channel-description'
      const tags = ['tag-1', 'tag-2']
      const channel = await client1.channels.createChannel({
        handleId: inviterHandle.handleId,
        name,
        description,
        joinRule: ChannelJoinRule.PUBLIC,
        tags,
        invitedHandleIds: [inviteeHandle.handleId],
        permissions: APIDataFactory.defaultChannelPermissionsInput,
        defaultMemberRole: ChannelRole.PARTICIPANT,
      })
      expect(channel).toBeDefined()
      channelIdsToCleanup.push(channel.channelId)

      // Check if inviter and invitee handles are joined to the channel
      const memberHandleIds = (
        await client1.channels.getChannelMembers({
          handleId: inviterHandle.handleId,
          channelId: channel.channelId,
        })
      ).map((member) => member.handle.handleId.toString())
      const expectedIds = [
        inviterHandle.handleId.toString(),
        inviteeHandle.handleId.toString(),
      ]
      // TODO: handle the case with or without admin user
      expect(
        expectedIds.every((item) => memberHandleIds.includes(item)),
      ).toBeTruthy()

      // Inviter handle kicks the invitee handle from the channel
      await client1.channels.kickHandle({
        handleId: inviterHandle.handleId,
        channelId: channel.channelId,
        targetHandleId: inviteeHandle.handleId,
      })

      // Check whether invitee handle has membership state LEFT
      await isHandleExpectedMembershipInChannel(
        client1,
        inviterHandle.handleId,
        channel.channelId,
        inviteeHandle.handleId,
        MembershipState.LEFT,
      )
    })
  })
})
