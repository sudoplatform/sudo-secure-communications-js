/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { instance, mock, reset } from 'ts-mockito'
import { MatrixDirectChatsService } from '../../../../../../src/private/data/directChats/matrixDirectChatsService'
import { SessionManager } from '../../../../../../src/private/data/session/sessionManager'
import { UnblockHandleUseCase } from '../../../../../../src/private/domain/use-cases/directChats/unblockHandleUseCase'
import { HandleId } from '../../../../../../src/public'

jest.mock(
  '../../../../../../src/private/data/directChats/matrixDirectChatsService',
)

describe('UnblockHandleUseCase Test Suite', () => {
  const mockSessionManager = mock<SessionManager>()

  let instanceUnderTest: UnblockHandleUseCase

  beforeEach(() => {
    reset(mockSessionManager)

    instanceUnderTest = new UnblockHandleUseCase(instance(mockSessionManager))
  })

  describe('execute', () => {
    it('Unblock handle from direct chat successfully', async () => {
      const mockMatrixDirectChatsService = {
        unblockHandle: jest.fn().mockResolvedValue(undefined),
      }
      ;(MatrixDirectChatsService as unknown as jest.Mock).mockReturnValue(
        mockMatrixDirectChatsService,
      )

      const handleId = new HandleId('testHandleId')
      const handleIdToUnblock = new HandleId('testHandleIdToBlock')
      await expect(
        instanceUnderTest.execute({ handleId, handleIdToUnblock }),
      ).resolves.not.toThrow()

      expect(mockMatrixDirectChatsService.unblockHandle).toHaveBeenCalledWith(
        handleIdToUnblock.toString(),
      )
    })
  })
})
