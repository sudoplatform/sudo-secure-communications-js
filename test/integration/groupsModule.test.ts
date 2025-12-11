/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { DefaultLogger } from '@sudoplatform/sudo-common'
import { SudoUserClient } from '@sudoplatform/sudo-user'
import { v4 } from 'uuid'
import {
  setupSecureCommsClient,
  setupSudoPlatformConfig,
} from './util/secureCommsClientLifecycle'
import { isHandleExpectedMembershipInGroup } from './util/util'
import { delay } from '../../src/private/util/delay'
import {
  ChannelRole,
  GroupId,
  GroupPermissions,
  GroupRole,
  HandleId,
  HandleNotFoundError,
  MembershipState,
  OwnedHandle,
  PermissionDeniedError,
  RoomNotFoundError,
  SecureCommsClient,
  UnacceptableWordsError,
} from '../../src/public'

describe('SecureCommsClient GroupsModule Test Suite', () => {
  jest.setTimeout(240000)
  const log = new DefaultLogger('SecureCommsClientIntegrationTests')

  setupSudoPlatformConfig(log)

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

  describe('createGroup, getGroup and getGroups', () => {
    it('creates and retrieves a group successfully', async () => {
      const handleName = `test_handle_${v4()}`
      inviterHandle = await client1.handles.provisionHandle({
        name: handleName,
      })

      await client1.startSyncing(inviterHandle.handleId)

      const name = `group-${v4()}`
      const description = 'group-description'
      const group = await client1.groups.createGroup({
        handleId: inviterHandle.handleId,
        name,
        description,
        invitedHandleIds: [],
      })
      expect(group).toEqual({
        groupId: expect.any(GroupId),
        name,
        description,
        avatarUrl: undefined,
        permissions: { ...GroupPermissions.default },
        memberCount: 1,
      })

      // Retrieve group with getGroup
      const retrievedGroup = await client1.groups.getGroup({
        handleId: inviterHandle.handleId,
        groupId: group.groupId,
      })
      expect(retrievedGroup).toMatchObject({
        groupId: expect.any(GroupId),
        name,
        description,
        avatarUrl: undefined,
      })

      // Retrieve a single group with getGroups
      const listedGroups = await client1.groups.getGroups({
        handleId: inviterHandle.handleId,
        groupIds: [group.groupId],
      })
      expect(listedGroups).toHaveLength(1)
    })

    it('creates and retrieves multiple groups successfully', async () => {
      const handleName = `test_handle_${v4()}`
      inviterHandle = await client1.handles.provisionHandle({
        name: handleName,
      })

      await client1.startSyncing(inviterHandle.handleId)

      const groupIds: GroupId[] = []

      for (let i = 0; i < 2; i++) {
        const group = await client1.groups.createGroup({
          handleId: inviterHandle.handleId,
          name: `group-${i}-${v4()}`,
          description: 'group-description',
          invitedHandleIds: [],
        })
        groupIds.push(group.groupId)
        await delay(2000)
      }

      const listedGroups = await client1.groups.getGroups({
        handleId: inviterHandle.handleId,
        groupIds,
      })
      expect(listedGroups).toHaveLength(2)
    })

    it('lists empty groups for empty ids input', async () => {
      const handleName = `test_handle_${v4()}`
      inviterHandle = await client1.handles.provisionHandle({
        name: handleName,
      })
      await client1.startSyncing(inviterHandle.handleId)

      const listedGroups = await client1.groups.getGroups({
        handleId: inviterHandle.handleId,
        groupIds: [],
      })
      expect(listedGroups).toHaveLength(0)
    })

    it('lists empty groups for non-existent groups', async () => {
      const handleName = `test_handle_${v4()}`
      inviterHandle = await client1.handles.provisionHandle({
        name: handleName,
      })
      await client1.startSyncing(inviterHandle.handleId)

      const listedGroups = await client1.groups.getGroups({
        handleId: inviterHandle.handleId,
        groupIds: [new GroupId(v4()), new GroupId(v4())],
      })
      expect(listedGroups).toHaveLength(0)
    })

    it('should throw an UnacceptableWordsError when attempting to create a group with an unacceptable name', async () => {
      const handleName = `test_handle_${v4()}`
      inviterHandle = await client1.handles.provisionHandle({
        name: handleName,
      })
      await client1.startSyncing(inviterHandle.handleId)

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
      await client1.startSyncing(inviterHandle.handleId)

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

    it('returns undefined for non-existent group when attempting to retrieve a group', async () => {
      const handleName = `test_handle_${v4()}`
      inviterHandle = await client1.handles.provisionHandle({
        name: handleName,
      })
      await client1.startSyncing(inviterHandle.handleId)

      await expect(
        client1.groups.getGroup({
          handleId: inviterHandle.handleId,
          groupId: new GroupId(v4()),
        }),
      ).resolves.toBeUndefined()
    })
  })

  describe('createGroup, updateGroup and deleteGroup', () => {
    it('creates, updates and deletes a group and returns expected output', async () => {
      const handleName = `test_handle_${v4()}`
      inviterHandle = await client1.handles.provisionHandle({
        name: handleName,
      })
      await client1.startSyncing(inviterHandle.handleId)

      const name = `group-${v4()}`
      const description = 'group-description'
      const group = await client1.groups.createGroup({
        handleId: inviterHandle.handleId,
        name,
        description,
        invitedHandleIds: [],
      })
      expect(group).toBeDefined()

      let retrievedGroup = await client1.groups.getGroup({
        handleId: inviterHandle.handleId,
        groupId: group.groupId,
      })
      expect(retrievedGroup).toBeDefined()

      const updatedName = `new-group-${v4()}`
      const updatedGroup = await client1.groups.updateGroup({
        handleId: inviterHandle.handleId,
        groupId: group.groupId,
        name: { value: updatedName },
      })
      expect(updatedGroup).toEqual({
        ...retrievedGroup,
        name: updatedName,
      })

      await expect(
        client1.groups.deleteGroup({
          handleId: inviterHandle.handleId,
          groupId: group.groupId,
        }),
      ).resolves.not.toThrow()
    })

    it('should throw a RoomNotFoundError when an attempting to update a non-existent group', async () => {
      const handleName = `test_handle_${v4()}`
      inviterHandle = await client1.handles.provisionHandle({
        name: handleName,
      })
      await client1.startSyncing(inviterHandle.handleId)

      await expect(
        client1.groups.updateGroup({
          handleId: inviterHandle.handleId,
          groupId: new GroupId('nonExistentId'),
          name: { value: `new-group-${v4()}` },
        }),
      ).rejects.toThrow(RoomNotFoundError)
    })

    it('should throw an UnacceptableWordsError when attempting to update name with unacceptable words', async () => {
      const handleName = `test_handle_${v4()}`
      inviterHandle = await client1.handles.provisionHandle({
        name: handleName,
      })
      await client1.startSyncing(inviterHandle.handleId)

      const name = `group-${v4()}`
      const description = 'group-description'
      const group = await client1.groups.createGroup({
        handleId: inviterHandle.handleId,
        name,
        description,
        invitedHandleIds: [],
      })
      expect(group).toBeDefined()

      await expect(
        client1.groups.updateGroup({
          handleId: inviterHandle.handleId,
          groupId: group.groupId,
          name: { value: `excludedpartial-${v4()}` },
        }),
      ).rejects.toThrow(UnacceptableWordsError)
    })

    it('should throw a HandleNotFoundError when handle attempting to delete a group is not found', async () => {
      const inviterHandleName = `test_inviter_handle_${v4()}`
      inviterHandle = await client1.handles.provisionHandle({
        name: inviterHandleName,
      })
      await client1.startSyncing(inviterHandle.handleId)

      const name = `group-${v4()}`
      const description = 'group-description'
      const group = await client1.groups.createGroup({
        handleId: inviterHandle.handleId,
        name,
        description,
        invitedHandleIds: [],
      })
      expect(group).toBeDefined()

      await expect(
        client1.groups.deleteGroup({
          handleId: new HandleId(v4()),
          groupId: group.groupId,
        }),
      ).rejects.toThrow(HandleNotFoundError)
    })

    it('should throw a PermissionDeniedError when handle attempting to delete a group is not an admin', async () => {
      const inviterHandleName = `test_inviter_handle_${v4()}`
      inviterHandle = await client1.handles.provisionHandle({
        name: inviterHandleName,
      })
      await client1.startSyncing(inviterHandle.handleId)

      const name = `group-${v4()}`
      const description = 'group-description'
      const group = await client1.groups.createGroup({
        handleId: inviterHandle.handleId,
        name,
        description,
        invitedHandleIds: [],
      })
      expect(group).toBeDefined()

      // Modify inviter handle group role from ADMIN to PARTICIPANT
      await client1.groups.updateGroupMemberRole({
        handleId: inviterHandle.handleId,
        groupId: group.groupId,
        targetHandleId: inviterHandle.handleId,
        role: GroupRole.PARTICIPANT,
      })

      await expect(
        client1.groups.deleteGroup({
          handleId: inviterHandle.handleId,
          groupId: group.groupId,
        }),
      ).rejects.toThrow(PermissionDeniedError)
    })

    it('should throw a PermissionDeniedError when handle attempting to delete a group does not have a role higher than all members', async () => {
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

      const name = `group-${v4()}`
      const description = 'group-description'
      const group = await client1.groups.createGroup({
        handleId: inviterHandle.handleId,
        name,
        description,
        invitedHandleIds: [inviteeHandle.handleId],
      })
      expect(group).toBeDefined()

      // Modify invitee handle group role from PARTICIPANT to ADMIN
      await client1.groups.updateGroupMemberRole({
        handleId: inviterHandle.handleId,
        groupId: group.groupId,
        targetHandleId: inviteeHandle.handleId,
        role: GroupRole.ADMIN,
      })

      await expect(
        client1.groups.deleteGroup({
          handleId: inviterHandle.handleId,
          groupId: group.groupId,
        }),
      ).rejects.toThrow(PermissionDeniedError)
    })
  })

  describe('createGroup and leaveGroup', () => {
    it('create and leaves a group successfully', async () => {
      const handleName = `test_handle_${v4()}`
      inviterHandle = await client1.handles.provisionHandle({
        name: handleName,
      })
      await client1.startSyncing(inviterHandle.handleId)

      const inviteeHandleName = `test_invitee_handle_${v4()}`
      inviteeHandle = await client2.handles.provisionHandle({
        name: inviteeHandleName,
      })
      await client2.startSyncing(inviteeHandle.handleId)

      const name = `group-${v4()}`
      const description = 'group-description'
      const group = await client1.groups.createGroup({
        handleId: inviterHandle.handleId,
        name,
        description,
        avatar: undefined,
        invitedHandleIds: [inviteeHandle.handleId],
      })
      expect(group).toBeDefined()

      // Check if the inviter handle is joined to the group
      await isHandleExpectedMembershipInGroup(
        client1,
        inviterHandle.handleId,
        group.groupId,
        inviterHandle.handleId,
        MembershipState.JOINED,
      )

      await client2.groups.leaveGroup({
        handleId: inviteeHandle.handleId,
        groupId: group.groupId,
      })

      // Check if the invitee handle has left the group
      await isHandleExpectedMembershipInGroup(
        client1,
        inviterHandle.handleId,
        group.groupId,
        inviteeHandle.handleId,
        MembershipState.LEFT,
      )
    })
  })

  describe(`createGroup, listJoined and invitation lifecycle`, () => {
    it('send and accept invitation and list the groups that the user has joined successfully', async () => {
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

      const name = `group-${v4()}`
      const description = 'group-description'
      const group = await client1.groups.createGroup({
        handleId: inviterHandle.handleId,
        name,
        description,
        avatar: undefined,
        invitedHandleIds: [],
      })
      expect(group).toBeDefined()

      // Inviter handle sends invitation to invitee handle
      await client1.groups.sendInvitations({
        handleId: inviterHandle.handleId,
        groupId: group.groupId,
        targetHandleIds: [inviteeHandle.handleId],
      })

      // Check if the inviter handle is joined to the group
      await isHandleExpectedMembershipInGroup(
        client1,
        inviterHandle.handleId,
        group.groupId,
        inviterHandle.handleId,
        MembershipState.JOINED,
      )

      // Check if the invitee handle has an active invitation to the group
      const invitations = await client2.groups.listInvitations(
        inviteeHandle.handleId,
      )
      const invitedGroupId = invitations.find(
        (invite) => invite.groupId.toString() === group.groupId.toString(),
      )?.groupId
      expect(invitedGroupId).not.toBeUndefined()

      // Invitee handle accepts the invitation from the inviter handle
      await client2.groups.acceptInvitation({
        handleId: inviteeHandle.handleId,
        groupId: group.groupId,
      })

      // Retrieve the groups the inviter handle has joined
      const inviterJoinedGroups = await client1.groups.listJoined(
        inviterHandle.handleId,
      )
      expect(inviterJoinedGroups).toContainEqual(
        expect.objectContaining({
          groupId: group.groupId,
          name: group.name,
          avatarUrl: group.avatarUrl,
        }),
      )

      // Retrieve the groups the invitee handle has joined
      const inviteeJoinedGroups = await client2.groups.listJoined(
        inviteeHandle.handleId,
      )
      expect(inviteeJoinedGroups).toContainEqual(
        expect.objectContaining({
          groupId: group.groupId,
          name: group.name,
          avatarUrl: group.avatarUrl,
        }),
      )
    })

    it('send invitation and decline invitation to join a group successfully', async () => {
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

      const name = `group-${v4()}`
      const description = 'group-description'
      const group = await client1.groups.createGroup({
        handleId: inviterHandle.handleId,
        name,
        description,
        avatar: undefined,
        invitedHandleIds: [],
      })
      expect(group).toBeDefined()

      // Inviter handle sends invitation to invitee handle
      await client1.groups.sendInvitations({
        handleId: inviterHandle.handleId,
        groupId: group.groupId,
        targetHandleIds: [inviteeHandle.handleId],
      })

      // Check if the inviter handle is joined to the group
      await isHandleExpectedMembershipInGroup(
        client1,
        inviterHandle.handleId,
        group.groupId,
        inviterHandle.handleId,
        MembershipState.JOINED,
      )

      // Check if the invitee handle has an active invitation to the group
      const invitations = await client2.groups.listInvitations(
        inviteeHandle.handleId,
      )
      const invitedGroupId = invitations.find(
        (invite) => invite.groupId.toString() === group.groupId.toString(),
      )?.groupId
      expect(invitedGroupId).not.toBeUndefined()

      // Invitee handle declines the invitation from the inviter handle
      await client2.groups.declineInvitation({
        handleId: inviteeHandle.handleId,
        groupId: group.groupId,
      })

      // Retrieve the groups the invitee handle has joined which should be none
      const inviteeJoinedGroups = await client2.groups.listJoined(
        inviteeHandle.handleId,
      )
      expect(inviteeJoinedGroups.length).toEqual(0)
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

      const name = `group-${v4()}`
      const description = 'group-description'
      const group = await client1.groups.createGroup({
        handleId: inviterHandle.handleId,
        name,
        description,
        avatar: undefined,
        invitedHandleIds: [],
      })
      expect(group).toBeDefined()

      // Inviter handle sends invitation to invitee handle
      await client1.groups.sendInvitations({
        handleId: inviterHandle.handleId,
        groupId: group.groupId,
        targetHandleIds: [inviteeHandle.handleId],
      })

      // Check if the inviter handle is joined to the group
      await isHandleExpectedMembershipInGroup(
        client1,
        inviterHandle.handleId,
        group.groupId,
        inviterHandle.handleId,
        MembershipState.JOINED,
      )

      // Check if the inviteeHandle has an active invitation to the group
      let invitations = await client2.groups.listInvitations(
        inviteeHandle.handleId,
      )
      const invitedGroupId = invitations.find(
        (invite) => invite.groupId.toString() === group.groupId.toString(),
      )?.groupId
      expect(invitedGroupId).not.toBeUndefined()

      // Inviter handle withdraws the invitation from the invitee handle
      await client1.groups.withdrawInvitation({
        handleId: inviterHandle.handleId,
        groupId: group.groupId,
        targetHandleId: inviteeHandle.handleId,
      })
    })
  })

  describe('updateGroupMemberRole and getGroupMembers', () => {
    it('should update a group members role and retrieve the updated group members successfully', async () => {
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

      const name = `group-${v4()}`
      const description = 'group-description'
      const group = await client1.groups.createGroup({
        handleId: inviterHandle.handleId,
        name,
        description,
        avatar: undefined,
        invitedHandleIds: [inviteeHandle.handleId],
      })
      expect(group).toBeDefined()

      let members = await client1.groups.getGroupMembers({
        handleId: inviterHandle.handleId,
        groupId: group.groupId,
      })

      let inviteeMember = members.find(
        (member) =>
          member.handle.handleId.toString() ===
          inviteeHandle.handleId.toString(),
      )
      expect(inviteeMember?.role).toBe(ChannelRole.PARTICIPANT)

      // Modify invitee handle own group role from PARTICIPANT to ADMIN
      await client1.groups.updateGroupMemberRole({
        handleId: inviterHandle.handleId,
        groupId: group.groupId,
        targetHandleId: inviteeHandle.handleId,
        role: GroupRole.ADMIN,
      })

      members = await client1.groups.getGroupMembers({
        handleId: inviterHandle.handleId,
        groupId: group.groupId,
      })

      inviteeMember = members.find(
        (member) =>
          member.handle.handleId.toString() ===
          inviteeHandle.handleId.toString(),
      )
      expect(inviteeMember?.role).toBe(ChannelRole.ADMIN)
    })

    it('should throw PermissionDeniedError when handle attempting to update a member role does not have a high enough role', async () => {
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

      const name = `group-${v4()}`
      const description = 'group-description'
      const group = await client1.groups.createGroup({
        handleId: inviterHandle.handleId,
        name,
        description,
        avatar: undefined,
        invitedHandleIds: [inviteeHandle.handleId],
      })
      expect(group).toBeDefined()

      await expect(
        client2.groups.updateGroupMemberRole({
          handleId: inviteeHandle.handleId,
          groupId: group.groupId,
          targetHandleId: inviterHandle.handleId,
          role: GroupRole.PARTICIPANT,
        }),
      ).rejects.toThrow(PermissionDeniedError)
    })
  })

  describe('kickHandle, banHandle and unbanHandle', () => {
    it('should ban and unbans a handle from a group successfully', async () => {
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

      const name = `group-${v4()}`
      const description = 'group-description'
      const group = await client1.groups.createGroup({
        handleId: inviterHandle.handleId,
        name,
        description,
        avatar: undefined,
        invitedHandleIds: [inviteeHandle.handleId],
      })
      expect(group).toBeDefined()

      // Check if inviter and invitee handles are joined to the group
      const memberHandleIds = (
        await client1.groups.getGroupMembers({
          handleId: inviterHandle.handleId,
          groupId: group.groupId,
        })
      ).map((member) => member.handle.handleId.toString())
      const expectedIds = [
        inviterHandle.handleId.toString(),
        inviteeHandle.handleId.toString(),
      ]
      expect(
        expectedIds.every((item) => memberHandleIds.includes(item)),
      ).toBeTruthy()

      // Inviter handle bans the invitee handle from the group
      await client1.groups.banHandle({
        handleId: inviterHandle.handleId,
        groupId: group.groupId,
        targetHandleId: inviteeHandle.handleId,
      })

      // Check whether invitee handle has membership state BANNED
      await isHandleExpectedMembershipInGroup(
        client1,
        inviterHandle.handleId,
        group.groupId,
        inviteeHandle.handleId,
        MembershipState.BANNED,
      )

      // Inviter handle unbans the invitee handle from the group
      await client1.groups.unbanHandle({
        handleId: inviterHandle.handleId,
        groupId: group.groupId,
        targetHandleId: inviteeHandle.handleId,
      })

      // Check whether invitee handle has membership state LEFT
      await isHandleExpectedMembershipInGroup(
        client1,
        inviterHandle.handleId,
        group.groupId,
        inviteeHandle.handleId,
        MembershipState.LEFT,
      )
    })

    it('should kick a handle from a group successfully', async () => {
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

      const name = `group-${v4()}`
      const description = 'group-description'
      const group = await client1.groups.createGroup({
        handleId: inviterHandle.handleId,
        name,
        description,
        avatar: undefined,
        invitedHandleIds: [inviteeHandle.handleId],
      })
      expect(group).toBeDefined()

      // Check if inviter and invitee handles are joined to the group
      const memberHandleIds = (
        await client1.groups.getGroupMembers({
          handleId: inviterHandle.handleId,
          groupId: group.groupId,
        })
      ).map((member) => member.handle.handleId.toString())
      const expectedIds = [
        inviterHandle.handleId.toString(),
        inviteeHandle.handleId.toString(),
      ]
      expect(
        expectedIds.every((item) => memberHandleIds.includes(item)),
      ).toBeTruthy()

      // Inviter handle kicks the invitee handle from the group
      await client1.groups.kickHandle({
        handleId: inviterHandle.handleId,
        groupId: group.groupId,
        targetHandleId: inviteeHandle.handleId,
      })

      // Check whether invitee handle has membership state LEFT
      await isHandleExpectedMembershipInGroup(
        client1,
        inviterHandle.handleId,
        group.groupId,
        inviteeHandle.handleId,
        MembershipState.LEFT,
      )
    })

    it('should throw PermissionDeniedError when handle attempting to perform kick does not have a high enough role', async () => {
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

      const name = `group-${v4()}`
      const description = 'group-description'
      const group = await client1.groups.createGroup({
        handleId: inviterHandle.handleId,
        name,
        description,
        avatar: undefined,
        invitedHandleIds: [inviteeHandle.handleId],
      })
      expect(group).toBeDefined()

      await expect(
        client2.groups.kickHandle({
          handleId: inviteeHandle.handleId,
          groupId: group.groupId,
          targetHandleId: inviterHandle.handleId,
        }),
      ).rejects.toThrow(PermissionDeniedError)
    })

    it('should throw PermissionDeniedError when handle attempting to perform ban does not have a high enough role', async () => {
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

      const name = `group-${v4()}`
      const description = 'group-description'
      const group = await client1.groups.createGroup({
        handleId: inviterHandle.handleId,
        name,
        description,
        avatar: undefined,
        invitedHandleIds: [inviteeHandle.handleId],
      })
      expect(group).toBeDefined()

      await expect(
        client2.groups.banHandle({
          handleId: inviteeHandle.handleId,
          groupId: group.groupId,
          targetHandleId: inviterHandle.handleId,
        }),
      ).rejects.toThrow(PermissionDeniedError)
    })

    it('should throw PermissionDeniedError when handle attempting to perform an unban does not have a high enough role', async () => {
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

      const name = `group-${v4()}`
      const description = 'group-description'
      const group = await client1.groups.createGroup({
        handleId: inviterHandle.handleId,
        name,
        description,
        avatar: undefined,
        invitedHandleIds: [inviteeHandle.handleId],
      })
      expect(group).toBeDefined()

      await expect(
        client2.groups.unbanHandle({
          handleId: inviteeHandle.handleId,
          groupId: group.groupId,
          targetHandleId: inviterHandle.handleId,
        }),
      ).rejects.toThrow(PermissionDeniedError)
    })
  })
})
