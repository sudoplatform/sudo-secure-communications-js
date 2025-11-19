/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { instance, mock, reset } from 'ts-mockito'
import { MatrixDirectChatsService } from '../../../../../../src/private/data/directChats/matrixDirectChatsService'
import { SessionManager } from '../../../../../../src/private/data/session/sessionManager'
import { BlockHandleUseCase } from '../../../../../../src/private/domain/use-cases/directChats/blockHandleUseCase'
import { HandleId } from '../../../../../../src/public'

jest.mock(
  '../../../../../../src/private/data/directChats/matrixDirectChatsService',
)

describe('BlockHandleUseCase Test Suite', () => {
  const mockSessionManager = mock<SessionManager>()

  let instanceUnderTest: BlockHandleUseCase

  beforeEach(() => {
    reset(mockSessionManager)

    instanceUnderTest = new BlockHandleUseCase(instance(mockSessionManager))
  })

  describe('execute', () => {
    it('Block handle from direct chat successfully', async () => {
      const mockMatrixDirectChatsService = {
        blockHandle: jest.fn().mockResolvedValue(undefined),
      }
      ;(MatrixDirectChatsService as unknown as jest.Mock).mockReturnValue(
        mockMatrixDirectChatsService,
      )

      const handleId = new HandleId('testHandleId')
      const handleIdToBlock = new HandleId('testHandleIdToBlock')
      await expect(
        instanceUnderTest.execute({ handleId, handleIdToBlock }),
      ).resolves.not.toThrow()

      expect(mockMatrixDirectChatsService.blockHandle).toHaveBeenCalledWith(
        handleIdToBlock.toString(),
      )
    })
  })
})
