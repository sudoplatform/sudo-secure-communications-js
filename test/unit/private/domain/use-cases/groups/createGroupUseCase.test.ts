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
import { MatrixRoomsService } from '../../../../../../src/private/data/rooms/matrixRoomsService'
import { SessionManager } from '../../../../../../src/private/data/session/sessionManager'
import { WordValidationService } from '../../../../../../src/private/domain/entities/wordValidation/wordValidationService'
import { CreateGroupUseCase } from '../../../../../../src/private/domain/use-cases/groups/createGroupUseCase'
import { HandleId, UnacceptableWordsError } from '../../../../../../src/public'
import { EntityDataFactory } from '../../../../../data-factory/entity'

jest.mock('../../../../../../src/private/data/rooms/matrixRoomsService')

describe('CreateGroupUseCase Test Suite', () => {
  const mockSessionManager = mock<SessionManager>()
  const mockWordValidationService = mock<WordValidationService>()

  let instanceUnderTest: CreateGroupUseCase

  beforeEach(() => {
    reset(mockSessionManager)
    reset(mockWordValidationService)

    instanceUnderTest = new CreateGroupUseCase(
      instance(mockSessionManager),
      instance(mockWordValidationService),
    )
  })

  describe('execute', () => {
    it('Creates a group successfully', async () => {
      const handleId = new HandleId('testHandleId')
      const invitedHandleId = new HandleId('invitedHandleId')
      const name = 'handlename'
      const description = 'testDescription'
      const validWords = new Set([name, description])
      when(mockWordValidationService.checkWordValidity(anything())).thenResolve(
        validWords,
      )
      const mockMatrixRoomsService = {
        create: jest.fn().mockResolvedValue({
          ...EntityDataFactory.groupRoom,
          roomId: EntityDataFactory.group.groupId.toString(),
        }),
      }
      ;(MatrixRoomsService as unknown as jest.Mock).mockReturnValue(
        mockMatrixRoomsService,
      )

      const result = await instanceUnderTest.execute({
        handleId,
        name,
        description,
        invitedHandleIds: [invitedHandleId],
      })

      expect(result).toStrictEqual(EntityDataFactory.group)
      const [validateArgs] = capture(
        mockWordValidationService.checkWordValidity,
      ).first()
      expect(validateArgs).toStrictEqual<typeof validateArgs>(validWords)
      verify(mockWordValidationService.checkWordValidity(anything())).once()
      expect(mockMatrixRoomsService.create).toHaveBeenCalledWith({
        name,
        description,
        avatarUrl: undefined,
        invitedHandleIds: [invitedHandleId.toString()],
        powerLevels: EntityDataFactory.groupPowerLevels,
      })
    })

    it('Should throw an UnacceptableWordsError when an invalid word is used when creating a group', async () => {
      const handleId = new HandleId('testHandleId')
      const invitedHandleId = new HandleId('invitedHandleId')
      const name = 'handlename'
      const description = 'testDescription'
      const validWords = new Set([name, description])
      when(mockWordValidationService.checkWordValidity(anything())).thenResolve(
        new Set([]),
      )

      await expect(
        instanceUnderTest.execute({
          handleId,
          name,
          description,
          invitedHandleIds: [invitedHandleId],
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
