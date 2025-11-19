/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { instance, mock, reset } from 'ts-mockito'
import { MatrixDirectChatsService } from '../../../../../../src/private/data/directChats/matrixDirectChatsService'
import { SessionManager } from '../../../../../../src/private/data/session/sessionManager'
import { ListInvitationsUseCase } from '../../../../../../src/private/domain/use-cases/directChats/listInvitationsUseCase'
import { HandleId } from '../../../../../../src/public'
import { EntityDataFactory } from '../../../../../data-factory/entity'

jest.mock(
  '../../../../../../src/private/data/directChats/matrixDirectChatsService',
)

describe('ListInvitationsUseCase Test Suite', () => {
  const mockSessionManager = mock<SessionManager>()

  let instanceUnderTest: ListInvitationsUseCase

  beforeEach(() => {
    reset(mockSessionManager)

    instanceUnderTest = new ListInvitationsUseCase(instance(mockSessionManager))
  })

  describe('execute', () => {
    it('Lists all the direct chats the handle has an active invitation for successfully', async () => {
      const mockMatrixDirectChatsService = {
        listInvitations: jest
          .fn()
          .mockResolvedValue([EntityDataFactory.directChatInvitation]),
      }
      ;(MatrixDirectChatsService as unknown as jest.Mock).mockReturnValue(
        mockMatrixDirectChatsService,
      )

      const handleId = new HandleId('handleId')
      await expect(instanceUnderTest.execute(handleId)).resolves.toEqual([
        EntityDataFactory.directChatInvitation,
      ])

      expect(
        mockMatrixDirectChatsService.listInvitations,
      ).toHaveBeenCalledWith()
    })

    it('Lists direct chats the handle has an active invitation with an empty result successfully', async () => {
      const mockMatrixDirectChatsService = {
        listInvitations: jest.fn().mockResolvedValue([]),
      }
      ;(MatrixDirectChatsService as unknown as jest.Mock).mockReturnValue(
        mockMatrixDirectChatsService,
      )
      const handleId = new HandleId('handleId')
      await expect(instanceUnderTest.execute(handleId)).resolves.toEqual([])

      expect(
        mockMatrixDirectChatsService.listInvitations,
      ).toHaveBeenCalledWith()
    })
  })
})
