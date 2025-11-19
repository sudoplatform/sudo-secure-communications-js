/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { instance, mock, reset } from 'ts-mockito'
import { MatrixDirectChatsService } from '../../../../../../src/private/data/directChats/matrixDirectChatsService'
import { SessionManager } from '../../../../../../src/private/data/session/sessionManager'
import { ListJoinedChatsUseCase } from '../../../../../../src/private/domain/use-cases/directChats/listJoinedChatsUseCase'
import { HandleId } from '../../../../../../src/public'
import { EntityDataFactory } from '../../../../../data-factory/entity'

jest.mock(
  '../../../../../../src/private/data/directChats/matrixDirectChatsService',
)

describe('ListJoinedChatsUseCase Test Suite', () => {
  const mockSessionManager = mock<SessionManager>()

  let instanceUnderTest: ListJoinedChatsUseCase

  beforeEach(() => {
    reset(mockSessionManager)

    instanceUnderTest = new ListJoinedChatsUseCase(instance(mockSessionManager))
  })

  describe('execute', () => {
    it('Lists all the direct chats the handle has joined successfully', async () => {
      const mockMatrixDirectChatsService = {
        listJoined: jest.fn().mockResolvedValue([EntityDataFactory.directChat]),
      }
      ;(MatrixDirectChatsService as unknown as jest.Mock).mockReturnValue(
        mockMatrixDirectChatsService,
      )

      const handleId = new HandleId('handleId')
      await expect(instanceUnderTest.execute(handleId)).resolves.toEqual([
        EntityDataFactory.directChat,
      ])

      expect(mockMatrixDirectChatsService.listJoined).toHaveBeenCalledWith()
    })

    it('Lists direct chats the handle has joined with an empty result successfully', async () => {
      const mockMatrixDirectChatsService = {
        listJoined: jest.fn().mockResolvedValue([]),
      }
      ;(MatrixDirectChatsService as unknown as jest.Mock).mockReturnValue(
        mockMatrixDirectChatsService,
      )
      const handleId = new HandleId('handleId')
      await expect(instanceUnderTest.execute(handleId)).resolves.toEqual([])

      expect(mockMatrixDirectChatsService.listJoined).toHaveBeenCalledWith()
    })
  })
})
