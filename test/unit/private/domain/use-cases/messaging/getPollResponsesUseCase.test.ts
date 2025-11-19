/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { instance, mock, reset } from 'ts-mockito'
import { MatrixMessagingService } from '../../../../../../src/private/data/messaging/matrixMessagingService'
import { SessionManager } from '../../../../../../src/private/data/session/sessionManager'
import { GetPollResponsesUseCase } from '../../../../../../src/private/domain/use-cases/messaging/getPollResponsesUseCase'
import { HandleId } from '../../../../../../src/public'
import { EntityDataFactory } from '../../../../../data-factory/entity'

jest.mock('../../../../../../src/private/data/messaging/matrixMessagingService')

describe('GetPollResponsesUseCase Test Suite', () => {
  const mockSessionManager = mock<SessionManager>()

  let instanceUnderTest: GetPollResponsesUseCase

  beforeEach(() => {
    reset(mockSessionManager)

    instanceUnderTest = new GetPollResponsesUseCase(
      instance(mockSessionManager),
    )
  })

  describe('execute', () => {
    it('Tallies poll responses successfully', async () => {
      const mockMatrixMessagingService = {
        getPollResponses: jest
          .fn()
          .mockResolvedValue(EntityDataFactory.pollResponses),
      }
      ;(MatrixMessagingService as unknown as jest.Mock).mockReturnValue(
        mockMatrixMessagingService,
      )

      const handleId = new HandleId('handleId')
      const recipient = new HandleId('testRecipientHandleId')
      const pollId = 'testPollId'
      const result = await instanceUnderTest.execute({
        handleId,
        recipient,
        pollId,
      })

      expect(result).toStrictEqual(EntityDataFactory.pollResponses)
      expect(mockMatrixMessagingService.getPollResponses).toHaveBeenCalledWith({
        recipient,
        pollId,
      })
    })

    it('Tallies poll responses successfully with empty result', async () => {
      const mockMatrixMessagingService = {
        getPollResponses: jest.fn().mockResolvedValue({
          endedAt: undefined,
          talliedAnswers: {},
          totalVotes: 0,
        }),
      }
      ;(MatrixMessagingService as unknown as jest.Mock).mockReturnValue(
        mockMatrixMessagingService,
      )

      const handleId = new HandleId('handleId')
      const recipient = new HandleId('testRecipientHandleId')
      const pollId = 'testPollId'
      const result = await instanceUnderTest.execute({
        handleId,
        recipient,
        pollId,
      })

      expect(result).toStrictEqual({
        endedAt: undefined,
        talliedAnswers: {},
        totalVotes: 0,
      })
      expect(mockMatrixMessagingService.getPollResponses).toHaveBeenCalledWith({
        recipient,
        pollId,
      })
    })
  })
})
