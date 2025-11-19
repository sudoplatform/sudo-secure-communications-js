/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { instance, mock, reset } from 'ts-mockito'
import { MatrixSecurityService } from '../../../../../../src/private/data/security/matrixSecurityService'
import { SessionManager } from '../../../../../../src/private/data/session/sessionManager'
import { AcceptVerificationUseCase } from '../../../../../../src/private/domain/use-cases/security/acceptVerificationUseCase'
import { HandleId } from '../../../../../../src/public'

describe('AcceptVerificationUseCase Test Suite', () => {
  const mockSessionManager = mock<SessionManager>()

  let instanceUnderTest: AcceptVerificationUseCase

  beforeEach(() => {
    reset(mockSessionManager)

    instanceUnderTest = new AcceptVerificationUseCase(
      instance(mockSessionManager),
    )
  })

  describe('execute', () => {
    it('Accepts a verification request successfully', async () => {
      const handleId = new HandleId('handleId')
      const senderId = new HandleId('senderId')
      const flowId = 'verificationFlowId'

      jest
        .spyOn(MatrixSecurityService.prototype, 'acceptVerificationRequest')
        .mockResolvedValue(undefined)

      await expect(
        instanceUnderTest.execute({
          handleId,
          senderId,
          flowId,
        }),
      ).resolves.not.toThrow()

      expect(
        MatrixSecurityService.prototype.acceptVerificationRequest,
      ).toHaveBeenCalledWith({ senderId, flowId })
    })
  })
})
