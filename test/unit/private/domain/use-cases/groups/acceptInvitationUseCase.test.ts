/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { instance, mock, reset } from 'ts-mockito'
import { MatrixRoomsService } from '../../../../../../src/private/data/rooms/matrixRoomsService'
import { SessionManager } from '../../../../../../src/private/data/session/sessionManager'
import { AcceptInvitationUseCase } from '../../../../../../src/private/domain/use-cases/groups/acceptInvitationUseCase'
import { GroupId, HandleId } from '../../../../../../src/public'

jest.mock('../../../../../../src/private/data/rooms/matrixRoomsService')

describe('AcceptInvitationUseCase Test Suite', () => {
  const mockSessionManager = mock<SessionManager>()

  let instanceUnderTest: AcceptInvitationUseCase

  beforeEach(() => {
    reset(mockSessionManager)

    instanceUnderTest = new AcceptInvitationUseCase(
      instance(mockSessionManager),
    )
  })

  describe('execute', () => {
    it('Accepts an invitation to join a group successfully', async () => {
      const mockMatrixRoomsService = {
        join: jest.fn().mockResolvedValue(undefined),
      }
      ;(MatrixRoomsService as unknown as jest.Mock).mockReturnValue(
        mockMatrixRoomsService,
      )

      const handleId = new HandleId('handleId')
      const groupId = new GroupId('fooId')
      await expect(
        instanceUnderTest.execute({
          handleId,
          groupId,
        }),
      ).resolves.not.toThrow()

      expect(mockMatrixRoomsService.join).toHaveBeenCalledWith(
        groupId.toString(),
      )
    })
  })
})
