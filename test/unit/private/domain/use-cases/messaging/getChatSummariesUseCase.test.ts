/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { instance, mock, reset } from 'ts-mockito'
import { MatrixMessagingService } from '../../../../../../src/private/data/messaging/matrixMessagingService'
import { SessionManager } from '../../../../../../src/private/data/session/sessionManager'
import { GetChatSummariesUseCase } from '../../../../../../src/private/domain/use-cases/messaging/getChatSummariesUseCase'
import { HandleId } from '../../../../../../src/public'
import { EntityDataFactory } from '../../../../../data-factory/entity'

jest.mock('../../../../../../src/private/data/messaging/matrixMessagingService')

describe('GetChatSummariesUseCase Test Suite', () => {
  const mockSessionManager = mock<SessionManager>()

  let instanceUnderTest: GetChatSummariesUseCase

  beforeEach(() => {
    reset(mockSessionManager)

    instanceUnderTest = new GetChatSummariesUseCase(
      instance(mockSessionManager),
    )
  })

  describe('execute', () => {
    it('Retrieves chat summaries successfully', async () => {
      const mockMatrixMessagingService = {
        getChatSummaries: jest
          .fn()
          .mockResolvedValue([EntityDataFactory.chatSummary]),
      }
      ;(MatrixMessagingService as unknown as jest.Mock).mockReturnValue(
        mockMatrixMessagingService,
      )

      const handleId = new HandleId('handleId')
      const recipient1 = new HandleId('testRecipientHandleId1')
      const recipient2 = new HandleId('testRecipientHandleId2')
      const recipients = [recipient1, recipient2]
      const result = await instanceUnderTest.execute({
        handleId,
        recipients,
      })

      expect(result).toStrictEqual([EntityDataFactory.chatSummary])
      expect(mockMatrixMessagingService.getChatSummaries).toHaveBeenCalledWith({
        recipients,
      })
    })

    it('Retrieves chat summaries successfully with empty result', async () => {
      const mockMatrixMessagingService = {
        getChatSummaries: jest.fn().mockResolvedValue([]),
      }
      ;(MatrixMessagingService as unknown as jest.Mock).mockReturnValue(
        mockMatrixMessagingService,
      )

      const handleId = new HandleId('handleId')
      const recipient1 = new HandleId('testRecipientHandleId1')
      const recipient2 = new HandleId('testRecipientHandleId2')
      const recipients = [recipient1, recipient2]
      const result = await instanceUnderTest.execute({
        handleId,
        recipients,
      })

      expect(result).toStrictEqual([])
      expect(mockMatrixMessagingService.getChatSummaries).toHaveBeenCalledWith({
        recipients,
      })
    })
  })
})
