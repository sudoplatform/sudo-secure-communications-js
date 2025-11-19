/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { instance, mock, reset } from 'ts-mockito'
import { MatrixSecurityService } from '../../../../../../src/private/data/security/matrixSecurityService'
import { SessionManager } from '../../../../../../src/private/data/session/sessionManager'
import { ApproveVerificationUseCase } from '../../../../../../src/private/domain/use-cases/security/approveVerificationUseCase'
import { HandleId } from '../../../../../../src/public'

describe('ApproveVerificationUseCase Test Suite', () => {
  const mockSessionManager = mock<SessionManager>()

  let instanceUnderTest: ApproveVerificationUseCase

  beforeEach(() => {
    reset(mockSessionManager)

    instanceUnderTest = new ApproveVerificationUseCase(
      instance(mockSessionManager),
    )
  })

  describe('execute', () => {
    it('Approves a verification successfully', async () => {
      const handleId = new HandleId('handleId')

      jest
        .spyOn(MatrixSecurityService.prototype, 'approveVerification')
        .mockResolvedValue(undefined)

      await expect(
        instanceUnderTest.execute({
          handleId,
        }),
      ).resolves.not.toThrow()

      expect(
        MatrixSecurityService.prototype.approveVerification,
      ).toHaveBeenCalled()
    })
  })
})
