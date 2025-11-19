/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { instance, mock, reset } from 'ts-mockito'
import { MatrixMessagingService } from '../../../../../../src/private/data/messaging/matrixMessagingService'
import { SessionManager } from '../../../../../../src/private/data/session/sessionManager'
import { GetMessageUseCase } from '../../../../../../src/private/domain/use-cases/messaging/getMessageUseCase'
import { HandleId } from '../../../../../../src/public'
import { EntityDataFactory } from '../../../../../data-factory/entity'

jest.mock('../../../../../../src/private/data/messaging/matrixMessagingService')

describe('GetMessageUseCase Test Suite', () => {
  const mockSessionManager = mock<SessionManager>()

  let instanceUnderTest: GetMessageUseCase

  beforeEach(() => {
    reset(mockSessionManager)

    instanceUnderTest = new GetMessageUseCase(instance(mockSessionManager))
  })

  describe('execute', () => {
    it('Retrieves a message successfully', async () => {
      const mockMatrixMessagingService = {
        get: jest.fn().mockResolvedValue(EntityDataFactory.message),
      }
      ;(MatrixMessagingService as unknown as jest.Mock).mockReturnValue(
        mockMatrixMessagingService,
      )

      const handleId = new HandleId('handleId')
      const recipient = new HandleId('testRecipientHandleId')
      const messageId = 'testMessageId'
      const result = await instanceUnderTest.execute({
        handleId,
        recipient,
        messageId,
      })

      expect(result).toStrictEqual(EntityDataFactory.message)
      expect(mockMatrixMessagingService.get).toHaveBeenCalledWith({
        messageId,
        recipient,
      })
    })

    it('Retrieves a message including read receipts and reaction data successfully', async () => {
      const mockMatrixMessagingService = {
        get: jest.fn().mockResolvedValue(EntityDataFactory.message),
      }
      ;(MatrixMessagingService as unknown as jest.Mock).mockReturnValue(
        mockMatrixMessagingService,
      )

      const handleId = new HandleId('handleId')
      const recipient = new HandleId('testRecipientHandleId')
      const messageId = 'testMessageId'
      const result = await instanceUnderTest.execute({
        handleId,
        recipient,
        messageId,
      })

      expect(result).toStrictEqual(EntityDataFactory.message)
      expect(mockMatrixMessagingService.get).toHaveBeenCalledWith({
        messageId,
        recipient,
      })
    })

    it('completes successfully with undefined result', async () => {
      const mockMatrixMessagingService = {
        get: jest.fn().mockResolvedValue(undefined),
      }
      ;(MatrixMessagingService as unknown as jest.Mock).mockReturnValue(
        mockMatrixMessagingService,
      )

      const handleId = new HandleId('handleId')
      const recipient = new HandleId('recipient')
      const messageId = 'testMessageId'
      const result = await instanceUnderTest.execute({
        handleId,
        recipient,
        messageId,
      })

      expect(result).toStrictEqual(undefined)
      expect(mockMatrixMessagingService.get).toHaveBeenCalledWith({
        messageId,
        recipient,
      })
    })
  })
})
