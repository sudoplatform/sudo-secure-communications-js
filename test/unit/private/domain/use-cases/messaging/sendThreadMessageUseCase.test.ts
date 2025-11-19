/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { instance, mock, reset } from 'ts-mockito'
import { MatrixMessagingService } from '../../../../../../src/private/data/messaging/matrixMessagingService'
import { SessionManager } from '../../../../../../src/private/data/session/sessionManager'
import { SendThreadMessageUseCase } from '../../../../../../src/private/domain/use-cases/messaging/sendThreadMessageUseCase'
import { HandleId } from '../../../../../../src/public'
import { EntityDataFactory } from '../../../../../data-factory/entity'

jest.mock('../../../../../../src/private/data/messaging/matrixMessagingService')

describe('SendThreadMessageUseCase Test Suite', () => {
  const mockSessionManager = mock<SessionManager>()

  let instanceUnderTest: SendThreadMessageUseCase

  beforeEach(() => {
    reset(mockSessionManager)

    instanceUnderTest = new SendThreadMessageUseCase(
      instance(mockSessionManager),
    )
  })

  describe('execute', () => {
    it('Sends a thread message successfully', async () => {
      const mockMatrixMessagingService = {
        sendThread: jest.fn().mockResolvedValue(undefined),
      }
      ;(MatrixMessagingService as unknown as jest.Mock).mockReturnValue(
        mockMatrixMessagingService,
      )

      const handleId = new HandleId('handleId')
      const recipient = new HandleId('testRecipientHandleId')
      const message = 'Send a message'
      const threadId = 'threadId'
      const mentions = [
        EntityDataFactory.messageHandleMention,
        EntityDataFactory.messageChatMention,
      ]
      await expect(
        instanceUnderTest.execute({
          handleId,
          recipient,
          message,
          threadId,
          mentions,
        }),
      ).resolves.not.toThrow()

      expect(mockMatrixMessagingService.sendThread).toHaveBeenCalledWith({
        recipient,
        message,
        threadId,
        mentions,
      })
    })
  })
})
