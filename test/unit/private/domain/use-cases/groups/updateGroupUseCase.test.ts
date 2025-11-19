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
import { MediaCredentialManager } from '../../../../../../src/private/data/media/mediaCredentialManager'
import { MatrixRoomsService } from '../../../../../../src/private/data/rooms/matrixRoomsService'
import { SessionManager } from '../../../../../../src/private/data/session/sessionManager'
import { PublicMediaType } from '../../../../../../src/private/domain/entities/media/mediaCredentialEntity'
import { WordValidationService } from '../../../../../../src/private/domain/entities/wordValidation/wordValidationService'
import { UpdateGroupUseCase } from '../../../../../../src/private/domain/use-cases/groups/updateGroupUseCase'
import {
  GroupId,
  HandleId,
  UnacceptableWordsError,
} from '../../../../../../src/public'
import { EntityDataFactory } from '../../../../../data-factory/entity'

jest.mock('../../../../../../src/private/data/rooms/matrixRoomsService')

describe('UpdateGroupUseCase Test Suite', () => {
  const mockSessionManager = mock<SessionManager>()
  const mockWordValidationService = mock<WordValidationService>()
  const mockMediaCredentialManager = mock<MediaCredentialManager>()

  let instanceUnderTest: UpdateGroupUseCase

  beforeEach(() => {
    reset(mockSessionManager)
    reset(mockWordValidationService)
    reset(mockMediaCredentialManager)

    instanceUnderTest = new UpdateGroupUseCase(
      instance(mockSessionManager),
      instance(mockWordValidationService),
      instance(mockMediaCredentialManager),
    )
  })

  describe('execute', () => {
    it('Updates a group successfully', async () => {
      const groupId = new GroupId('testGroupId')
      const handleId = new HandleId('testHandleId')
      const name = 'updatedName'
      const validWords = new Set([name])
      when(mockWordValidationService.checkWordValidity(anything())).thenResolve(
        validWords,
      )
      const mockMatrixRoomsService = {
        update: jest.fn().mockResolvedValue({
          ...EntityDataFactory.groupRoom,
          roomId: EntityDataFactory.group.groupId.toString(),
        }),
      }
      ;(MatrixRoomsService as unknown as jest.Mock).mockReturnValue(
        mockMatrixRoomsService,
      )

      const result = await instanceUnderTest.execute({
        handleId,
        groupId,
        name: { value: name },
      })

      expect(result).toStrictEqual(EntityDataFactory.group)
      const [validateArgs] = capture(
        mockWordValidationService.checkWordValidity,
      ).first()
      expect(validateArgs).toStrictEqual<typeof validateArgs>(validWords)
      verify(mockWordValidationService.checkWordValidity(anything())).once()
      expect(mockMatrixRoomsService.update).toHaveBeenCalledWith({
        roomId: groupId.toString(),
        name: { value: name },
      })
    })

    it('Updates a group and avatar successfully', async () => {
      const groupId = new GroupId('testGroupId')
      const handleId = new HandleId('testHandleId')
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
      when(
        mockMediaCredentialManager.getPublicMediaCredential(
          anything(),
          anything(),
        ),
      ).thenResolve(mediaCredential)
      const mockMatrixRoomsService = {
        update: jest.fn().mockResolvedValue({
          ...EntityDataFactory.groupRoom,
          roomId: EntityDataFactory.group.groupId.toString(),
          name,
          avatarUrl,
        }),
      }
      ;(MatrixRoomsService as unknown as jest.Mock).mockReturnValue(
        mockMatrixRoomsService,
      )

      const result = await instanceUnderTest.execute({
        handleId,
        groupId,
        name: { value: name },
        avatar: { value: avatar },
      })

      expect(result).toStrictEqual({
        ...EntityDataFactory.group,
        name,
        avatarUrl,
      })
      const [validateArgs] = capture(
        mockWordValidationService.checkWordValidity,
      ).first()
      expect(validateArgs).toStrictEqual<typeof validateArgs>(validWords)
      verify(mockWordValidationService.checkWordValidity(anything())).once()
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
        roomId: groupId.toString(),
        name: { value: name },
        avatar: { value: avatar },
      })
    })

    it('Should throw an UnacceptableWordsError when an invalid word is used when updating a group', async () => {
      const groupId = new GroupId('testGroupId')
      const handleId = new HandleId('testHandleId')
      const name = 'updatedName'
      const validWords = new Set([name])
      when(mockWordValidationService.checkWordValidity(anything())).thenResolve(
        new Set([]),
      )

      await expect(
        instanceUnderTest.execute({
          handleId,
          groupId,
          name: { value: name },
        }),
      ).rejects.toThrow(UnacceptableWordsError)

      const [validateArgs] = capture(
        mockWordValidationService.checkWordValidity,
      ).first()
      expect(validateArgs).toStrictEqual<typeof validateArgs>(validWords)
      verify(mockWordValidationService.checkWordValidity(anything())).once()
    })
  })
})
