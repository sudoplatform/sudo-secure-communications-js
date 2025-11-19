/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { instance, mock, reset } from 'ts-mockito'
import { MatrixMessagingService } from '../../../../../../src/private/data/messaging/matrixMessagingService'
import { SessionManager } from '../../../../../../src/private/data/session/sessionManager'
import { PollTypeEntity } from '../../../../../../src/private/domain/entities/messaging/pollEntity'
import { CreatePollUseCase } from '../../../../../../src/private/domain/use-cases/messaging/createPollUseCase'
import { HandleId } from '../../../../../../src/public'

jest.mock('../../../../../../src/private/data/messaging/matrixMessagingService')

describe('CreatePollUseCase Test Suite', () => {
  const mockSessionManager = mock<SessionManager>()

  let instanceUnderTest: CreatePollUseCase

  beforeEach(() => {
    reset(mockSessionManager)

    instanceUnderTest = new CreatePollUseCase(instance(mockSessionManager))
  })

  describe('execute', () => {
    it('Creates a poll successfully', async () => {
      const mockMatrixMessagingService = {
        createPoll: jest.fn().mockResolvedValue(undefined),
      }
      ;(MatrixMessagingService as unknown as jest.Mock).mockReturnValue(
        mockMatrixMessagingService,
      )

      const handleId = new HandleId('handleId')
      const recipient = new HandleId('testRecipientHandleId')
      const type = PollTypeEntity.DISCLOSED
      const question = 'What is the capital of France?'
      const answers = ['Paris', 'London', 'Berlin']
      const maxSelections = 1
      await expect(
        instanceUnderTest.execute({
          handleId,
          recipient,
          type,
          question,
          answers,
          maxSelections,
        }),
      ).resolves.not.toThrow()

      expect(mockMatrixMessagingService.createPoll).toHaveBeenCalledWith({
        recipient,
        type,
        question,
        answers,
        maxSelections,
      })
    })
  })
})
