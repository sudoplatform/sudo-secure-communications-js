/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { instance, mock, reset } from 'ts-mockito'
import { MatrixMessagingService } from '../../../../../../src/private/data/messaging/matrixMessagingService'
import { SessionManager } from '../../../../../../src/private/data/session/sessionManager'
import { SendMessageUseCase } from '../../../../../../src/private/domain/use-cases/messaging/sendMessageUseCase'
import { HandleId } from '../../../../../../src/public'
import { EntityDataFactory } from '../../../../../data-factory/entity'

jest.mock('../../../../../../src/private/data/messaging/matrixMessagingService')

describe('SendMessageUseCase Test Suite', () => {
  const mockSessionManager = mock<SessionManager>()

  let instanceUnderTest: SendMessageUseCase

  beforeEach(() => {
    reset(mockSessionManager)

    instanceUnderTest = new SendMessageUseCase(instance(mockSessionManager))
  })

  describe('execute', () => {
    it('Sends a message successfully', async () => {
      const mockMatrixMessagingService = {
        sendMessage: jest.fn().mockResolvedValue(undefined),
      }
      ;(MatrixMessagingService as unknown as jest.Mock).mockReturnValue(
        mockMatrixMessagingService,
      )

      const handleId = new HandleId('handleId')
      const recipient = new HandleId('testRecipientHandleId')
      const message = 'Send a message'
      const mentions = [
        EntityDataFactory.messageHandleMention,
        EntityDataFactory.messageChatMention,
      ]
      await expect(
        instanceUnderTest.execute({
          handleId,
          recipient,
          message,
          mentions,
        }),
      ).resolves.not.toThrow()

      expect(mockMatrixMessagingService.sendMessage).toHaveBeenCalledWith({
        recipient,
        message,
        mentions,
      })
    })
  })
})
