/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { instance, mock, reset } from 'ts-mockito'
import { MatrixMessagingService } from '../../../../../../src/private/data/messaging/matrixMessagingService'
import { SessionManager } from '../../../../../../src/private/data/session/sessionManager'
import { EndPollUseCase } from '../../../../../../src/private/domain/use-cases/messaging/endPollUseCase'
import { HandleId } from '../../../../../../src/public'

jest.mock('../../../../../../src/private/data/messaging/matrixMessagingService')

describe('EndPollUseCase Test Suite', () => {
  const mockSessionManager = mock<SessionManager>()

  let instanceUnderTest: EndPollUseCase

  beforeEach(() => {
    reset(mockSessionManager)

    instanceUnderTest = new EndPollUseCase(instance(mockSessionManager))
  })

  describe('execute', () => {
    it('Ends a poll successfully', async () => {
      const mockMatrixMessagingService = {
        endPoll: jest.fn().mockResolvedValue(undefined),
      }
      ;(MatrixMessagingService as unknown as jest.Mock).mockReturnValue(
        mockMatrixMessagingService,
      )

      const handleId = new HandleId('handleId')
      const recipient = new HandleId('testRecipientHandleId')
      const pollId = 'pollId'
      await expect(
        instanceUnderTest.execute({
          handleId,
          recipient,
          pollId,
        }),
      ).resolves.not.toThrow()

      expect(mockMatrixMessagingService.endPoll).toHaveBeenCalledWith({
        recipient,
        pollId,
      })
    })
  })
})
