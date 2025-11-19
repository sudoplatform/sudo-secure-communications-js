/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { instance, mock, reset } from 'ts-mockito'
import { MatrixMessagingService } from '../../../../../../src/private/data/messaging/matrixMessagingService'
import { SessionManager } from '../../../../../../src/private/data/session/sessionManager'
import { MarkAsReadUseCase } from '../../../../../../src/private/domain/use-cases/messaging/markAsReadUseCase'
import { HandleId } from '../../../../../../src/public'

jest.mock('../../../../../../src/private/data/messaging/matrixMessagingService')

describe('MarkAsReadUseCase Test Suite', () => {
  const mockSessionManager = mock<SessionManager>()

  let instanceUnderTest: MarkAsReadUseCase

  beforeEach(() => {
    reset(mockSessionManager)

    instanceUnderTest = new MarkAsReadUseCase(instance(mockSessionManager))
  })

  describe('execute', () => {
    it('Marks a message as read successfully', async () => {
      const mockMatrixMessagingService = {
        markAsRead: jest.fn().mockResolvedValue(undefined),
      }
      ;(MatrixMessagingService as unknown as jest.Mock).mockReturnValue(
        mockMatrixMessagingService,
      )

      const handleId = new HandleId('handleId')
      const recipient = new HandleId('testRecipientHandleId')
      await expect(
        instanceUnderTest.execute({
          handleId,
          recipient,
        }),
      ).resolves.not.toThrow()

      expect(mockMatrixMessagingService.markAsRead).toHaveBeenCalledWith({
        recipient,
      })
    })
  })
})
