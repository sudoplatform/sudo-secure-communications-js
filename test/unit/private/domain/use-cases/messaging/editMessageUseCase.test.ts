/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { instance, mock, reset } from 'ts-mockito'
import { MatrixMessagingService } from '../../../../../../src/private/data/messaging/matrixMessagingService'
import { SessionManager } from '../../../../../../src/private/data/session/sessionManager'
import { EditMessageUseCase } from '../../../../../../src/private/domain/use-cases/messaging/editMessageUseCase'
import { HandleId } from '../../../../../../src/public'

jest.mock('../../../../../../src/private/data/messaging/matrixMessagingService')

describe('EditMessageUseCase Test Suite', () => {
  const mockSessionManager = mock<SessionManager>()

  let instanceUnderTest: EditMessageUseCase

  beforeEach(() => {
    reset(mockSessionManager)

    instanceUnderTest = new EditMessageUseCase(instance(mockSessionManager))
  })

  describe('execute', () => {
    it('Edits a message successfully', async () => {
      const mockMatrixMessagingService = {
        edit: jest.fn().mockResolvedValue(undefined),
      }
      ;(MatrixMessagingService as unknown as jest.Mock).mockReturnValue(
        mockMatrixMessagingService,
      )

      const handleId = new HandleId('handleId')
      const recipient = new HandleId('testRecipientHandleId')
      const messageId = 'messageId'
      const message = 'Edit a message'
      await expect(
        instanceUnderTest.execute({
          handleId,
          recipient,
          messageId,
          message,
        }),
      ).resolves.not.toThrow()

      expect(mockMatrixMessagingService.edit).toHaveBeenCalledWith({
        recipient,
        messageId,
        message,
      })
    })
  })
})
