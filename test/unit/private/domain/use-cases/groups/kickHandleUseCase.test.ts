/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { instance, mock, reset } from 'ts-mockito'
import { MatrixRoomsService } from '../../../../../../src/private/data/rooms/matrixRoomsService'
import { SessionManager } from '../../../../../../src/private/data/session/sessionManager'
import { KickHandleUseCase } from '../../../../../../src/private/domain/use-cases/groups/kickHandleUseCase'
import { GroupId, HandleId } from '../../../../../../src/public'

jest.mock('../../../../../../src/private/data/rooms/matrixRoomsService')

describe('KickHandleUseCase Test Suite', () => {
  const mockSessionManager = mock<SessionManager>()

  let instanceUnderTest: KickHandleUseCase

  beforeEach(() => {
    reset(mockSessionManager)

    instanceUnderTest = new KickHandleUseCase(instance(mockSessionManager))
  })

  describe('execute', () => {
    it('Kick handle from group successfully', async () => {
      const mockMatrixRoomsService = {
        kickHandle: jest.fn().mockResolvedValue(undefined),
      }
      ;(MatrixRoomsService as unknown as jest.Mock).mockReturnValue(
        mockMatrixRoomsService,
      )

      const handleId = new HandleId('handleId')
      const groupId = new GroupId('fooId')
      const targetHandleId = new HandleId('targetHandleId')
      await expect(
        instanceUnderTest.execute({ handleId, groupId, targetHandleId }),
      ).resolves.not.toThrow()

      expect(mockMatrixRoomsService.kickHandle).toHaveBeenCalledWith({
        roomId: groupId.toString(),
        targetHandleId: targetHandleId.toString(),
      })
    })

    it('Kick handle from group with reason successfully', async () => {
      const mockMatrixRoomsService = {
        kickHandle: jest.fn().mockResolvedValue(undefined),
      }
      ;(MatrixRoomsService as unknown as jest.Mock).mockReturnValue(
        mockMatrixRoomsService,
      )

      const handleId = new HandleId('handleId')
      const groupId = new GroupId('fooId')
      const targetHandleId = new HandleId('targetHandleId')
      const reason = 'bad actor'
      await expect(
        instanceUnderTest.execute({
          handleId,
          groupId,
          targetHandleId,
          reason,
        }),
      ).resolves.not.toThrow()

      expect(mockMatrixRoomsService.kickHandle).toHaveBeenCalledWith({
        roomId: groupId.toString(),
        targetHandleId: targetHandleId.toString(),
        reason,
      })
    })
  })
})
