/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { instance, mock, reset } from 'ts-mockito'
import { MatrixSecurityService } from '../../../../../../src/private/data/security/matrixSecurityService'
import { SessionManager } from '../../../../../../src/private/data/session/sessionManager'
import { OnVerificationRequestReceivedUseCase } from '../../../../../../src/private/domain/use-cases/security/onVerificationRequestReceivedUseCase'
import { HandleId } from '../../../../../../src/public'

describe('onVerificationRequestReceivedUseCase Test Suite', () => {
  const mockSessionManager = mock<SessionManager>()

  let instanceUnderTest: OnVerificationRequestReceivedUseCase

  beforeEach(() => {
    reset(mockSessionManager)

    instanceUnderTest = new OnVerificationRequestReceivedUseCase(
      instance(mockSessionManager),
    )
  })

  describe('execute', () => {
    it('Registers a handler for verification request received events', async () => {
      const handleId = new HandleId('handleId')
      const handler = jest.fn()

      jest
        .spyOn(MatrixSecurityService.prototype, 'onVerificationRequestReceived')
        .mockImplementation(() => {})

      await expect(
        instanceUnderTest.execute({
          handleId,
          handler,
        }),
      ).resolves.not.toThrow()

      expect(
        MatrixSecurityService.prototype.onVerificationRequestReceived,
      ).toHaveBeenCalledWith(handler)
    })
  })
})
