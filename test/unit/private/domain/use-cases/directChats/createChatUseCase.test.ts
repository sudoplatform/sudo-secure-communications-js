/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { instance, mock, reset } from 'ts-mockito'
import { MatrixDirectChatsService } from '../../../../../../src/private/data/directChats/matrixDirectChatsService'
import { SessionManager } from '../../../../../../src/private/data/session/sessionManager'
import { CreateChatUseCase } from '../../../../../../src/private/domain/use-cases/directChats/createChatUseCase'
import { ChatId, HandleId } from '../../../../../../src/public'

jest.mock(
  '../../../../../../src/private/data/directChats/matrixDirectChatsService',
)

describe('CreateChatUseCase Test Suite', () => {
  const mockSessionManager = mock<SessionManager>()

  let instanceUnderTest: CreateChatUseCase

  beforeEach(() => {
    reset(mockSessionManager)

    instanceUnderTest = new CreateChatUseCase(instance(mockSessionManager))
  })

  describe('execute', () => {
    it('Creates a direct chat between two handles successfully', async () => {
      const handleId = new HandleId('testHandleId')
      const handleIdToChatTo = new HandleId('testHandleIdToChatTo')
      const chatId = new ChatId('testChatId')
      const mockMatrixDirectChatsService = {
        create: jest.fn().mockResolvedValue(chatId.toString()),
      }
      ;(MatrixDirectChatsService as unknown as jest.Mock).mockReturnValue(
        mockMatrixDirectChatsService,
      )

      const result = await instanceUnderTest.execute({
        handleId,
        handleIdToChatTo,
      })

      expect(result).toStrictEqual(chatId)
      expect(mockMatrixDirectChatsService.create).toHaveBeenCalledWith(
        handleIdToChatTo.toString(),
      )
    })
  })
})
