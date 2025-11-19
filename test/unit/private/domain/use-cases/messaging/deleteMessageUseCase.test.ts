/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { instance, mock, reset } from 'ts-mockito'
import { MatrixMessagingService } from '../../../../../../src/private/data/messaging/matrixMessagingService'
import { SessionManager } from '../../../../../../src/private/data/session/sessionManager'
import { DeleteMessageUseCase } from '../../../../../../src/private/domain/use-cases/messaging/deleteMessageUseCase'
import { HandleId } from '../../../../../../src/public'

jest.mock('../../../../../../src/private/data/messaging/matrixMessagingService')

describe('DeleteMessageUseCase Test Suite', () => {
  const mockSessionManager = mock<SessionManager>()

  let instanceUnderTest: DeleteMessageUseCase

  beforeEach(() => {
    reset(mockSessionManager)

    instanceUnderTest = new DeleteMessageUseCase(instance(mockSessionManager))
  })

  describe('execute', () => {
    it('Deletes a message successfully', async () => {
      const mockMatrixMessagingService = {
        delete: jest.fn().mockResolvedValue(undefined),
      }
      ;(MatrixMessagingService as unknown as jest.Mock).mockReturnValue(
        mockMatrixMessagingService,
      )

      const handleId = new HandleId('handleId')
      const recipient = new HandleId('testRecipientHandleId')
      const messageId = 'messageId'
      await expect(
        instanceUnderTest.execute({
          handleId,
          recipient,
          messageId,
        }),
      ).resolves.not.toThrow()

      expect(mockMatrixMessagingService.delete).toHaveBeenCalledWith({
        recipient,
        messageId,
      })
    })
  })
})
