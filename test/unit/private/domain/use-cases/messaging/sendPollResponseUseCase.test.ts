/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { instance, mock, reset } from 'ts-mockito'
import { MatrixMessagingService } from '../../../../../../src/private/data/messaging/matrixMessagingService'
import { SessionManager } from '../../../../../../src/private/data/session/sessionManager'
import { SendPollResponseUseCase } from '../../../../../../src/private/domain/use-cases/messaging/sendPollResponseUseCase'
import { HandleId } from '../../../../../../src/public'

jest.mock('../../../../../../src/private/data/messaging/matrixMessagingService')

describe('SendPollResponseUseCase Test Suite', () => {
  const mockSessionManager = mock<SessionManager>()

  let instanceUnderTest: SendPollResponseUseCase

  beforeEach(() => {
    reset(mockSessionManager)

    instanceUnderTest = new SendPollResponseUseCase(
      instance(mockSessionManager),
    )
  })

  describe('execute', () => {
    it('Sends a poll response successfully', async () => {
      const mockMatrixMessagingService = {
        sendPollResponse: jest.fn().mockResolvedValue(undefined),
      }
      ;(MatrixMessagingService as unknown as jest.Mock).mockReturnValue(
        mockMatrixMessagingService,
      )

      const handleId = new HandleId('handleId')
      const recipient = new HandleId('testRecipientHandleId')
      const answers = ['Paris']
      const pollId = 'pollId'
      await expect(
        instanceUnderTest.execute({
          handleId,
          recipient,
          pollId,
          answers,
        }),
      ).resolves.not.toThrow()

      expect(mockMatrixMessagingService.sendPollResponse).toHaveBeenCalledWith({
        recipient,
        pollId,
        answers,
      })
    })
  })
})
