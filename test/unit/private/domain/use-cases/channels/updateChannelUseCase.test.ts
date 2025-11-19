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
import { MatrixClientManager } from '../../../../../../src/private/data/common/matrixClientManager'
import { MediaCredentialManager } from '../../../../../../src/private/data/media/mediaCredentialManager'
import { MatrixRoomsService } from '../../../../../../src/private/data/rooms/matrixRoomsService'
import { SessionManager } from '../../../../../../src/private/data/session/sessionManager'
import { ChannelRoleEntity } from '../../../../../../src/private/domain/entities/channels/channelEntity'
import { ChannelsService } from '../../../../../../src/private/domain/entities/channels/channelsService'
import { PublicMediaType } from '../../../../../../src/private/domain/entities/media/mediaCredentialEntity'
import { WordValidationService } from '../../../../../../src/private/domain/entities/wordValidation/wordValidationService'
import { UpdateChannelUseCase } from '../../../../../../src/private/domain/use-cases/channels/updateChannelUseCase'
import {
  ChannelId,
  HandleId,
  UnacceptableWordsError,
} from '../../../../../../src/public'
import { EntityDataFactory } from '../../../../../data-factory/entity'

jest.mock('../../../../../../src/private/data/rooms/matrixRoomsService')

describe('UpdateChannelUseCase Test Suite', () => {
  const mockChannelsService = mock<ChannelsService>()
  const mockWordValidationService = mock<WordValidationService>()
  const mockSessionManager = mock<SessionManager>()
  const mockMediaCredentialManager = mock<MediaCredentialManager>()

  const mockMatrixClient = {
    getRoomPowerLevels: jest.fn().mockResolvedValue({
      users: {},
    }),
    setRoomPowerLevels: jest.fn().mockResolvedValue(undefined),
    getMembers: jest.fn().mockResolvedValue([]),
  } as Partial<MatrixClientManager> as MatrixClientManager

  let instanceUnderTest: UpdateChannelUseCase

  beforeEach(() => {
    reset(mockSessionManager)
    reset(mockChannelsService)
    reset(mockWordValidationService)
    reset(mockMediaCredentialManager)

    Object.defineProperty(mockMatrixClient, 'homeServer', {
      value: 'testHomeServer.com',
      configurable: true,
    })

    instanceUnderTest = new UpdateChannelUseCase(
      instance(mockChannelsService),
      instance(mockWordValidationService),
      instance(mockSessionManager),
      instance(mockMediaCredentialManager),
    )
  })

  describe('execute', () => {
    it('Updates a channel successfully', async () => {
      const channelId = new ChannelId('testChannelId')
      const handleId = new HandleId('selfHandleId')
      const name = 'updatedName'
      const validWords = new Set([name])
      when(mockWordValidationService.checkWordValidity(anything())).thenResolve(
        validWords,
      )
      when(mockChannelsService.update(anything())).thenResolve({
        ...EntityDataFactory.channel,
        name,
      })
      when(mockSessionManager.getMatrixClient(anything())).thenResolve(
        mockMatrixClient,
      )

      const result = await instanceUnderTest.execute({
        handleId,
        channelId,
        name: { value: name },
      })

      expect(result).toStrictEqual({ ...EntityDataFactory.channel, name })
      const [validateArgs] = capture(
        mockWordValidationService.checkWordValidity,
      ).first()
      expect(validateArgs).toStrictEqual<typeof validateArgs>(validWords)
      verify(mockWordValidationService.checkWordValidity(anything())).once()
      const [inputArgs] = capture(mockChannelsService.update).first()
      expect(inputArgs).toStrictEqual<typeof inputArgs>({
        selfHandleId: handleId.toString(),
        channelId: channelId.toString(),
        name: { value: name },
        description: undefined,
        joinRule: undefined,
        tags: undefined,
        avatarUrl: undefined,
      })
      verify(mockChannelsService.update(anything())).once()
    })

    it('Updates a channel and power levels successfully', async () => {
      const handleId = new HandleId('selfHandleId')
      const channelId = new ChannelId('testChannelId')
      const name = 'updatedName'
      const updatedPowerLevels = {
        ...EntityDataFactory.channelRoomPowerLevels,
        users_default: 50,
        events_default: 50,
        redact: 50,
        kick: 50,
        ban: 50,
        events: {
          'm.room.name': 50,
          'm.room.topic': 50,
          'm.room.avatar': 50,
        },
        users: { '@testHandleId:testHomeServer.com': 25 },
      }
      const validWords = new Set([name])
      when(mockWordValidationService.checkWordValidity(anything())).thenResolve(
        validWords,
      )
      when(mockSessionManager.getMatrixClient(anything())).thenResolve(
        mockMatrixClient,
      )
      const mockMatrixRoomsService = {
        get: jest.fn().mockResolvedValue({
          ...EntityDataFactory.channelRoom,
          channelId: EntityDataFactory.channel.channelId.toString(),
        }),
        getMembers: jest.fn().mockResolvedValue([EntityDataFactory.roomMember]),
        update: jest.fn().mockResolvedValue({
          ...EntityDataFactory.channelRoom,
          channelId: EntityDataFactory.channel.channelId.toString(),
          powerLevels: updatedPowerLevels,
        }),
      }
      ;(MatrixRoomsService as unknown as jest.Mock).mockReturnValue(
        mockMatrixRoomsService,
      )
      when(mockChannelsService.update(anything())).thenResolve({
        ...EntityDataFactory.channel,
        name,
      })

      const result = await instanceUnderTest.execute({
        handleId,
        channelId,
        name: { value: name },
        permissions: {
          value: {
            ...EntityDataFactory.channelPermissions,
            sendMessages: ChannelRoleEntity.MODERATOR,
          },
        },
        defaultMemberRole: { value: ChannelRoleEntity.MODERATOR },
      })

      expect(result).toStrictEqual({
        ...EntityDataFactory.channel,
        name,
      })
      const [validateArgs] = capture(
        mockWordValidationService.checkWordValidity,
      ).first()
      expect(validateArgs).toStrictEqual<typeof validateArgs>(validWords)
      verify(mockWordValidationService.checkWordValidity(anything())).once()
      expect(mockMatrixRoomsService.get).toHaveBeenCalledWith(
        channelId.toString(),
      )
      expect(mockMatrixRoomsService.update).toHaveBeenCalledWith({
        roomId: channelId.toString(),
        powerLevels: { value: updatedPowerLevels },
      })
      const [inputArgs] = capture(mockChannelsService.update).first()
      expect(inputArgs).toStrictEqual<typeof inputArgs>({
        selfHandleId: handleId.toString(),
        channelId: channelId.toString(),
        name: { value: name },
        description: undefined,
        joinRule: undefined,
        tags: undefined,
        avatarUrl: undefined,
      })
      verify(mockChannelsService.update(anything())).once()
    })

    it('Updates a channel and avatar successfully', async () => {
      const handleId = new HandleId('selfHandleId')
      const channelId = new ChannelId('testChannelId')
      const name = 'updatedName'
      const mediaCredential = EntityDataFactory.mediaCredential
      const avatar = {
        file: new ArrayBuffer(0),
        fileName: 'fileName',
        fileType: 'fileType',
        mediaCredential,
      }
      const avatarUrl = 'mxc:foo.bar'
      const validWords = new Set([name])
      when(mockWordValidationService.checkWordValidity(anything())).thenResolve(
        validWords,
      )
      when(mockChannelsService.get(anything())).thenResolve(undefined)
      when(mockSessionManager.getMatrixClient(anything())).thenResolve(
        mockMatrixClient,
      )
      when(
        mockMediaCredentialManager.getPublicMediaCredential(
          anything(),
          anything(),
        ),
      ).thenResolve(mediaCredential)
      const mockMatrixRoomsService = {
        update: jest.fn().mockResolvedValue({
          ...EntityDataFactory.channel,
          channelId: EntityDataFactory.channel.channelId.toString(),
          avatarUrl,
        }),
      }
      ;(MatrixRoomsService as unknown as jest.Mock).mockReturnValue(
        mockMatrixRoomsService,
      )
      when(mockChannelsService.update(anything())).thenResolve({
        ...EntityDataFactory.channel,
        name,
        avatarUrl,
      })

      const result = await instanceUnderTest.execute({
        handleId,
        channelId,
        name: { value: name },
        avatar: { value: avatar },
      })

      expect(result).toStrictEqual({
        ...EntityDataFactory.channel,
        name,
        avatarUrl,
      })
      const [validateArgs] = capture(
        mockWordValidationService.checkWordValidity,
      ).first()
      expect(validateArgs).toStrictEqual<typeof validateArgs>(validWords)
      verify(mockWordValidationService.checkWordValidity(anything())).once()
      verify(mockChannelsService.get(anything())).once()
      const [forWriteArg, mediaTypeArg] = capture(
        mockMediaCredentialManager.getPublicMediaCredential,
      ).first()
      expect(forWriteArg).toStrictEqual<typeof forWriteArg>(true)
      expect(mediaTypeArg).toStrictEqual<typeof mediaTypeArg>(
        PublicMediaType.AVATARS,
      )
      verify(
        mockMediaCredentialManager.getPublicMediaCredential(
          anything(),
          anything(),
        ),
      ).once()
      expect(mockMatrixRoomsService.update).toHaveBeenCalledWith({
        roomId: channelId.toString(),
        avatar: { value: avatar },
        isVisible: { value: false },
      })
      const [inputArgs] = capture(mockChannelsService.update).first()
      expect(inputArgs).toStrictEqual<typeof inputArgs>({
        selfHandleId: handleId.toString(),
        channelId: channelId.toString(),
        name: { value: name },
        description: undefined,
        joinRule: undefined,
        tags: undefined,
        avatarUrl: { value: avatarUrl },
      })
      verify(mockChannelsService.update(anything())).once()
    })

    it('Updates a searchable channel and avatar successfully', async () => {
      const handleId = new HandleId('selfHandleId')
      const channelId = new ChannelId('testChannelId')
      const name = 'updatedName'
      const mediaCredential = EntityDataFactory.mediaCredential
      const avatar = {
        file: new ArrayBuffer(0),
        fileName: 'fileName',
        fileType: 'fileType',
        mediaCredential,
      }
      const avatarUrl = 'mxc:foo.bar'
      const validWords = new Set([name])
      when(mockWordValidationService.checkWordValidity(anything())).thenResolve(
        validWords,
      )
      when(mockChannelsService.get(anything())).thenResolve(
        EntityDataFactory.channel,
      )
      when(mockSessionManager.getMatrixClient(anything())).thenResolve(
        mockMatrixClient,
      )
      when(
        mockMediaCredentialManager.getPublicMediaCredential(
          anything(),
          anything(),
        ),
      ).thenResolve(mediaCredential)
      const mockMatrixRoomsService = {
        update: jest.fn().mockResolvedValue({
          ...EntityDataFactory.channel,
          channelId: EntityDataFactory.channel.channelId.toString(),
          avatarUrl,
        }),
      }
      ;(MatrixRoomsService as unknown as jest.Mock).mockReturnValue(
        mockMatrixRoomsService,
      )
      when(mockChannelsService.update(anything())).thenResolve({
        ...EntityDataFactory.channel,
        name,
        avatarUrl,
      })

      const result = await instanceUnderTest.execute({
        handleId,
        channelId,
        name: { value: name },
        avatar: { value: avatar },
      })

      expect(result).toStrictEqual({
        ...EntityDataFactory.channel,
        name,
        avatarUrl,
      })
      const [validateArgs] = capture(
        mockWordValidationService.checkWordValidity,
      ).first()
      expect(validateArgs).toStrictEqual<typeof validateArgs>(validWords)
      verify(mockWordValidationService.checkWordValidity(anything())).once()
      verify(mockChannelsService.get(anything())).once()
      expect(mockMatrixRoomsService.update).toHaveBeenCalledWith({
        roomId: channelId.toString(),
        avatar: { value: avatar },
        isVisible: { value: true },
      })
      const [inputArgs] = capture(mockChannelsService.update).first()
      expect(inputArgs).toStrictEqual<typeof inputArgs>({
        selfHandleId: handleId.toString(),
        channelId: channelId.toString(),
        name: { value: name },
        description: undefined,
        joinRule: undefined,
        tags: undefined,
        avatarUrl: { value: avatarUrl },
      })
      verify(mockChannelsService.update(anything())).once()
    })

    it('Should throw an UnacceptableWordsError when an invalid word is used when updating a channel', async () => {
      const channelId = new ChannelId('testChannelId')
      const handleId = new HandleId('testHandleId')
      const name = 'updatedName'
      const tags = { value: ['updatedKey-1', 'updatedKey-2'] }
      const validWords = new Set([name, ...tags.value])
      when(mockWordValidationService.checkWordValidity(anything())).thenResolve(
        new Set([]),
      )

      await expect(
        instanceUnderTest.execute({
          handleId,
          channelId,
          name: { value: name },
          tags,
        }),
      ).rejects.toThrow(UnacceptableWordsError)

      const [validateArgs] = capture(
        mockWordValidationService.checkWordValidity,
      ).first()
      expect(validateArgs).toStrictEqual<typeof validateArgs>(validWords)
      verify(mockWordValidationService.checkWordValidity(anything())).once()
      verify(mockChannelsService.create(anything())).never()
    })
  })
})
