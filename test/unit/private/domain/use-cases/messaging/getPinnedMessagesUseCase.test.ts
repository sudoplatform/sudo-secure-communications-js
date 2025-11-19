/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { instance, mock, reset } from 'ts-mockito'
import { MatrixMessagingService } from '../../../../../../src/private/data/messaging/matrixMessagingService'
import { SessionManager } from '../../../../../../src/private/data/session/sessionManager'
import { GetPinnedMessagesUseCase } from '../../../../../../src/private/domain/use-cases/messaging/getPinnedMessagesUseCase'
import { HandleId } from '../../../../../../src/public'
import { EntityDataFactory } from '../../../../../data-factory/entity'

jest.mock('../../../../../../src/private/data/messaging/matrixMessagingService')

describe('GetPinnedMessagesUseCase Test Suite', () => {
  const mockSessionManager = mock<SessionManager>()

  let instanceUnderTest: GetPinnedMessagesUseCase

  beforeEach(() => {
    reset(mockSessionManager)

    instanceUnderTest = new GetPinnedMessagesUseCase(
      instance(mockSessionManager),
    )
  })

  describe('execute', () => {
    it('Lists pinned messages successfully', async () => {
      const mockMatrixMessagingService = {
        getPinnedMessages: jest
          .fn()
          .mockResolvedValue([EntityDataFactory.message]),
      }
      ;(MatrixMessagingService as unknown as jest.Mock).mockReturnValue(
        mockMatrixMessagingService,
      )

      const handleId = new HandleId('handleId')
      const recipient = new HandleId('testRecipientHandleId')
      const result = await instanceUnderTest.execute({
        handleId,
        recipient,
      })

      expect(result).toStrictEqual([EntityDataFactory.message])
      expect(mockMatrixMessagingService.getPinnedMessages).toHaveBeenCalledWith(
        {
          recipient,
        },
      )
    })

    it('Lists pinned messages successfully with empty result', async () => {
      const mockMatrixMessagingService = {
        getPinnedMessages: jest.fn().mockResolvedValue([]),
      }
      ;(MatrixMessagingService as unknown as jest.Mock).mockReturnValue(
        mockMatrixMessagingService,
      )

      const handleId = new HandleId('handleId')
      const recipient = new HandleId('testRecipientHandleId')
      const result = await instanceUnderTest.execute({
        handleId,
        recipient,
      })

      expect(result).toStrictEqual([])
      expect(mockMatrixMessagingService.getPinnedMessages).toHaveBeenCalledWith(
        {
          recipient,
        },
      )
    })
  })
})
