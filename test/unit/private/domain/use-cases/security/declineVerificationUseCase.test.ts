/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { instance, mock, reset } from 'ts-mockito'
import { MatrixSecurityService } from '../../../../../../src/private/data/security/matrixSecurityService'
import { SessionManager } from '../../../../../../src/private/data/session/sessionManager'
import { DeclineVerificationUseCase } from '../../../../../../src/private/domain/use-cases/security/declineVerificationUseCase'
import { HandleId } from '../../../../../../src/public'

describe('DeclineVerificationUseCase Test Suite', () => {
  const mockSessionManager = mock<SessionManager>()

  let instanceUnderTest: DeclineVerificationUseCase

  beforeEach(() => {
    reset(mockSessionManager)

    instanceUnderTest = new DeclineVerificationUseCase(
      instance(mockSessionManager),
    )
  })

  describe('execute', () => {
    it('Declines a verification successfully', async () => {
      const handleId = new HandleId('handleId')

      jest
        .spyOn(MatrixSecurityService.prototype, 'declineVerification')
        .mockResolvedValue(undefined)

      await expect(
        instanceUnderTest.execute({
          handleId,
        }),
      ).resolves.not.toThrow()

      expect(
        MatrixSecurityService.prototype.declineVerification,
      ).toHaveBeenCalled()
    })
  })
})
