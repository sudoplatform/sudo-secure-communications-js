/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { instance, mock, reset } from 'ts-mockito'
import { MatrixMessagingService } from '../../../../../../src/private/data/messaging/matrixMessagingService'
import { SessionManager } from '../../../../../../src/private/data/session/sessionManager'
import { SearchMessagesUseCase } from '../../../../../../src/private/domain/use-cases/messaging/searchMessagesUseCase'
import { HandleId } from '../../../../../../src/public'
import { EntityDataFactory } from '../../../../../data-factory/entity'

jest.mock('../../../../../../src/private/data/messaging/matrixMessagingService')

describe('SearchMessagesUseCase Test Suite', () => {
  const mockSessionManager = mock<SessionManager>()

  let instanceUnderTest: SearchMessagesUseCase

  beforeEach(() => {
    reset(mockSessionManager)

    instanceUnderTest = new SearchMessagesUseCase(instance(mockSessionManager))
  })

  describe('execute', () => {
    it('Lists search message items successfully', async () => {
      const mockMatrixMessagingService = {
        searchMessages: jest.fn().mockResolvedValue({
          messages: [EntityDataFactory.searchMessageItem],
          nextToken: undefined,
        }),
      }
      ;(MatrixMessagingService as unknown as jest.Mock).mockReturnValue(
        mockMatrixMessagingService,
      )

      const handleId = new HandleId('testHandleId')
      const result = await instanceUnderTest.execute({
        handleId,
        searchText: 'testBody',
      })

      expect(result).toStrictEqual({
        messages: [EntityDataFactory.searchMessageItem],
        nextToken: undefined,
      })
      expect(mockMatrixMessagingService.searchMessages).toHaveBeenCalledWith({
        searchText: 'testBody',
      })
    })

    it('Lists search message items successfully with empty result', async () => {
      const mockMatrixMessagingService = {
        searchMessages: jest.fn().mockResolvedValue({
          messages: [],
          nextToken: undefined,
        }),
      }
      ;(MatrixMessagingService as unknown as jest.Mock).mockReturnValue(
        mockMatrixMessagingService,
      )

      const handleId = new HandleId('testHandleId')
      const result = await instanceUnderTest.execute({
        handleId,
        searchText: 'testBody',
      })

      expect(result).toStrictEqual({
        messages: [],
        nextToken: undefined,
      })
      expect(mockMatrixMessagingService.searchMessages).toHaveBeenCalledWith({
        searchText: 'testBody',
      })
    })
  })
})
