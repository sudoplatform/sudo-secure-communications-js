/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  MatrixClient,
  Preset,
  Room,
  RoomMember,
  Visibility,
} from 'matrix-js-sdk/lib/matrix'
import { KnownMembership } from 'matrix-js-sdk/lib/types'
import {
  anything,
  capture,
  instance,
  mock,
  reset,
  verify,
  when,
} from 'ts-mockito'
import {
  CustomMatrixEvents,
  MatrixClientManager,
} from '../../../../../src/private/data/common/matrixClientManager'
import { MatrixMediaService } from '../../../../../src/private/data/media/matrixMediaService'
import { MatrixRoomsService } from '../../../../../src/private/data/rooms/matrixRoomsService'
import { MembershipStateEntity } from '../../../../../src/private/domain/entities/common/memberEntity'
import { PowerLevelsEntity } from '../../../../../src/private/domain/entities/common/powerLevelsEntity'
import { CustomRoomType } from '../../../../../src/private/domain/entities/rooms/roomEntity'
import {
  CreateRoomInput,
  UpdateRoomInput,
} from '../../../../../src/private/domain/entities/rooms/roomsService'
import { toHandleId, toMatrixUserId } from '../../../../../src/private/util/id'
import {
  PermissionDeniedError,
  RoomNotFoundError,
  SecureCommsError,
} from '../../../../../src/public'
import { EntityDataFactory } from '../../../../data-factory/entity'

describe('MatrixRoomsService Test Suite', () => {
  const mockMatrixClient = mock<MatrixClient>()
  const mockMatrixClientManager = mock<MatrixClientManager>()
  const mockMatrixMediaService = mock<MatrixMediaService>()

  let instanceUnderTest: MatrixRoomsService

  beforeEach(() => {
    reset(mockMatrixClient)
    reset(mockMatrixClientManager)
    reset(mockMatrixMediaService)

    instanceUnderTest = new MatrixRoomsService(
      instance(mockMatrixClientManager),
      instance(mockMatrixMediaService),
    )
  })

  describe('create', () => {
    it('calls matrixClient and returns result correctly', async () => {
      const roomId = 'testRoomId'
      when(mockMatrixClientManager.createRoom(anything())).thenResolve(roomId)

      const name = 'testName'
      const description = 'testDescription'
      const input: CreateRoomInput = {
        name,
        description,
        invitedHandleIds: [],
      }
      const result = await instanceUnderTest.create(input)

      expect(result).toStrictEqual({
        roomId,
        name,
        description,
        avatarUrl: undefined,
        powerLevels: undefined,
        memberCount: 1,
      })
      const [inputArgs] = capture(mockMatrixClientManager.createRoom).first()
      expect(inputArgs).toStrictEqual<typeof inputArgs>({
        name,
        topic: description,
        is_direct: false,
        visibility: Visibility.Private,
        preset: Preset.PrivateChat,
        invite: undefined,
        power_level_content_override: undefined,
        initial_state: [
          {
            type: 'm.room.encryption',
            content: {
              algorithm: 'm.megolm.v1.aes-sha2',
            },
          },
          {
            type: CustomMatrixEvents.TYPE,
            content: {
              type: CustomRoomType.GROUP,
            },
          },
        ],
      })
      verify(mockMatrixClientManager.createRoom(anything())).once()
    })

    it('calls matrixClient and returns result correctly with power levels assigned', async () => {
      const roomId = 'testRoomId'
      when(mockMatrixClientManager.createRoom(anything())).thenResolve(roomId)

      const name = 'testName'
      const description = 'testDescription'
      const powerLevels: PowerLevelsEntity = {
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
      const input: CreateRoomInput = {
        name,
        description,
        powerLevels,
        invitedHandleIds: [],
      }
      const result = await instanceUnderTest.create(input)

      expect(result).toStrictEqual({
        roomId,
        name,
        description,
        avatarUrl: undefined,
        powerLevels: {
          users_default: 25,
          events_default: 25,
          invite: 25,
          kick: 100,
          ban: 100,
          events: {
            'm.room.name': 25,
            'm.room.topic': 25,
            'm.room.avatar': 25,
          },
          redact: undefined,
        },
        memberCount: 1,
      })
      const [inputArgs] = capture(mockMatrixClientManager.createRoom).first()
      expect(inputArgs).toStrictEqual<typeof inputArgs>({
        name,
        topic: description,
        is_direct: false,
        visibility: Visibility.Private,
        preset: Preset.PrivateChat,
        invite: undefined,
        power_level_content_override: {
          users_default: 25,
          events_default: 25,
          ban: 100,
          kick: 100,
          invite: 25,
          events: {
            'm.room.avatar': 25,
            'm.room.name': 25,
            'm.room.topic': 25,
          },
          redact: undefined,
        },
        initial_state: [
          {
            type: 'm.room.encryption',
            content: {
              algorithm: 'm.megolm.v1.aes-sha2',
            },
          },
          {
            type: CustomMatrixEvents.TYPE,
            content: {
              type: CustomRoomType.GROUP,
            },
          },
        ],
      })
      verify(mockMatrixClientManager.createRoom(anything())).once()
    })
  })

  describe('get', () => {
    it('calls matrixClient correctly and returns result correctly', async () => {
      const roomId = 'testRoomId'
      const userId = 'testUserId'
      const description = 'room description'
      const tags = ['tag-1']
      const avatarUrl = 'https://foobar.com'
      const powerLevels = EntityDataFactory.groupRoomPowerLevels
      const room = new Room(roomId, mockMatrixClient, userId)
      when(mockMatrixClientManager.getRoom(anything())).thenResolve(room)
      when(mockMatrixClientManager.getRoomTopic(anything())).thenResolve(
        description,
      )
      when(mockMatrixClientManager.getRoomAvatarUrl(anything())).thenResolve(
        avatarUrl,
      )
      when(mockMatrixClientManager.getRoomPowerLevels(anything())).thenResolve(
        powerLevels,
      )
      when(mockMatrixClientManager.getRoomType(anything())).thenResolve(
        CustomRoomType.GROUP,
      )
      when(mockMatrixClientManager.getRoomTags(anything())).thenResolve(tags)

      const result = await instanceUnderTest.get(roomId)

      expect(result).toStrictEqual({
        roomId,
        name: 'testRoomId',
        type: CustomRoomType.GROUP,
        description,
        tags,
        avatarUrl,
        powerLevels,
        memberCount: 0,
      })
      const [inputArgs] = capture(mockMatrixClientManager.getRoom).first()
      expect(inputArgs).toStrictEqual<typeof inputArgs>(roomId)
      verify(mockMatrixClientManager.getRoom(anything())).once()
      verify(mockMatrixClientManager.getRoomTopic(anything())).once()
      verify(mockMatrixClientManager.getRoomAvatarUrl(anything())).once()
      verify(mockMatrixClientManager.getRoomPowerLevels(anything())).once()
      verify(mockMatrixClientManager.getRoomType(anything())).once()
      verify(mockMatrixClientManager.getRoomTags(anything())).once()
    })

    it('calls matrixClient correctly with undefined result', async () => {
      const roomId = 'testRoomId'
      when(mockMatrixClientManager.getRoom(anything())).thenResolve(undefined)

      const result = await instanceUnderTest.get(roomId)

      expect(result).toStrictEqual(undefined)
      const [inputArgs] = capture(mockMatrixClientManager.getRoom).first()
      expect(inputArgs).toStrictEqual<typeof inputArgs>(roomId)
      verify(mockMatrixClientManager.getRoom(anything())).once()
    })
  })

  describe('update', () => {
    it('calls matrixClient correctly and returns result correctly when updating only room name', async () => {
      const roomId = 'testRoomId'
      const userId = 'testUserId'
      const updatedName = 'updatedName'
      const description = 'room description'
      const avatarUrl = 'https://foobar.com'
      const powerLevels = EntityDataFactory.groupRoomPowerLevels
      const room = new Room(roomId, mockMatrixClient, userId)
      when(mockMatrixClientManager.getRoom(anything())).thenResolve(room)
      when(mockMatrixClientManager.getRoomTopic(anything())).thenResolve(
        description,
      )
      when(mockMatrixClientManager.getRoomAvatarUrl(anything())).thenResolve(
        avatarUrl,
      )
      when(mockMatrixClientManager.getRoomPowerLevels(anything())).thenResolve(
        powerLevels,
      )
      when(mockMatrixClientManager.getRoomType(anything())).thenResolve(
        CustomRoomType.GROUP,
      )

      const input: UpdateRoomInput = {
        roomId,
        name: { value: updatedName },
      }
      const result = await instanceUnderTest.update(input)

      expect(result).toStrictEqual({
        roomId,
        name: updatedName,
        description,
        avatarUrl,
        powerLevels,
        memberCount: 0,
      })
      const [inputArgs] = capture(mockMatrixClientManager.getRoom).first()
      expect(inputArgs).toStrictEqual<typeof inputArgs>(roomId)
      verify(mockMatrixClientManager.getRoom(anything())).once()
      verify(mockMatrixClientManager.getRoomTopic(anything())).once()
      verify(mockMatrixClientManager.getRoomAvatarUrl(anything())).once()
      verify(mockMatrixClientManager.getRoomPowerLevels(anything())).once()
      verify(mockMatrixClientManager.getRoomType(anything())).once()
      const [inputSetNameIdArg, inputSetNameArg] = capture(
        mockMatrixClientManager.setRoomName,
      ).first()
      expect(inputSetNameIdArg).toStrictEqual<typeof inputSetNameIdArg>(roomId)
      expect(inputSetNameArg).toStrictEqual<typeof inputSetNameArg>(updatedName)
      verify(mockMatrixClientManager.setRoomName(anything(), anything())).once()
      verify(
        mockMatrixClientManager.setRoomTopic(anything(), anything()),
      ).never()
      verify(mockMatrixMediaService.uploadMediaFile(anything())).never()
      verify(
        mockMatrixClientManager.setRoomPowerLevels(anything(), anything()),
      ).never()
    })

    it('calls matrixClient correctly and returns result correctly when updating only room description', async () => {
      const roomId = 'testRoomId'
      const userId = 'testUserId'
      const updatedDescription = 'updatedDescription'
      const avatarUrl = 'https://foobar.com'
      const powerLevels = EntityDataFactory.groupRoomPowerLevels
      const room = new Room(roomId, mockMatrixClient, userId)
      when(mockMatrixClientManager.getRoom(anything())).thenResolve(room)
      when(mockMatrixClientManager.getRoomAvatarUrl(anything())).thenResolve(
        avatarUrl,
      )
      when(mockMatrixClientManager.getRoomPowerLevels(anything())).thenResolve(
        powerLevels,
      )
      when(mockMatrixClientManager.getRoomType(anything())).thenResolve(
        CustomRoomType.GROUP,
      )

      const input: UpdateRoomInput = {
        roomId,
        description: { value: updatedDescription },
      }
      const result = await instanceUnderTest.update(input)

      expect(result).toStrictEqual({
        roomId,
        name: roomId,
        description: updatedDescription,
        avatarUrl,
        powerLevels,
        memberCount: 0,
      })
      const [inputArgs] = capture(mockMatrixClientManager.getRoom).first()
      expect(inputArgs).toStrictEqual<typeof inputArgs>(roomId)
      verify(mockMatrixClientManager.getRoom(anything())).once()
      const [inputSetTopicIdArg, inputSetTopicArg] = capture(
        mockMatrixClientManager.setRoomTopic,
      ).first()
      expect(inputSetTopicIdArg).toStrictEqual<typeof inputSetTopicIdArg>(
        roomId,
      )
      expect(inputSetTopicArg).toStrictEqual<typeof inputSetTopicArg>(
        updatedDescription,
      )
      verify(
        mockMatrixClientManager.setRoomTopic(anything(), anything()),
      ).once()
      verify(
        mockMatrixClientManager.setRoomName(anything(), anything()),
      ).never()
      verify(mockMatrixMediaService.uploadMediaFile(anything())).never()
      verify(
        mockMatrixClientManager.setRoomPowerLevels(anything(), anything()),
      ).never()
    })

    it('calls matrixClient correctly and returns result correctly when updating room name and description', async () => {
      const roomId = 'testRoomId'
      const userId = 'testUserId'
      const updatedName = 'updatedName'
      const updatedDescription = 'updatedDescription'
      const avatarUrl = 'https://foobar.com'
      const powerLevels = EntityDataFactory.groupRoomPowerLevels
      const room = new Room(roomId, mockMatrixClient, userId)
      when(mockMatrixClientManager.getRoom(anything())).thenResolve(room)
      when(mockMatrixClientManager.getRoomAvatarUrl(anything())).thenResolve(
        avatarUrl,
      )
      when(mockMatrixClientManager.getRoomPowerLevels(anything())).thenResolve(
        powerLevels,
      )
      when(mockMatrixClientManager.getRoomType(anything())).thenResolve(
        CustomRoomType.GROUP,
      )

      const input: UpdateRoomInput = {
        roomId,
        name: { value: updatedName },
        description: { value: updatedDescription },
      }
      const result = await instanceUnderTest.update(input)

      expect(result).toStrictEqual({
        roomId,
        name: updatedName,
        description: updatedDescription,
        avatarUrl,
        powerLevels,
        memberCount: 0,
      })
      const [inputArgs] = capture(mockMatrixClientManager.getRoom).first()
      expect(inputArgs).toStrictEqual<typeof inputArgs>(roomId)
      verify(mockMatrixClientManager.getRoom(anything())).once()
      const [inputSetNameIdArg, inputSetNameArg] = capture(
        mockMatrixClientManager.setRoomName,
      ).first()
      expect(inputSetNameIdArg).toStrictEqual<typeof inputSetNameIdArg>(roomId)
      expect(inputSetNameArg).toStrictEqual<typeof inputSetNameArg>(updatedName)
      verify(mockMatrixClientManager.setRoomName(anything(), anything())).once()
      const [inputSetTopicIdArg, inputSetTopicArg] = capture(
        mockMatrixClientManager.setRoomTopic,
      ).first()
      expect(inputSetTopicIdArg).toStrictEqual<typeof inputSetTopicIdArg>(
        roomId,
      )
      expect(inputSetTopicArg).toStrictEqual<typeof inputSetTopicArg>(
        updatedDescription,
      )
      verify(
        mockMatrixClientManager.setRoomTopic(anything(), anything()),
      ).once()
      verify(mockMatrixMediaService.uploadMediaFile(anything())).never()
      verify(
        mockMatrixClientManager.setRoomPowerLevels(anything(), anything()),
      ).never()
    })

    it('calls matrixClient correctly and returns result correctly when updating only avatar', async () => {
      const roomId = 'testRoomId'
      const userId = 'testUserId'
      const mediaCredential = EntityDataFactory.mediaCredential
      const updatedAvatar = {
        file: new ArrayBuffer(0),
        fileName: 'fileName',
        fileType: 'fileType',
        mediaCredential,
      }
      const avatarUrl = 'mxc:foo.bar'
      const description = 'room description'
      const powerLevels = EntityDataFactory.groupRoomPowerLevels
      const room = new Room(roomId, mockMatrixClient, userId)
      when(mockMatrixClientManager.getRoom(anything())).thenResolve(room)
      when(mockMatrixClientManager.getRoomTopic(anything())).thenResolve(
        description,
      )
      when(mockMatrixClientManager.getRoomAvatarUrl(anything())).thenResolve(
        avatarUrl,
      )
      when(mockMatrixClientManager.getRoomPowerLevels(anything())).thenResolve(
        powerLevels,
      )
      when(mockMatrixClientManager.getRoomType(anything())).thenResolve(
        CustomRoomType.GROUP,
      )

      const input: UpdateRoomInput = {
        roomId,
        avatar: { value: { ...updatedAvatar } },
        isVisible: { value: true },
      }
      const result = await instanceUnderTest.update(input)

      expect(result).toStrictEqual({
        roomId,
        name: roomId,
        description,
        avatarUrl,
        powerLevels,
        memberCount: 0,
      })
      const [inputArgs] = capture(mockMatrixClientManager.getRoom).first()
      verify(mockMatrixClientManager.getRoomTopic(anything())).once()
      verify(mockMatrixClientManager.getRoomAvatarUrl(anything())).once()
      verify(mockMatrixClientManager.getRoomPowerLevels(anything())).once()
      verify(mockMatrixClientManager.getRoomType(anything())).once()
      expect(inputArgs).toStrictEqual<typeof inputArgs>(roomId)
      verify(mockMatrixClientManager.getRoom(anything())).once()
      const [uploadMediaInput] = capture(
        mockMatrixMediaService.uploadMediaFile,
      ).first()
      expect(uploadMediaInput).toStrictEqual<typeof uploadMediaInput>({
        file: updatedAvatar.file,
        fileName: updatedAvatar.fileName,
        fileType: updatedAvatar.fileType,
        mediaCredential,
      })
      verify(mockMatrixMediaService.uploadMediaFile(anything())).once()
      verify(
        mockMatrixClientManager.setRoomName(anything(), anything()),
      ).never()
      verify(
        mockMatrixClientManager.setRoomTopic(anything(), anything()),
      ).never()
      verify(
        mockMatrixClientManager.setRoomPowerLevels(anything(), anything()),
      ).never()
    })

    it('should throw a SecureCommsError when matrixMediaService is not available when attempting to update avatar', async () => {
      const instanceUnderTest = new MatrixRoomsService(
        instance(mockMatrixClientManager),
      )
      const roomId = 'testRoomId'
      const userId = 'testUserId'
      const mediaCredential = EntityDataFactory.mediaCredential
      const updatedAvatar = {
        file: new ArrayBuffer(0),
        fileName: 'fileName',
        fileType: 'fileType',
        mediaCredential,
      }
      const avatarUrl = 'mxc:foo.bar'
      const description = 'room description'
      const powerLevels = EntityDataFactory.groupRoomPowerLevels
      const room = new Room(roomId, mockMatrixClient, userId)
      when(mockMatrixClientManager.getRoom(anything())).thenResolve(room)
      when(mockMatrixClientManager.getRoomTopic(anything())).thenResolve(
        description,
      )
      when(mockMatrixClientManager.getRoomAvatarUrl(anything())).thenResolve(
        avatarUrl,
      )
      when(mockMatrixClientManager.getRoomPowerLevels(anything())).thenResolve(
        powerLevels,
      )
      when(mockMatrixClientManager.getRoomType(anything())).thenResolve(
        CustomRoomType.GROUP,
      )

      const input: UpdateRoomInput = {
        roomId,
        avatar: { value: { ...updatedAvatar } },
        isVisible: { value: true },
      }
      await expect(instanceUnderTest.update(input)).rejects.toThrow(
        SecureCommsError,
      )

      const [inputArgs] = capture(mockMatrixClientManager.getRoom).first()
      verify(mockMatrixClientManager.getRoomTopic(anything())).once()
      verify(mockMatrixClientManager.getRoomAvatarUrl(anything())).once()
      verify(mockMatrixClientManager.getRoomPowerLevels(anything())).once()
      verify(mockMatrixClientManager.getRoomType(anything())).once()
      expect(inputArgs).toStrictEqual<typeof inputArgs>(roomId)
      verify(mockMatrixClientManager.getRoom(anything())).once()
      verify(
        mockMatrixClientManager.setRoomName(anything(), anything()),
      ).never()
      verify(
        mockMatrixClientManager.setRoomTopic(anything(), anything()),
      ).never()
      verify(mockMatrixMediaService.uploadMediaFile(anything())).never()
      verify(
        mockMatrixClientManager.setRoomPowerLevels(anything(), anything()),
      ).never()
    })

    it('calls matrixClient correctly and returns result correctly when updating only room power levels', async () => {
      const roomId = 'testRoomId'
      const userId = 'testUserId'
      const avatarUrl = 'mxc:foo.bar'
      const description = 'room description'
      const powerLevels = EntityDataFactory.groupRoomPowerLevels
      const updatedRoomPowerLevels = { ...powerLevels, users_default: 100 }
      const room = new Room(roomId, mockMatrixClient, userId)
      when(mockMatrixClientManager.getRoom(anything())).thenResolve(room)
      when(mockMatrixClientManager.getRoomTopic(anything())).thenResolve(
        description,
      )
      when(mockMatrixClientManager.getRoomAvatarUrl(anything())).thenResolve(
        avatarUrl,
      )
      when(mockMatrixClientManager.getRoomPowerLevels(anything())).thenResolve(
        powerLevels,
      )
      when(mockMatrixClientManager.getRoomType(anything())).thenResolve(
        CustomRoomType.GROUP,
      )

      const input: UpdateRoomInput = {
        roomId,
        powerLevels: { value: { ...updatedRoomPowerLevels } },
        isVisible: { value: true },
      }
      const result = await instanceUnderTest.update(input)

      expect(result).toStrictEqual({
        roomId,
        name: roomId,
        description,
        avatarUrl,
        powerLevels: updatedRoomPowerLevels,
        memberCount: 0,
      })
      const [inputArgs] = capture(mockMatrixClientManager.getRoom).first()
      verify(mockMatrixClientManager.getRoomTopic(anything())).once()
      verify(mockMatrixClientManager.getRoomAvatarUrl(anything())).once()
      verify(mockMatrixClientManager.getRoomPowerLevels(anything())).once()
      verify(mockMatrixClientManager.getRoomType(anything())).once()
      expect(inputArgs).toStrictEqual<typeof inputArgs>(roomId)
      verify(mockMatrixClientManager.getRoom(anything())).once()
      const [inputRoomIdArg, inputRoomPowerLevelsArg] = capture(
        mockMatrixClientManager.setRoomPowerLevels,
      ).first()
      expect(inputRoomIdArg).toStrictEqual<typeof inputRoomIdArg>(roomId)
      expect(inputRoomPowerLevelsArg).toStrictEqual<
        typeof inputRoomPowerLevelsArg
      >(updatedRoomPowerLevels)
      verify(
        mockMatrixClientManager.setRoomPowerLevels(anything(), anything()),
      ).once()
      verify(
        mockMatrixClientManager.setRoomName(anything(), anything()),
      ).never()
      verify(
        mockMatrixClientManager.setRoomTopic(anything(), anything()),
      ).never()
      verify(mockMatrixMediaService.uploadMediaFile(anything())).never()
    })

    it('should throw a RoomNotFoundError for an undefined matrix room', async () => {
      const roomId = 'testRoomId'
      const input: UpdateRoomInput = {
        roomId,
        name: { value: 'updatedName' },
      }
      when(mockMatrixClientManager.getRoom(anything())).thenResolve(undefined)

      await expect(instanceUnderTest.update(input)).rejects.toThrow(
        RoomNotFoundError,
      )
    })
  })

  describe('list', () => {
    it('calls matrixClient correctly and returns a single result correctly', async () => {
      const roomId = 'testRoomId'
      const userId = 'testUserId'
      const description = 'room description'
      const tags = ['tag-1']
      const avatarUrl = 'https://foobar.com'
      const powerLevels = EntityDataFactory.groupRoomPowerLevels
      const room = new Room(roomId, mockMatrixClient, userId)
      when(mockMatrixClientManager.getRoom(anything())).thenResolve(room)
      when(mockMatrixClientManager.getRoomTopic(anything())).thenResolve(
        description,
      )
      when(mockMatrixClientManager.getRoomAvatarUrl(anything())).thenResolve(
        avatarUrl,
      )
      when(mockMatrixClientManager.getRoomPowerLevels(anything())).thenResolve(
        powerLevels,
      )
      when(mockMatrixClientManager.getRoomType(anything())).thenResolve(
        CustomRoomType.GROUP,
      )
      when(mockMatrixClientManager.getRoomTags(anything())).thenResolve(tags)

      const result = await instanceUnderTest.list([roomId])

      expect(result).toStrictEqual([
        {
          roomId,
          name: 'testRoomId',
          type: CustomRoomType.GROUP,
          description,
          tags,
          avatarUrl,
          powerLevels,
          memberCount: 0,
        },
      ])
      const [inputArgs] = capture(mockMatrixClientManager.getRoom).first()
      expect(inputArgs).toStrictEqual<typeof inputArgs>(roomId)
      verify(mockMatrixClientManager.getRoom(anything())).once()
      verify(mockMatrixClientManager.getRoomTopic(anything())).once()
      verify(mockMatrixClientManager.getRoomAvatarUrl(anything())).once()
      verify(mockMatrixClientManager.getRoomPowerLevels(anything())).once()
      verify(mockMatrixClientManager.getRoomType(anything())).once()
      verify(mockMatrixClientManager.getRoomTags(anything())).once()
    })

    it('calls matrixClient correctly and returns multiple results correctly', async () => {
      const roomId = 'testRoomId'
      const roomId2 = 'testRoomId2'
      const userId = 'testUserId'
      const description = 'room description'
      const tags = ['tag-1']
      const avatarUrl = 'https://foobar.com'
      const powerLevels = EntityDataFactory.groupRoomPowerLevels
      const room = new Room(roomId, mockMatrixClient, userId)
      when(mockMatrixClientManager.getRoom(anything())).thenResolve(room)
      when(mockMatrixClientManager.getRoomTopic(anything())).thenResolve(
        description,
      )
      when(mockMatrixClientManager.getRoomAvatarUrl(anything())).thenResolve(
        avatarUrl,
      )
      when(mockMatrixClientManager.getRoomPowerLevels(anything())).thenResolve(
        powerLevels,
      )
      when(mockMatrixClientManager.getRoomType(anything())).thenResolve(
        CustomRoomType.GROUP,
      )
      when(mockMatrixClientManager.getRoomTags(anything())).thenResolve(tags)

      const result = await instanceUnderTest.list([roomId, roomId2])

      expect(result).toStrictEqual([
        {
          roomId,
          name: 'testRoomId',
          type: CustomRoomType.GROUP,
          description,
          tags,
          avatarUrl,
          powerLevels,
          memberCount: 0,
        },
        {
          roomId,
          name: 'testRoomId',
          type: CustomRoomType.GROUP,
          description,
          tags,
          avatarUrl,
          powerLevels,
          memberCount: 0,
        },
      ])
      const [inputArgs] = capture(mockMatrixClientManager.getRoom).first()
      expect(inputArgs).toStrictEqual<typeof inputArgs>(roomId)
      verify(mockMatrixClientManager.getRoom(anything())).twice()
      verify(mockMatrixClientManager.getRoomTopic(anything())).twice()
      verify(mockMatrixClientManager.getRoomAvatarUrl(anything())).twice()
      verify(mockMatrixClientManager.getRoomPowerLevels(anything())).twice()
      verify(mockMatrixClientManager.getRoomType(anything())).twice()
      verify(mockMatrixClientManager.getRoomTags(anything())).twice()
    })

    it('calls matrixClient correctly and returns an empty result correctly', async () => {
      const roomId = 'testRoomId'
      when(mockMatrixClientManager.getRoom(anything())).thenResolve(undefined)

      const result = await instanceUnderTest.list([roomId])

      expect(result).toStrictEqual([])
      const [inputArgs] = capture(mockMatrixClientManager.getRoom).first()
      expect(inputArgs).toStrictEqual<typeof inputArgs>(roomId)
      verify(mockMatrixClientManager.getRoom(anything())).once()
    })
  })

  describe('getMembers', () => {
    it('calls matrixClient and returns result correctly', async () => {
      const roomId = 'testRoomId'
      const member = {
        userId: 'testUserId',
        membership: KnownMembership.Join,
        powerLevel: 100,
      } as RoomMember
      when(mockMatrixClientManager.getMembers(anything())).thenResolve([member])
      when(mockMatrixClientManager.getRoomPowerLevels(anything())).thenResolve({
        users: {
          [member.userId]: member.powerLevel,
        },
      })

      const result = await instanceUnderTest.getMembers(roomId)

      expect(result).toStrictEqual([
        {
          handle: { handleId: toHandleId(member.userId), name: '' },
          membership: MembershipStateEntity.JOINED,
          powerLevel: member.powerLevel,
        },
      ])
      const [roomIdArg] = capture(mockMatrixClientManager.getMembers).first()
      expect(roomIdArg).toStrictEqual<typeof roomIdArg>(roomId)
      verify(mockMatrixClientManager.getMembers(anything())).once()
    })

    it('should throw a RoomNotFoundError for an undefined matrix room when retrieving members', async () => {
      const roomId = 'testRoomId'
      when(mockMatrixClientManager.getMembers(anything())).thenResolve(
        undefined,
      )

      await expect(instanceUnderTest.getMembers(roomId)).rejects.toThrow(
        RoomNotFoundError,
      )
    })

    it('should throw a RoomNotFoundError for an undefined matrix room when retrieving power levels', async () => {
      const roomId = 'testRoomId'
      const member = {
        userId: 'testUserId',
        membership: KnownMembership.Join,
        powerLevel: 100,
      } as RoomMember
      when(mockMatrixClientManager.getMembers(anything())).thenResolve([member])
      when(mockMatrixClientManager.getRoomPowerLevels(anything())).thenResolve(
        undefined,
      )

      await expect(instanceUnderTest.getMembers(roomId)).rejects.toThrow(
        RoomNotFoundError,
      )
    })
  })

  describe('join', () => {
    it('calls matrixClient correctly', async () => {
      const roomId = 'testRoomId'
      const userId = 'testUserId'
      const room = new Room(roomId, mockMatrixClient, userId)
      when(mockMatrixClientManager.getRoom(anything())).thenResolve(room)

      await expect(instanceUnderTest.join(roomId)).resolves.not.toThrow()

      const [joinRoomIdArg] = capture(mockMatrixClientManager.joinRoom).first()
      expect(joinRoomIdArg).toStrictEqual<typeof joinRoomIdArg>(room.roomId)
      verify(mockMatrixClientManager.joinRoom(anything())).once()
    })
  })

  describe('leave', () => {
    it('calls matrixClient correctly', async () => {
      const roomId = 'testRoomId'

      await expect(instanceUnderTest.leave(roomId)).resolves.not.toThrow()

      const [leaveRoomIdArg] = capture(
        mockMatrixClientManager.leaveRoom,
      ).first()
      expect(leaveRoomIdArg).toStrictEqual<typeof leaveRoomIdArg>(roomId)
      verify(mockMatrixClientManager.leaveRoom(anything())).once()
    })
  })

  describe('sendInvitations', () => {
    it('calls matrixClient correctly', async () => {
      const roomId = 'testRoomId'
      const userId = 'testUserId'
      const targetHandleId = 'targetHandleId'
      const room = new Room(roomId, mockMatrixClient, userId)
      when(mockMatrixClientManager.getRoom(anything())).thenResolve(room)

      await expect(
        instanceUnderTest.sendInvitations({
          roomId,
          targetHandleIds: [targetHandleId],
        }),
      ).resolves.not.toThrow()

      const [roomIdArg] = capture(mockMatrixClientManager.getRoom).first()
      expect(roomIdArg).toStrictEqual<typeof roomIdArg>(roomId)
      verify(mockMatrixClientManager.getRoom(anything())).once()
      const [inviteIdArg, userIdArg] = capture(
        mockMatrixClientManager.invite,
      ).first()
      expect(inviteIdArg).toStrictEqual<typeof inviteIdArg>(room.roomId)
      expect(userIdArg).toStrictEqual<typeof userIdArg>(
        expect.stringContaining(targetHandleId),
      )
      verify(mockMatrixClientManager.invite(anything(), anything())).once()
    })

    it('should throw a RoomNotFoundError for an undefined matrix room', async () => {
      const roomId = 'testRoomId'
      const targetHandleId = 'targetHandleId'
      when(mockMatrixClientManager.getRoom(anything())).thenResolve(undefined)

      await expect(
        instanceUnderTest.sendInvitations({
          roomId,
          targetHandleIds: [targetHandleId],
        }),
      ).rejects.toThrow(RoomNotFoundError)
    })
  })

  describe('knockRoom', () => {
    it('calls matrixClient correctly', async () => {
      const roomId = 'testRoomId'
      const reason = 'some reason'

      await expect(
        instanceUnderTest.knockRoom({
          roomId,
          reason,
        }),
      ).resolves.not.toThrow()
      verify(mockMatrixClientManager.knockRoom(anything(), anything())).once()
    })
  })

  describe('listInvitedRooms', () => {
    it('calls matrixClient correctly', async () => {
      const roomId = 'testRoomId'
      const userId = 'testUserId'
      const room = new Room(roomId, mockMatrixClient, userId)
      when(mockMatrixClientManager.listRooms()).thenResolve([room])

      await expect(instanceUnderTest.listInvitedRooms()).resolves.toEqual([])
      verify(mockMatrixClientManager.listRooms()).once()
    })
  })

  describe('listJoinedRoomIds', () => {
    it('calls matrixClient correctly', async () => {
      const roomId = 'testRoomId'
      const userId = 'testUserId'
      when(mockMatrixClientManager.listJoinedRooms()).thenResolve([roomId])

      await expect(instanceUnderTest.listJoinedRoomIds()).resolves.toEqual([
        roomId,
      ])

      verify(mockMatrixClientManager.listJoinedRooms()).once()
    })
  })

  describe('listKnockedRooms', () => {
    it('calls matrixClient and returns result correctly', async () => {
      const roomId = 'testRoomId'
      const userId = 'testUserId'
      const room = new Room(roomId, mockMatrixClient, userId)
      when(mockMatrixClientManager.listRooms()).thenResolve([room])

      await expect(instanceUnderTest.listKnockedRooms()).resolves.toEqual([])
      verify(mockMatrixClientManager.listRooms()).once()
    })
  })

  describe('listKnockRequests', () => {
    it('calls matrixClient and returns result correctly', async () => {
      const roomId = 'testRoomId'
      const userId = 'testUserId'
      const room = new Room(roomId, mockMatrixClient, userId)
      when(mockMatrixClientManager.getRoom(anything())).thenResolve(room)

      await expect(
        instanceUnderTest.listKnockRequests(roomId),
      ).resolves.toEqual([])
      verify(mockMatrixClientManager.getRoom(anything())).once()
    })

    it('should throw a RoomNotFoundError for an undefined matrix room', async () => {
      const roomId = 'testRoomId'
      when(mockMatrixClientManager.getRoom(anything())).thenResolve(undefined)

      await expect(instanceUnderTest.listKnockRequests(roomId)).rejects.toThrow(
        RoomNotFoundError,
      )
    })
  })

  describe('getMembershipState', () => {
    it('calls matrixClient and returns result correctly', async () => {
      const roomId = 'testRoomId'
      const userId = 'testUserId'
      const homeServer = 'testHomeServer'
      when(
        mockMatrixClientManager.getMembershipState(anything(), anything()),
      ).thenResolve(KnownMembership.Leave)
      when(mockMatrixClientManager.homeServer).thenReturn(homeServer)

      const result = await instanceUnderTest.getMembershipState({
        roomId,
        handleId: userId,
      })

      expect(result).toStrictEqual(MembershipStateEntity.LEFT)
      const [roomIdArg, userIdArg] = capture(
        mockMatrixClientManager.getMembershipState,
      ).first()
      expect(roomIdArg).toStrictEqual<typeof roomIdArg>(roomId)
      expect(userIdArg).toStrictEqual<typeof userIdArg>(
        toMatrixUserId(userId, homeServer),
      )
      verify(
        mockMatrixClientManager.getMembershipState(anything(), anything()),
      ).once()
    })

    it('calls matrixClient correctly with undefined result for an undefined matrix room', async () => {
      const roomId = 'testRoomId'
      const userId = 'testUserId'
      const homeServer = 'testHomeServer'
      when(
        mockMatrixClientManager.getMembershipState(anything(), anything()),
      ).thenResolve(undefined)
      when(mockMatrixClientManager.homeServer).thenReturn(homeServer)

      const result = await instanceUnderTest.getMembershipState({
        roomId,
        handleId: userId,
      })

      expect(result).toStrictEqual(undefined)
      const [roomIdArg, userIdArg] = capture(
        mockMatrixClientManager.getMembershipState,
      ).first()
      expect(roomIdArg).toStrictEqual<typeof roomIdArg>(roomId)
      expect(userIdArg).toStrictEqual<typeof userIdArg>(
        toMatrixUserId(userId, homeServer),
      )
      verify(
        mockMatrixClientManager.getMembershipState(anything(), anything()),
      ).once()
    })
  })

  describe('updateRoomMemberPowerLevel', () => {
    it('should throw a PermissionDeniedError when not permitted to update member role', async () => {
      const roomId = 'testRoomId'
      const userId = 'testUserId'
      const targetHandleId = 'targetHandleId'
      const room = new Room(roomId, mockMatrixClient, userId)
      when(mockMatrixClientManager.getUserId()).thenResolve(userId)
      when(mockMatrixClientManager.getRoom(anything())).thenResolve(room)

      await expect(
        instanceUnderTest.updateRoomMemberPowerLevel({
          roomId,
          targetHandleId,
          powerLevel: 100,
        }),
      ).rejects.toThrow(PermissionDeniedError)

      verify(mockMatrixClientManager.getUserId()).once()
      const [roomIdArg] = capture(mockMatrixClientManager.getRoom).first()
      expect(roomIdArg).toStrictEqual<typeof roomIdArg>(roomId)
      verify(mockMatrixClientManager.getRoom(anything())).once()
    })

    it('should throw a RoomNotFoundError for an undefined matrix room', async () => {
      const userId = 'testUserId'
      const roomId = 'testRoomId'
      const targetHandleId = 'targetHandleId'
      when(mockMatrixClientManager.getUserId()).thenResolve(userId)
      when(mockMatrixClientManager.getRoom(anything())).thenResolve(undefined)

      await expect(
        instanceUnderTest.updateRoomMemberPowerLevel({
          roomId,
          targetHandleId,
          powerLevel: 100,
        }),
      ).rejects.toThrow(RoomNotFoundError)
      verify(mockMatrixClientManager.getUserId()).once()
    })
  })

  describe('kickHandle', () => {
    it('should throw a PermissionDeniedError when not permitted to kick member', async () => {
      const roomId = 'testRoomId'
      const userId = 'testUserId'
      const targetHandleId = 'testTargetHandleId'
      const room = new Room(roomId, mockMatrixClient, userId)
      when(mockMatrixClientManager.getRoom(anything())).thenResolve(room)

      await expect(
        instanceUnderTest.kickHandle({ roomId, targetHandleId }),
      ).rejects.toThrow(PermissionDeniedError)

      const [roomIdArg] = capture(mockMatrixClientManager.getRoom).first()
      expect(roomIdArg).toStrictEqual<typeof roomIdArg>(roomId)
      verify(mockMatrixClientManager.getRoom(anything())).once()
    })

    it('should throw a RoomNotFoundError for an undefined matrix room', async () => {
      const roomId = 'testRoomId'
      const targetHandleId = 'testTargetHandleId'
      when(mockMatrixClientManager.getRoom(anything())).thenResolve(undefined)

      await expect(
        instanceUnderTest.kickHandle({ roomId, targetHandleId }),
      ).rejects.toThrow(RoomNotFoundError)
    })
  })

  describe('banHandle', () => {
    it('should throw a PermissionDeniedError when not permitted to ban member', async () => {
      const roomId = 'testRoomId'
      const userId = 'testUserId'
      const targetHandleId = 'testTargetHandleId'
      const room = new Room(roomId, mockMatrixClient, userId)
      when(mockMatrixClientManager.getRoom(anything())).thenResolve(room)

      await expect(
        instanceUnderTest.banHandle({ roomId, targetHandleId }),
      ).rejects.toThrow(PermissionDeniedError)

      const [roomIdArg] = capture(mockMatrixClientManager.getRoom).first()
      expect(roomIdArg).toStrictEqual<typeof roomIdArg>(roomId)
      verify(mockMatrixClientManager.getRoom(anything())).once()
    })

    it('should throw a RoomNotFoundError for an undefined matrix room', async () => {
      const roomId = 'testRoomId'
      const targetHandleId = 'testTargetHandleId'
      when(mockMatrixClientManager.getRoom(anything())).thenResolve(undefined)

      await expect(
        instanceUnderTest.banHandle({ roomId, targetHandleId }),
      ).rejects.toThrow(RoomNotFoundError)
    })
  })

  describe('unbanHandle', () => {
    it('should throw a PermissionDeniedError when not permitted to unban member', async () => {
      const roomId = 'testRoomId'
      const userId = 'testUserId'
      const targetHandleId = 'testTargetHandleId'
      const room = new Room(roomId, mockMatrixClient, userId)
      when(mockMatrixClientManager.getRoom(anything())).thenResolve(room)

      await expect(
        instanceUnderTest.unbanHandle({ roomId, targetHandleId }),
      ).rejects.toThrow(PermissionDeniedError)

      const [roomIdArg] = capture(mockMatrixClientManager.getRoom).first()
      expect(roomIdArg).toStrictEqual<typeof roomIdArg>(roomId)
      verify(mockMatrixClientManager.getRoom(anything())).once()
    })

    it('should throw a RoomNotFoundError for an undefined matrix room', async () => {
      const roomId = 'testRoomId'
      const targetHandleId = 'testTargetHandleId'
      when(mockMatrixClientManager.getRoom(anything())).thenResolve(undefined)

      await expect(
        instanceUnderTest.unbanHandle({ roomId, targetHandleId }),
      ).rejects.toThrow(RoomNotFoundError)
    })
  })
})
