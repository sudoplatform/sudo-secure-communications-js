/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { MatrixClient, Room } from 'matrix-js-sdk/lib/matrix'
import {
  anything,
  capture,
  instance,
  mock,
  reset,
  verify,
  when,
} from 'ts-mockito'
import { MatrixClientManager } from '../../../../../src/private/data/common/matrixClientManager'
import { MatrixDirectChatsService } from '../../../../../src/private/data/directChats/matrixDirectChatsService'
import {
  DirectChatExistsError,
  DirectChatMembershipError,
  HandleNotFoundError,
  RoomNotFoundError,
} from '../../../../../src/public'

describe('MatrixDirectChatsService Test Suite', () => {
  const mockMatrixClient = mock<MatrixClient>()
  const mockMatrixClientManager = mock<MatrixClientManager>()

  let instanceUnderTest: MatrixDirectChatsService

  beforeEach(() => {
    reset(mockMatrixClient)
    reset(mockMatrixClientManager)

    instanceUnderTest = new MatrixDirectChatsService(
      instance(mockMatrixClientManager),
    )
  })

  describe('create', () => {
    it('calls matrixClient and returns result correctly', async () => {
      const handleIdToChatTo = 'testHandleIdToChatTo'
      when(mockMatrixClientManager.userExists(anything())).thenResolve(true)
      when(mockMatrixClientManager.createDirectChat(anything())).thenResolve(
        handleIdToChatTo,
      )
      jest
        .spyOn<any, any>(instanceUnderTest, 'chatExists')
        .mockResolvedValue(false)

      const result = await instanceUnderTest.create(handleIdToChatTo)

      expect(result).toStrictEqual(handleIdToChatTo)
      const [userIdArg] = capture(mockMatrixClientManager.userExists).first()
      expect(userIdArg).toContain(handleIdToChatTo)
      verify(mockMatrixClientManager.userExists(anything())).once()
      expect(instanceUnderTest['chatExists']).toHaveBeenCalledWith(
        expect.stringContaining(handleIdToChatTo),
      )
      const [inputArg] = capture(
        mockMatrixClientManager.createDirectChat,
      ).first()
      expect(inputArg).toStrictEqual<typeof inputArg>(
        expect.stringContaining(handleIdToChatTo),
      )
      verify(mockMatrixClientManager.createDirectChat(anything())).once()
    })

    it('should throw a HandleNotFoundError if the handle to chat to does not exist', async () => {
      const handleIdToChatTo = 'testHandleIdToChatTo'
      when(mockMatrixClientManager.userExists(anything())).thenResolve(false)

      await expect(instanceUnderTest.create(handleIdToChatTo)).rejects.toThrow(
        HandleNotFoundError,
      )

      const [userIdArg] = capture(mockMatrixClientManager.userExists).first()
      expect(userIdArg).toContain(handleIdToChatTo)
      verify(mockMatrixClientManager.userExists(anything())).once()
    })

    it('should throw a DirectChatExistsError if a direct chat already exists between handles', async () => {
      const userId = 'testUserId'
      const handleIdToChatTo = 'testHandleIdToChatTo'
      when(mockMatrixClientManager.userExists(anything())).thenResolve(true)
      when(mockMatrixClientManager.getUserId()).thenResolve(userId)
      jest
        .spyOn<any, any>(instanceUnderTest, 'chatExists')
        .mockResolvedValue(true)

      await expect(instanceUnderTest.create(handleIdToChatTo)).rejects.toThrow(
        DirectChatExistsError,
      )

      const [userIdArg] = capture(mockMatrixClientManager.userExists).first()
      expect(userIdArg).toContain(handleIdToChatTo)
      verify(mockMatrixClientManager.userExists(anything())).once()
      expect(instanceUnderTest['chatExists']).toHaveBeenCalledWith(
        expect.stringContaining(handleIdToChatTo),
      )
    })
  })

  describe('acceptInvitation', () => {
    it('calls matrixClient correctly', async () => {
      const roomId = 'testRoomId'
      const userId = 'testUserId'
      const room = new Room(roomId, mockMatrixClient, userId)
      when(mockMatrixClientManager.getRoom(anything())).thenResolve(room)
      when(mockMatrixClientManager.getUserId()).thenResolve(userId)

      await expect(
        instanceUnderTest.acceptInvitation(roomId),
      ).resolves.not.toThrow()

      const [roomIdArg] = capture(mockMatrixClientManager.getRoom).first()
      expect(roomIdArg).toStrictEqual<typeof roomIdArg>(roomId)
      verify(mockMatrixClientManager.getRoom(anything())).once()
      const [userIdArg, joinRoomIdArg] = capture(
        mockMatrixClientManager.joinDirectChat,
      ).first()
      expect(userIdArg).toStrictEqual<typeof userIdArg>(userId)
      expect(joinRoomIdArg).toStrictEqual<typeof joinRoomIdArg>(room.roomId)
      verify(
        mockMatrixClientManager.joinDirectChat(anything(), anything()),
      ).once()
    })

    it('should throw a RoomNotFoundError for an undefined matrix room', async () => {
      const roomId = 'testRoomId'
      when(mockMatrixClientManager.getRoom(anything())).thenResolve(undefined)

      await expect(instanceUnderTest.acceptInvitation(roomId)).rejects.toThrow(
        RoomNotFoundError,
      )
    })
  })

  describe('declineInvitation', () => {
    it('calls matrixClient correctly', async () => {
      const roomId = 'testRoomId'
      const userId = 'testUserId'
      const room = new Room(roomId, mockMatrixClient, userId)
      when(mockMatrixClientManager.getRoom(anything())).thenResolve(room)

      await expect(
        instanceUnderTest.declineInvitation(roomId),
      ).resolves.not.toThrow()

      const [roomIdArg] = capture(mockMatrixClientManager.getRoom).first()
      expect(roomIdArg).toStrictEqual<typeof roomIdArg>(roomId)
      verify(mockMatrixClientManager.getRoom(anything())).once()
      const [leaveRoomIdArg] = capture(
        mockMatrixClientManager.leaveRoom,
      ).first()
      expect(leaveRoomIdArg).toStrictEqual<typeof leaveRoomIdArg>(room.roomId)
      verify(mockMatrixClientManager.leaveRoom(anything())).once()
    })

    it('should throw a RoomNotFoundError for an undefined matrix room', async () => {
      const roomId = 'testRoomId'
      when(mockMatrixClientManager.getRoom(anything())).thenResolve(undefined)

      await expect(instanceUnderTest.declineInvitation(roomId)).rejects.toThrow(
        RoomNotFoundError,
      )
    })
  })

  describe('listInvitations', () => {
    it('should throw a DirectChatMembershipError if the user does not exist in the direct chat', async () => {
      const handleId = 'testHandleId'
      const roomId = 'testRoomId'
      const room = new Room(roomId, mockMatrixClient, handleId)
      when(mockMatrixClientManager.getUserId()).thenResolve(handleId)
      jest
        .spyOn<any, any>(instanceUnderTest, 'findDirectChatRooms')
        .mockResolvedValue([room])

      await expect(instanceUnderTest.listInvitations()).rejects.toThrow(
        DirectChatMembershipError,
      )

      verify(mockMatrixClientManager.getUserId()).once()
    })
  })

  describe('listJoined', () => {
    it('should throw a DirectChatMembershipError if the user does not exist in the direct chat', async () => {
      const handleId = 'testHandleId'
      const roomId = 'testRoomId'
      const room = new Room(roomId, mockMatrixClient, handleId)
      when(mockMatrixClientManager.getUserId()).thenResolve(handleId)
      jest
        .spyOn<any, any>(instanceUnderTest, 'findDirectChatRooms')
        .mockResolvedValue([room])

      await expect(instanceUnderTest.listJoined()).rejects.toThrow(
        DirectChatMembershipError,
      )

      verify(mockMatrixClientManager.getUserId()).once()
    })
  })

  describe('blockHandle', () => {
    it('calls matrixClient correctly', async () => {
      const handleId = 'testHandleId'
      when(mockMatrixClientManager.userExists(anything())).thenResolve(true)

      await expect(
        instanceUnderTest.blockHandle(handleId),
      ).resolves.not.toThrow()

      const [userIdArg] = capture(mockMatrixClientManager.userExists).first()
      expect(userIdArg).toContain(handleId)
      verify(mockMatrixClientManager.userExists(anything())).once()
      const [inputArg] = capture(mockMatrixClientManager.ignoreHandle).first()
      expect(inputArg).toStrictEqual<typeof inputArg>(
        expect.stringContaining(handleId),
      )
      verify(mockMatrixClientManager.ignoreHandle(anything())).once()
    })

    it('should throw a HandleNotFoundError if the handle to block does not exist', async () => {
      const handleId = 'testHandleId'
      when(mockMatrixClientManager.userExists(anything())).thenResolve(false)

      await expect(instanceUnderTest.blockHandle(handleId)).rejects.toThrow(
        HandleNotFoundError,
      )

      const [userIdArg] = capture(mockMatrixClientManager.userExists).first()
      expect(userIdArg).toContain(handleId)
      verify(mockMatrixClientManager.userExists(anything())).once()
    })
  })

  describe('unblockHandle', () => {
    it('calls matrixClient correctly', async () => {
      const handleId = 'testHandleId'
      when(mockMatrixClientManager.userExists(anything())).thenResolve(true)

      await expect(
        instanceUnderTest.unblockHandle(handleId),
      ).resolves.not.toThrow()

      const [userIdArg] = capture(mockMatrixClientManager.userExists).first()
      expect(userIdArg).toContain(handleId)
      verify(mockMatrixClientManager.userExists(anything())).once()
      const [inputArg] = capture(mockMatrixClientManager.unignoreHandle).first()
      expect(inputArg).toStrictEqual<typeof inputArg>(
        expect.stringContaining(handleId),
      )
      verify(mockMatrixClientManager.unignoreHandle(anything())).once()
    })

    it('should throw a HandleNotFoundError if the handle to unblock does not exist', async () => {
      const handleId = 'testHandleId'
      when(mockMatrixClientManager.userExists(anything())).thenResolve(false)

      await expect(instanceUnderTest.unblockHandle(handleId)).rejects.toThrow(
        HandleNotFoundError,
      )

      const [userIdArg] = capture(mockMatrixClientManager.userExists).first()
      expect(userIdArg).toContain(handleId)
      verify(mockMatrixClientManager.userExists(anything())).once()
    })
  })

  describe('listBlockedHandles', () => {
    it('calls matrixClient and returns result correctly', async () => {
      const handleId = 'testHandleId'
      when(mockMatrixClientManager.listIgnoredHandles()).thenResolve([handleId])

      await expect(instanceUnderTest.listBlockedHandles()).resolves.toEqual([
        handleId,
      ])

      verify(mockMatrixClientManager.listIgnoredHandles()).once()
    })
  })
})
