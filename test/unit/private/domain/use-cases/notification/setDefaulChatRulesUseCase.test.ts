/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { instance, mock, reset } from 'ts-mockito'
import { DefaultNotificationService } from '../../../../../../src/private/data/notification/defaultNotificationService'
import { SessionManager } from '../../../../../../src/private/data/session/sessionManager'
import { SetDefaultChatRulesUseCase } from '../../../../../../src/private/domain/use-cases/notifications/setDefaultChatRulesUseCase'
import {
  HandleId,
  MessageNotificationLevel,
} from '../../../../../../src/public'

jest.mock(
  '../../../../../../src/private/data/notification/defaultNotificationService',
)

describe('SetDefaultChatRulesUseCase Test Suite', () => {
  const mockSessionManager = mock<SessionManager>()

  let instanceUnderTest: SetDefaultChatRulesUseCase

  beforeEach(() => {
    reset(mockSessionManager)

    instanceUnderTest = new SetDefaultChatRulesUseCase(
      instance(mockSessionManager),
    )
  })

  describe('execute', () => {
    it('Sets default chat rules successfully', async () => {
      const mockNotificationService = {
        setDefaultChatRules: jest.fn().mockResolvedValue(undefined),
      }
      ;(DefaultNotificationService as unknown as jest.Mock).mockReturnValue(
        mockNotificationService,
      )

      const input = {
        handleId: new HandleId('handleId'),
        chatRules: {
          messageLevel: MessageNotificationLevel.allMessages,
        },
      }

      await expect(instanceUnderTest.execute(input)).resolves.not.toThrow()

      expect(mockNotificationService.setDefaultChatRules).toHaveBeenCalledWith(
        input,
      )
    })
  })
})
