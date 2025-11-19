/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { instance, mock, reset } from 'ts-mockito'
import { MatrixSecurityService } from '../../../../../../src/private/data/security/matrixSecurityService'
import { SessionManager } from '../../../../../../src/private/data/session/sessionManager'
import { OnSessionVerificationChangedUseCase } from '../../../../../../src/private/domain/use-cases/security/onSessionVerificationChangedUseCase'
import { HandleId } from '../../../../../../src/public'

describe('onSessionVerificationChangedUseCase Test Suite', () => {
  const mockSessionManager = mock<SessionManager>()

  let instanceUnderTest: OnSessionVerificationChangedUseCase

  beforeEach(() => {
    reset(mockSessionManager)

    instanceUnderTest = new OnSessionVerificationChangedUseCase(
      instance(mockSessionManager),
    )
  })

  describe('execute', () => {
    it('Registers a handler for session verification changed events', async () => {
      const handleId = new HandleId('handleId')
      const handler = jest.fn()

      jest
        .spyOn(MatrixSecurityService.prototype, 'onSessionVerificationChanged')
        .mockImplementation(() => {})

      await expect(
        instanceUnderTest.execute({
          handleId,
          handler,
        }),
      ).resolves.not.toThrow()

      expect(
        MatrixSecurityService.prototype.onSessionVerificationChanged,
      ).toHaveBeenCalledWith(handler)
    })
  })
})
