/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { instance, mock, reset } from 'ts-mockito'
import { MatrixDirectChatsService } from '../../../../../../src/private/data/directChats/matrixDirectChatsService'
import { SessionManager } from '../../../../../../src/private/data/session/sessionManager'
import { ListBlockedHandlesUseCase } from '../../../../../../src/private/domain/use-cases/directChats/listBlockedHandlesUseCase'
import { HandleId } from '../../../../../../src/public'

jest.mock(
  '../../../../../../src/private/data/directChats/matrixDirectChatsService',
)

describe('ListBlockedHandlesUseCase Test Suite', () => {
  const mockSessionManager = mock<SessionManager>()

  let instanceUnderTest: ListBlockedHandlesUseCase

  beforeEach(() => {
    reset(mockSessionManager)

    instanceUnderTest = new ListBlockedHandlesUseCase(
      instance(mockSessionManager),
    )
  })

  describe('execute', () => {
    it('Lists all of the blocked handles for a handle successfully', async () => {
      const handleId = new HandleId('testHandleId')
      const blockedHandleId = new HandleId('@testBlockedHandleId')
      const mockMatrixDirectChatsService = {
        listBlockedHandles: jest
          .fn()
          .mockResolvedValue([blockedHandleId.toString()]),
      }
      ;(MatrixDirectChatsService as unknown as jest.Mock).mockReturnValue(
        mockMatrixDirectChatsService,
      )

      await expect(instanceUnderTest.execute(handleId)).resolves.toEqual([
        new HandleId('testBlockedHandleId'),
      ])

      expect(
        mockMatrixDirectChatsService.listBlockedHandles,
      ).toHaveBeenCalledWith()
    })

    it('Lists all of the blocked handles for the handle with an empty result successfully', async () => {
      const mockMatrixDirectChatsService = {
        listBlockedHandles: jest.fn().mockResolvedValue([]),
      }
      ;(MatrixDirectChatsService as unknown as jest.Mock).mockReturnValue(
        mockMatrixDirectChatsService,
      )
      const handleId = new HandleId('handleId')
      await expect(instanceUnderTest.execute(handleId)).resolves.toEqual([])

      expect(
        mockMatrixDirectChatsService.listBlockedHandles,
      ).toHaveBeenCalledWith()
    })
  })
})
