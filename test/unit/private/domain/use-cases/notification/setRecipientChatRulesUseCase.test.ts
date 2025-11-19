/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { instance, mock, reset } from 'ts-mockito'
import { DefaultNotificationService } from '../../../../../../src/private/data/notification/defaultNotificationService'
import { SessionManager } from '../../../../../../src/private/data/session/sessionManager'
import { SetRecipientChatRulesUseCase } from '../../../../../../src/private/domain/use-cases/notifications/setRecipientChatRulesUseCase'
import {
  HandleId,
  MessageNotificationLevel,
} from '../../../../../../src/public'

jest.mock(
  '../../../../../../src/private/data/notification/defaultNotificationService',
)

describe('SetRecipientChatRulesUseCase Test Suite', () => {
  const mockSessionManager = mock<SessionManager>()

  let instanceUnderTest: SetRecipientChatRulesUseCase

  beforeEach(() => {
    reset(mockSessionManager)

    instanceUnderTest = new SetRecipientChatRulesUseCase(
      instance(mockSessionManager),
    )
  })

  describe('execute', () => {
    it('Sets recipient chat rules successfully', async () => {
      const mockNotificationService = {
        setRecipientChatRules: jest.fn().mockResolvedValue(undefined),
      }
      ;(DefaultNotificationService as unknown as jest.Mock).mockReturnValue(
        mockNotificationService,
      )

      const input = {
        handleId: new HandleId('handleId'),
        recipient: new HandleId('recipientHandleId'),
        chatRules: {
          messageLevel: MessageNotificationLevel.allMessages,
        },
      }

      await expect(instanceUnderTest.execute(input)).resolves.not.toThrow()

      expect(
        mockNotificationService.setRecipientChatRules,
      ).toHaveBeenCalledWith(input)
    })
  })
})
