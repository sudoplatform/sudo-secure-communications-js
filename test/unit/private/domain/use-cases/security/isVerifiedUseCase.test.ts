/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { instance, mock, reset } from 'ts-mockito'
import { MatrixSecurityService } from '../../../../../../src/private/data/security/matrixSecurityService'
import { SessionManager } from '../../../../../../src/private/data/session/sessionManager'
import { IsVerifiedUseCase } from '../../../../../../src/private/domain/use-cases/security/isVerifiedUseCase'
import { HandleId } from '../../../../../../src/public'

describe('IsVerifiedUseCase Test Suite', () => {
  const mockSessionManager = mock<SessionManager>()

  let instanceUnderTest: IsVerifiedUseCase

  beforeEach(() => {
    reset(mockSessionManager)

    instanceUnderTest = new IsVerifiedUseCase(instance(mockSessionManager))
  })

  describe('execute', () => {
    it('Returns true if the current device is verified', async () => {
      const handleId = new HandleId('handleId')

      jest
        .spyOn(MatrixSecurityService.prototype, 'isVerified')
        .mockResolvedValue(true)

      await expect(
        instanceUnderTest.execute({
          handleId,
        }),
      ).resolves.toBe(true)

      expect(MatrixSecurityService.prototype.isVerified).toHaveBeenCalled()
    })

    it('Returns false if the current device is verified', async () => {
      const handleId = new HandleId('handleId')

      jest
        .spyOn(MatrixSecurityService.prototype, 'isVerified')
        .mockResolvedValue(false)

      await expect(
        instanceUnderTest.execute({
          handleId,
        }),
      ).resolves.toBe(false)

      expect(MatrixSecurityService.prototype.isVerified).toHaveBeenCalled()
    })
  })
})
