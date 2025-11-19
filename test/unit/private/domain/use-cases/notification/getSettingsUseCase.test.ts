/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { instance, mock, reset } from 'ts-mockito'
import { DefaultNotificationService } from '../../../../../../src/private/data/notification/defaultNotificationService'
import { SessionManager } from '../../../../../../src/private/data/session/sessionManager'
import { GetSettingsUseCase } from '../../../../../../src/private/domain/use-cases/notifications/getSettingsUseCase'
import { HandleId } from '../../../../../../src/public'

jest.mock(
  '../../../../../../src/private/data/notification/defaultNotificationService',
)

describe('GetSettingsUseCase Test Suite', () => {
  const mockSessionManager = mock<SessionManager>()

  let instanceUnderTest: GetSettingsUseCase

  beforeEach(() => {
    reset(mockSessionManager)

    instanceUnderTest = new GetSettingsUseCase(instance(mockSessionManager))
  })

  describe('execute', () => {
    it('Gets settings successfully', async () => {
      const mockNotificationService = {
        getSettings: jest.fn().mockResolvedValue(undefined),
      }
      ;(DefaultNotificationService as unknown as jest.Mock).mockReturnValue(
        mockNotificationService,
      )

      const handleId = new HandleId('handleId')
      await expect(
        instanceUnderTest.execute({
          handleId,
        }),
      ).resolves.not.toThrow()

      expect(mockNotificationService.getSettings).toHaveBeenCalled()
    })
  })
})
