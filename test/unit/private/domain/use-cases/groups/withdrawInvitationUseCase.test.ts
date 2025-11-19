/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { instance, mock, reset } from 'ts-mockito'
import { MatrixRoomsService } from '../../../../../../src/private/data/rooms/matrixRoomsService'
import { SessionManager } from '../../../../../../src/private/data/session/sessionManager'
import { WithdrawInvitationUseCase } from '../../../../../../src/private/domain/use-cases/groups/withdrawInvitationUseCase'
import { GroupId, HandleId } from '../../../../../../src/public'

jest.mock('../../../../../../src/private/data/rooms/matrixRoomsService')

describe('WithdrawInvitationUseCase Test Suite', () => {
  const mockSessionManager = mock<SessionManager>()

  let instanceUnderTest: WithdrawInvitationUseCase

  beforeEach(() => {
    reset(mockSessionManager)

    instanceUnderTest = new WithdrawInvitationUseCase(
      instance(mockSessionManager),
    )
  })

  describe('execute', () => {
    it('Withdraws an invitation to join a group successfully', async () => {
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
  })
})
