/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { instance, mock, reset } from 'ts-mockito'
import { MatrixRoomsService } from '../../../../../../src/private/data/rooms/matrixRoomsService'
import { SessionManager } from '../../../../../../src/private/data/session/sessionManager'
import { UnbanHandleUseCase } from '../../../../../../src/private/domain/use-cases/groups/unbanHandleUseCase'
import { GroupId, HandleId } from '../../../../../../src/public'

jest.mock('../../../../../../src/private/data/rooms/matrixRoomsService')

describe('UnbanHandleUseCase Test Suite', () => {
  const mockSessionManager = mock<SessionManager>()

  let instanceUnderTest: UnbanHandleUseCase

  beforeEach(() => {
    reset(mockSessionManager)

    instanceUnderTest = new UnbanHandleUseCase(instance(mockSessionManager))
  })

  describe('execute', () => {
    it('Unban handle from group successfully', async () => {
      const mockMatrixRoomsService = {
        unbanHandle: jest.fn().mockResolvedValue(undefined),
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

      expect(mockMatrixRoomsService.unbanHandle).toHaveBeenCalledWith({
        roomId: groupId.toString(),
        targetHandleId: targetHandleId.toString(),
      })
    })

    it('Unban handle from group with reason successfully', async () => {
      const mockMatrixRoomsService = {
        unbanHandle: jest.fn().mockResolvedValue(undefined),
      }
      ;(MatrixRoomsService as unknown as jest.Mock).mockReturnValue(
        mockMatrixRoomsService,
      )

      const handleId = new HandleId('handleId')
      const groupId = new GroupId('fooId')
      const targetHandleId = new HandleId('targetHandleId')
      const reason = 'not a bad actor'
      await expect(
        instanceUnderTest.execute({
          handleId,
          groupId,
          targetHandleId,
          reason,
        }),
      ).resolves.not.toThrow()

      expect(mockMatrixRoomsService.unbanHandle).toHaveBeenCalledWith({
        roomId: groupId.toString(),
        targetHandleId: targetHandleId.toString(),
        reason,
      })
    })
  })
})
