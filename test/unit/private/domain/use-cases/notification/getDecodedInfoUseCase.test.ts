/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { instance, mock, reset } from 'ts-mockito'
import { DefaultNotificationService } from '../../../../../../src/private/data/notification/defaultNotificationService'
import { SessionManager } from '../../../../../../src/private/data/session/sessionManager'
import { GetDecodedInfoUseCase } from '../../../../../../src/private/domain/use-cases/notifications/getDecodedInfoUseCase'
import { HandleId } from '../../../../../../src/public'

jest.mock(
  '../../../../../../src/private/data/notification/defaultNotificationService',
)

describe('GetDecodedInfoUseCase Test Suite', () => {
  const mockSessionManager = mock<SessionManager>()

  let instanceUnderTest: GetDecodedInfoUseCase

  beforeEach(() => {
    reset(mockSessionManager)

    instanceUnderTest = new GetDecodedInfoUseCase(instance(mockSessionManager))
  })

  describe('execute', () => {
    it('Gets decoded info successfully', async () => {
      const mockNotificationService = {
        getDecodedInfo: jest.fn().mockResolvedValue(undefined),
      }
      ;(DefaultNotificationService as unknown as jest.Mock).mockReturnValue(
        mockNotificationService,
      )

      const input = {
        handleId: new HandleId('handleId'),
        eventId: 'eventId',
        roomId: 'roomId',
      }
      await expect(instanceUnderTest.execute(input)).resolves.not.toThrow()

      expect(mockNotificationService.getDecodedInfo).toHaveBeenCalledWith(input)
    })
  })
})
