/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { KnownMembership, Room } from 'matrix-js-sdk/lib/matrix'
import {
  DirectChatExistsError,
  DirectChatMembershipError,
  HandleNotFoundError,
  RoomNotFoundError,
} from '../../../public'
import { DirectChatEntity } from '../../domain/entities/directChats/directChatEntity'
import { DirectChatInvitationEntity } from '../../domain/entities/directChats/directChatInvitationEntity'
import { DirectChatsService } from '../../domain/entities/directChats/directChatsService'
import { toChatId, toHandleId, toMatrixUserId } from '../../util/id'
import { MatrixClientManager } from '../common/matrixClientManager'

export class MatrixDirectChatsService implements DirectChatsService {
  constructor(private readonly matrixClient: MatrixClientManager) {}

  async create(handleIdToChatTo: string): Promise<string> {
    const userIdToChatTo = toMatrixUserId(
      handleIdToChatTo,
      this.matrixClient.homeServer,
    )
    const userExists = await this.matrixClient.userExists(userIdToChatTo)
    if (!userExists) {
      throw new HandleNotFoundError('Handle to chat to does not exist')
    }
    // Check that a chat with that handle doesn't already exist
    const exists = await this.chatExists(userIdToChatTo)
    if (exists) {
      throw new DirectChatExistsError('Direct chat already exists')
    }
    return await this.matrixClient.createDirectChat(userIdToChatTo)
  }

  async acceptInvitation(chatId: string): Promise<void> {
    const userId = await this.matrixClient.getUserId()
    const room = await this.matrixClient.getRoom(chatId)
    if (!room) {
      throw new RoomNotFoundError()
    }
    await this.matrixClient.joinDirectChat(userId, room.roomId)
  }

  async declineInvitation(chatId: string): Promise<void> {
    const room = await this.matrixClient.getRoom(chatId)
    if (!room) {
      throw new RoomNotFoundError()
    }
    await this.matrixClient.leaveRoom(room.roomId)
  }

  async listInvitations(): Promise<DirectChatInvitationEntity[]> {
    const userId = await this.matrixClient.getUserId()
    const invitedDirectChatRooms = await this.findDirectChatRooms(
      userId,
      KnownMembership.Invite,
    )
    return invitedDirectChatRooms.map((room) => {
      const inviter = room
        .getMembers()
        .find((member) => member.userId !== userId)

      if (!inviter) {
        throw new DirectChatMembershipError(
          'Direct chat membership not available',
        )
      }
      return {
        chatId: toChatId(room.roomId),
        inviterHandle: {
          handleId: toHandleId(inviter.userId),
          name: inviter.name,
        },
      }
    })
  }

  async listJoined(): Promise<DirectChatEntity[]> {
    const userId = await this.matrixClient.getUserId()
    const joinedDirectChatRooms = await this.findDirectChatRooms(
      userId,
      KnownMembership.Join,
    )
    const entities = await Promise.all(
      joinedDirectChatRooms.map(async (room) => {
        const members = await this.matrixClient.getMembers(room.roomId)

        const otherMember = members?.find((member) => member.userId !== userId)

        if (!otherMember) {
          throw new DirectChatMembershipError(
            'Direct chat membership not available',
          )
        }

        return {
          chatId: toChatId(room.roomId),
          otherHandle: {
            handleId: toHandleId(otherMember.userId),
            name: otherMember.displayName ?? '',
          },
        }
      }),
    )

    return entities
  }

  async blockHandle(handleId: string): Promise<void> {
    const userIdToBlock = toMatrixUserId(handleId, this.matrixClient.homeServer)
    const userExists = await this.matrixClient.userExists(userIdToBlock)
    if (!userExists) {
      throw new HandleNotFoundError('Handle to block does not exist')
    }
    await this.matrixClient.ignoreHandle(userIdToBlock)
  }

  async unblockHandle(handleId: string): Promise<void> {
    const userIdToUnblock = toMatrixUserId(
      handleId,
      this.matrixClient.homeServer,
    )
    const userExists = await this.matrixClient.userExists(userIdToUnblock)
    if (!userExists) {
      throw new HandleNotFoundError('Handle to unblock does not exist')
    }
    await this.matrixClient.unignoreHandle(userIdToUnblock)
  }

  async listBlockedHandles(): Promise<string[]> {
    return await this.matrixClient.listIgnoredHandles()
  }

  private async chatExists(otherHandleId: string): Promise<boolean> {
    const currentUserId = await this.matrixClient.getUserId()
    const [rooms, accountData] = await Promise.all([
      this.matrixClient.listRooms(),
      this.matrixClient.getDirectChatAccountData(),
    ])
    const directContent = accountData?.getContent()?.[currentUserId] ?? []
    const directChats = rooms.filter((room) =>
      directContent.includes(room.roomId),
    )

    const results = await Promise.all(
      directChats.map(async (room) => {
        const members = await this.matrixClient.getMembers(room.roomId)
        if (!members) return false

        const otherHandle = members.some(
          (member) =>
            member.userId === otherHandleId &&
            (member.membership === 'join' || member.membership === 'invite'),
        )

        return otherHandle
      }),
    )

    return results.some(Boolean)
  }

  private async findDirectChatRooms(
    userId: string,
    membership: KnownMembership,
  ): Promise<Room[]> {
    // Lookup whether roomId exists in the account data for the user
    const [rooms, accountData] = await Promise.all([
      this.matrixClient.listRooms(),
      this.matrixClient.getDirectChatAccountData(),
    ])
    const roomMap = new Map(Object.entries(accountData?.getContent() ?? {}))
    const userRoomList = roomMap.get(userId) ?? []
    const directContent = accountData?.getContent()?.[userId] ?? []
    let directChatRooms = rooms.filter(
      (room) =>
        room.getMyMembership() === membership &&
        directContent.includes(room.roomId) &&
        room
          .getMembers()
          .every((member) => member.membership !== KnownMembership.Leave),
    )
    // Clean up stale rooms
    const roomsToLeave = rooms.filter(
      (room) =>
        room.getMyMembership() === membership &&
        directContent.includes(room.roomId) &&
        room
          .getMembers()
          .some((member) => member.membership === KnownMembership.Leave),
    )
    for (const room of roomsToLeave) {
      const index = userRoomList.indexOf(room.roomId)
      if (index > -1) {
        userRoomList.splice(index, 1)
      }
      await this.matrixClient.leaveRoom(room.roomId)
    }

    // Try looking up room members to determine if direct chat room
    if (!directChatRooms.length) {
      directChatRooms = rooms.filter(
        (room) =>
          room.getMyMembership() === membership &&
          room
            .getMembers()
            .some(
              (member) =>
                member.events.member?.getContent()?.['is_direct'] === true,
            ),
      )
    }
    return directChatRooms
  }
}
