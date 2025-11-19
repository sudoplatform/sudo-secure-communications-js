/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { instance, mock, reset } from 'ts-mockito'
import { MatrixMessagingService } from '../../../../../../src/private/data/messaging/matrixMessagingService'
import { SessionManager } from '../../../../../../src/private/data/session/sessionManager'
import { PollTypeEntity } from '../../../../../../src/private/domain/entities/messaging/pollEntity'
import { EditPollUseCase } from '../../../../../../src/private/domain/use-cases/messaging/editPollUseCase'
import { HandleId } from '../../../../../../src/public'

jest.mock('../../../../../../src/private/data/messaging/matrixMessagingService')

describe('EditPollUseCase Test Suite', () => {
  const mockSessionManager = mock<SessionManager>()

  let instanceUnderTest: EditPollUseCase

  beforeEach(() => {
    reset(mockSessionManager)

    instanceUnderTest = new EditPollUseCase(instance(mockSessionManager))
  })

  describe('execute', () => {
    it('Edits a poll successfully', async () => {
      const mockMatrixMessagingService = {
        editPoll: jest.fn().mockResolvedValue(undefined),
      }
      ;(MatrixMessagingService as unknown as jest.Mock).mockReturnValue(
        mockMatrixMessagingService,
      )

      const handleId = new HandleId('handleId')
      const recipient = new HandleId('testRecipientHandleId')
      const pollId = 'pollId'
      const type = PollTypeEntity.DISCLOSED
      const question = 'What is the capital of France?'
      const answers = ['Paris', 'London', 'Berlin']
      const maxSelections = 1
      await expect(
        instanceUnderTest.execute({
          handleId,
          recipient,
          pollId,
          type,
          question,
          answers,
          maxSelections,
        }),
      ).resolves.not.toThrow()

      expect(mockMatrixMessagingService.editPoll).toHaveBeenCalledWith({
        recipient,
        pollId,
        type,
        question,
        answers,
        maxSelections,
      })
    })
  })
})
