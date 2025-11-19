/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { instance, mock, reset } from 'ts-mockito'
import { MatrixSecurityService } from '../../../../../../src/private/data/security/matrixSecurityService'
import { SessionManager } from '../../../../../../src/private/data/session/sessionManager'
import { CancelVerificationUseCase } from '../../../../../../src/private/domain/use-cases/security/cancelVerificationUseCase'
import { HandleId } from '../../../../../../src/public'

describe('CancelVerificationUseCase Test Suite', () => {
  const mockSessionManager = mock<SessionManager>()

  let instanceUnderTest: CancelVerificationUseCase

  beforeEach(() => {
    reset(mockSessionManager)

    instanceUnderTest = new CancelVerificationUseCase(
      instance(mockSessionManager),
    )
  })

  describe('execute', () => {
    it('Cancels a verification successfully', async () => {
      const handleId = new HandleId('handleId')

      jest
        .spyOn(MatrixSecurityService.prototype, 'cancelVerification')
        .mockResolvedValue(undefined)

      await expect(
        instanceUnderTest.execute({
          handleId,
        }),
      ).resolves.not.toThrow()

      expect(
        MatrixSecurityService.prototype.cancelVerification,
      ).toHaveBeenCalled()
    })
  })
})
