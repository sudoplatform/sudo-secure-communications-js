/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { instance, mock, reset } from 'ts-mockito'
import { MatrixMessagingService } from '../../../../../../src/private/data/messaging/matrixMessagingService'
import { SessionManager } from '../../../../../../src/private/data/session/sessionManager'
import { SendTypingNotificationUseCase } from '../../../../../../src/private/domain/use-cases/messaging/sendTypingNotificationUseCase'
import { HandleId } from '../../../../../../src/public'

jest.mock('../../../../../../src/private/data/messaging/matrixMessagingService')

describe('SendTypingNotificationUseCase Test Suite', () => {
  const mockSessionManager = mock<SessionManager>()

  let instanceUnderTest: SendTypingNotificationUseCase

  beforeEach(() => {
    reset(mockSessionManager)

    instanceUnderTest = new SendTypingNotificationUseCase(
      instance(mockSessionManager),
    )
  })

  describe('execute', () => {
    it('Sends a typing notification successfully', async () => {
      const mockMatrixMessagingService = {
        sendTypingNotification: jest.fn().mockResolvedValue(undefined),
      }
      ;(MatrixMessagingService as unknown as jest.Mock).mockReturnValue(
        mockMatrixMessagingService,
      )

      const handleId = new HandleId('handleId')
      const recipient = new HandleId('testRecipientHandleId')
      const isTyping = true
      await expect(
        instanceUnderTest.execute({
          handleId,
          recipient,
          isTyping,
        }),
      ).resolves.not.toThrow()

      expect(
        mockMatrixMessagingService.sendTypingNotification,
      ).toHaveBeenCalledWith({
        recipient,
        isTyping,
      })
    })
  })
})
