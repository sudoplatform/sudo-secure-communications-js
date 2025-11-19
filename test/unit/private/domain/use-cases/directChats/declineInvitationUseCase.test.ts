/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { instance, mock, reset } from 'ts-mockito'
import { MatrixDirectChatsService } from '../../../../../../src/private/data/directChats/matrixDirectChatsService'
import { SessionManager } from '../../../../../../src/private/data/session/sessionManager'
import { DeclineInvitationUseCase } from '../../../../../../src/private/domain/use-cases/directChats/declineInvitationUseCase'
import { GroupId, HandleId } from '../../../../../../src/public'

jest.mock(
  '../../../../../../src/private/data/directChats/matrixDirectChatsService',
)

describe('DeclineInvitationUseCase Test Suite', () => {
  const mockSessionManager = mock<SessionManager>()

  let instanceUnderTest: DeclineInvitationUseCase

  beforeEach(() => {
    reset(mockSessionManager)

    instanceUnderTest = new DeclineInvitationUseCase(
      instance(mockSessionManager),
    )
  })

  describe('execute', () => {
    it('Declines an invitation to join a direct chat successfully', async () => {
      const mockMatrixDirectChatsService = {
        declineInvitation: jest.fn().mockResolvedValue(undefined),
      }
      ;(MatrixDirectChatsService as unknown as jest.Mock).mockReturnValue(
        mockMatrixDirectChatsService,
      )

      const handleId = new HandleId('handleId')
      const id = new GroupId('fooId')
      await expect(
        instanceUnderTest.execute({
          handleId,
          id,
        }),
      ).resolves.not.toThrow()

      expect(
        mockMatrixDirectChatsService.declineInvitation,
      ).toHaveBeenCalledWith(id.toString())
    })
  })
})
