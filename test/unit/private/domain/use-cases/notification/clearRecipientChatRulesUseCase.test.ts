/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { instance, mock, reset } from 'ts-mockito'
import { DefaultNotificationService } from '../../../../../../src/private/data/notification/defaultNotificationService'
import { SessionManager } from '../../../../../../src/private/data/session/sessionManager'
import { ClearRecipientChatRulesUseCase } from '../../../../../../src/private/domain/use-cases/notifications/clearRecipientChatRulesUseCase'
import { HandleId } from '../../../../../../src/public'

jest.mock(
  '../../../../../../src/private/data/notification/defaultNotificationService',
)

describe('ClearRecipientChatRulesUseCase Test Suite', () => {
  const mockSessionManager = mock<SessionManager>()

  let instanceUnderTest: ClearRecipientChatRulesUseCase

  beforeEach(() => {
    reset(mockSessionManager)

    instanceUnderTest = new ClearRecipientChatRulesUseCase(
      instance(mockSessionManager),
    )
  })

  describe('execute', () => {
    it('Clears recipient chat rules successfully', async () => {
      const mockNotificationService = {
        clearRecipientChatRules: jest.fn().mockResolvedValue(undefined),
      }
      ;(DefaultNotificationService as unknown as jest.Mock).mockReturnValue(
        mockNotificationService,
      )

      const handleId = new HandleId('handleId')
      const recipient = new HandleId('testRecipientHandleId')
      await expect(
        instanceUnderTest.execute({
          handleId,
          recipient,
        }),
      ).resolves.not.toThrow()

      expect(
        mockNotificationService.clearRecipientChatRules,
      ).toHaveBeenCalledWith({
        recipient,
      })
    })
  })
})
