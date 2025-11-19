/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { instance, mock, reset } from 'ts-mockito'
import { MatrixMessagingService } from '../../../../../../src/private/data/messaging/matrixMessagingService'
import { SessionManager } from '../../../../../../src/private/data/session/sessionManager'
import { SendReplyMessageUseCase } from '../../../../../../src/private/domain/use-cases/messaging/sendReplyMessageUseCase'
import { HandleId } from '../../../../../../src/public'
import { EntityDataFactory } from '../../../../../data-factory/entity'

jest.mock('../../../../../../src/private/data/messaging/matrixMessagingService')

describe('SendReplyMessageUseCase Test Suite', () => {
  const mockSessionManager = mock<SessionManager>()

  let instanceUnderTest: SendReplyMessageUseCase

  beforeEach(() => {
    reset(mockSessionManager)

    instanceUnderTest = new SendReplyMessageUseCase(
      instance(mockSessionManager),
    )
  })

  describe('execute', () => {
    it('Sends a reply message successfully', async () => {
      const mockMatrixMessagingService = {
        sendReply: jest.fn().mockResolvedValue(undefined),
      }
      ;(MatrixMessagingService as unknown as jest.Mock).mockReturnValue(
        mockMatrixMessagingService,
      )

      const handleId = new HandleId('handleId')
      const recipient = new HandleId('testRecipientHandleId')
      const message = 'Send a message'
      const replyToMessageId = 'replyToMessageId'
      const mentions = [
        EntityDataFactory.messageHandleMention,
        EntityDataFactory.messageChatMention,
      ]
      await expect(
        instanceUnderTest.execute({
          handleId,
          recipient,
          message,
          replyToMessageId,
          mentions,
        }),
      ).resolves.not.toThrow()

      expect(mockMatrixMessagingService.sendReply).toHaveBeenCalledWith({
        recipient,
        message,
        replyToMessageId,
        mentions,
      })
    })
  })
})
