/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { instance, mock, reset } from 'ts-mockito'
import { MatrixMessagingService } from '../../../../../../src/private/data/messaging/matrixMessagingService'
import { SessionManager } from '../../../../../../src/private/data/session/sessionManager'
import { GetMessagesUseCase } from '../../../../../../src/private/domain/use-cases/messaging/getMessagesUseCase'
import { HandleId } from '../../../../../../src/public'
import { EntityDataFactory } from '../../../../../data-factory/entity'

jest.mock('../../../../../../src/private/data/messaging/matrixMessagingService')

describe('GetMessagesUseCase Test Suite', () => {
  const mockSessionManager = mock<SessionManager>()

  let instanceUnderTest: GetMessagesUseCase

  beforeEach(() => {
    reset(mockSessionManager)

    instanceUnderTest = new GetMessagesUseCase(instance(mockSessionManager))
  })

  describe('execute', () => {
    it('Lists messages successfully', async () => {
      const mockMatrixMessagingService = {
        list: jest.fn().mockResolvedValue({
          messages: [EntityDataFactory.message],
          nextToken: undefined,
        }),
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

      expect(result).toStrictEqual({
        messages: [EntityDataFactory.message],
        nextToken: undefined,
      })
      expect(mockMatrixMessagingService.list).toHaveBeenCalledWith({
        handleId,
        recipient,
      })
    })

    it('Lists messages including read receipts and reaction data successfully', async () => {
      const mockMatrixMessagingService = {
        list: jest.fn().mockResolvedValue({
          messages: [EntityDataFactory.message],
          nextToken: undefined,
        }),
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

      expect(result).toStrictEqual({
        messages: [EntityDataFactory.message],
        nextToken: undefined,
      })
      expect(mockMatrixMessagingService.list).toHaveBeenCalledWith({
        handleId,
        recipient,
      })
    })

    it('Lists messages successfully with empty result', async () => {
      const mockMatrixMessagingService = {
        list: jest.fn().mockResolvedValue({
          messages: [],
          nextToken: undefined,
        }),
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

      expect(result).toStrictEqual({
        messages: [],
        nextToken: undefined,
      })
      expect(mockMatrixMessagingService.list).toHaveBeenCalledWith({
        handleId,
        recipient,
      })
    })
  })
})
