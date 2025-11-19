/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { instance, mock, reset } from 'ts-mockito'
import { DefaultNotificationService } from '../../../../../../src/private/data/notification/defaultNotificationService'
import { SessionManager } from '../../../../../../src/private/data/session/sessionManager'
import { SetDefaultEventRulesUseCase } from '../../../../../../src/private/domain/use-cases/notifications/setDefaultEventRulesUseCase'
import { HandleId } from '../../../../../../src/public'

jest.mock(
  '../../../../../../src/private/data/notification/defaultNotificationService',
)

describe('SetDefaultEventRulesUseCase Test Suite', () => {
  const mockSessionManager = mock<SessionManager>()

  let instanceUnderTest: SetDefaultEventRulesUseCase

  beforeEach(() => {
    reset(mockSessionManager)

    instanceUnderTest = new SetDefaultEventRulesUseCase(
      instance(mockSessionManager),
    )
  })

  describe('execute', () => {
    it('Sets default event rules successfully', async () => {
      const mockNotificationService = {
        setDefaultEventRules: jest.fn().mockResolvedValue(undefined),
      }
      ;(DefaultNotificationService as unknown as jest.Mock).mockReturnValue(
        mockNotificationService,
      )

      const input = {
        handleId: new HandleId('handleId'),
        eventRules: {
          invitations: true,
        },
      }

      await expect(instanceUnderTest.execute(input)).resolves.not.toThrow()

      expect(mockNotificationService.setDefaultEventRules).toHaveBeenCalledWith(
        input,
      )
    })
  })
})
