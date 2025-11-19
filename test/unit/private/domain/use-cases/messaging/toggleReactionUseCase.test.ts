/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { instance, mock, reset } from 'ts-mockito'
import { MatrixMessagingService } from '../../../../../../src/private/data/messaging/matrixMessagingService'
import { SessionManager } from '../../../../../../src/private/data/session/sessionManager'
import { ToggleReactionUseCase } from '../../../../../../src/private/domain/use-cases/messaging/toggleReactionUseCase'
import { HandleId } from '../../../../../../src/public'

jest.mock('../../../../../../src/private/data/messaging/matrixMessagingService')

describe('ToggleReactionUseCase Test Suite', () => {
  const mockSessionManager = mock<SessionManager>()

  let instanceUnderTest: ToggleReactionUseCase

  beforeEach(() => {
    reset(mockSessionManager)

    instanceUnderTest = new ToggleReactionUseCase(instance(mockSessionManager))
  })

  describe('execute', () => {
    it('Toggles a reaction successfully', async () => {
      const mockMatrixMessagingService = {
        toggleReaction: jest.fn().mockResolvedValue(undefined),
      }
      ;(MatrixMessagingService as unknown as jest.Mock).mockReturnValue(
        mockMatrixMessagingService,
      )

      const handleId = new HandleId('handleId')
      const recipient = new HandleId('testRecipientHandleId')
      const messageId = 'messageId'
      const content = 'reaction'
      await expect(
        instanceUnderTest.execute({
          handleId,
          recipient,
          messageId,
          content,
        }),
      ).resolves.not.toThrow()

      expect(mockMatrixMessagingService.toggleReaction).toHaveBeenCalledWith({
        recipient,
        messageId,
        content,
      })
    })
  })
})
