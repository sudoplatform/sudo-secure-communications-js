/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { instance, mock, reset } from 'ts-mockito'
import { MatrixDirectChatsService } from '../../../../../../src/private/data/directChats/matrixDirectChatsService'
import { SessionManager } from '../../../../../../src/private/data/session/sessionManager'
import { AcceptInvitationUseCase } from '../../../../../../src/private/domain/use-cases/directChats/acceptInvitationUseCase'
import { ChatId, HandleId } from '../../../../../../src/public'

jest.mock(
  '../../../../../../src/private/data/directChats/matrixDirectChatsService',
)

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
    it('Accepts an invitation to join a direct chat successfully', async () => {
      const mockMatrixDirectChatsService = {
        acceptInvitation: jest.fn().mockResolvedValue(undefined),
      }
      ;(MatrixDirectChatsService as unknown as jest.Mock).mockReturnValue(
        mockMatrixDirectChatsService,
      )

      const handleId = new HandleId('testHandleId')
      const id = new ChatId('testChatid')
      await expect(
        instanceUnderTest.execute({
          handleId,
          id,
        }),
      ).resolves.not.toThrow()

      expect(
        mockMatrixDirectChatsService.acceptInvitation,
      ).toHaveBeenCalledWith(id.toString())
    })
  })
})
