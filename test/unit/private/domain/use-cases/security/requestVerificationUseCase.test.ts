/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { instance, mock, reset } from 'ts-mockito'
import { MatrixSecurityService } from '../../../../../../src/private/data/security/matrixSecurityService'
import { SessionManager } from '../../../../../../src/private/data/session/sessionManager'
import { RequestVerificationUseCase } from '../../../../../../src/private/domain/use-cases/security/requestVerificationUseCase'
import { HandleId } from '../../../../../../src/public'

describe('RequestVerificationUseCase Test Suite', () => {
  const mockSessionManager = mock<SessionManager>()

  let instanceUnderTest: RequestVerificationUseCase

  beforeEach(() => {
    reset(mockSessionManager)

    instanceUnderTest = new RequestVerificationUseCase(
      instance(mockSessionManager),
    )
  })

  describe('execute', () => {
    it('Requests a verification successfully', async () => {
      const handleId = new HandleId('handleId')

      jest
        .spyOn(MatrixSecurityService.prototype, 'requestVerification')
        .mockResolvedValue(undefined)

      await expect(
        instanceUnderTest.execute({
          handleId,
        }),
      ).resolves.not.toThrow()

      expect(
        MatrixSecurityService.prototype.requestVerification,
      ).toHaveBeenCalled()
    })
  })
})
