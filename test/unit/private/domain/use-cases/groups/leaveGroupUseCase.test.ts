/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { instance, mock, reset } from 'ts-mockito'
import { MatrixRoomsService } from '../../../../../../src/private/data/rooms/matrixRoomsService'
import { SessionManager } from '../../../../../../src/private/data/session/sessionManager'
import { LeaveGroupUseCase } from '../../../../../../src/private/domain/use-cases/groups/leaveGroupUseCase'
import { GroupId, HandleId } from '../../../../../../src/public'

jest.mock('../../../../../../src/private/data/rooms/matrixRoomsService')

describe('LeaveGroupUseCase Test Suite', () => {
  const mockSessionManager = mock<SessionManager>()

  let instanceUnderTest: LeaveGroupUseCase

  beforeEach(() => {
    reset(mockSessionManager)

    instanceUnderTest = new LeaveGroupUseCase(instance(mockSessionManager))
  })

  describe('execute', () => {
    it('Leaves a group successfully', async () => {
      const mockMatrixRoomsService = {
        leave: jest.fn().mockResolvedValue(undefined),
      }
      ;(MatrixRoomsService as unknown as jest.Mock).mockReturnValue(
        mockMatrixRoomsService,
      )

      const handleId = new HandleId('handleId')
      const groupId = new GroupId('fooId')
      await expect(
        instanceUnderTest.execute({ handleId, groupId }),
      ).resolves.not.toThrow()

      expect(mockMatrixRoomsService.leave).toHaveBeenCalledWith(
        groupId.toString(),
      )
    })
  })
})
