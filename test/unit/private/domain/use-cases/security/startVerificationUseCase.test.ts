/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { instance, mock, reset } from 'ts-mockito'
import { MatrixSecurityService } from '../../../../../../src/private/data/security/matrixSecurityService'
import { SessionManager } from '../../../../../../src/private/data/session/sessionManager'
import { StartVerificationUseCase } from '../../../../../../src/private/domain/use-cases/security/startVerificationUseCase'
import { HandleId } from '../../../../../../src/public'

describe('StartVerificationUseCase Test Suite', () => {
  const mockSessionManager = mock<SessionManager>()

  let instanceUnderTest: StartVerificationUseCase

  beforeEach(() => {
    reset(mockSessionManager)

    instanceUnderTest = new StartVerificationUseCase(
      instance(mockSessionManager),
    )
  })

  describe('execute', () => {
    it('Starts a verification successfully', async () => {
      const handleId = new HandleId('handleId')

      jest
        .spyOn(MatrixSecurityService.prototype, 'startVerification')
        .mockResolvedValue(undefined)

      await expect(
        instanceUnderTest.execute({
          handleId,
        }),
      ).resolves.not.toThrow()

      expect(
        MatrixSecurityService.prototype.startVerification,
      ).toHaveBeenCalled()
    })
  })
})
