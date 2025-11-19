/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { instance, mock, reset } from 'ts-mockito'
import { MatrixSecurityService } from '../../../../../../src/private/data/security/matrixSecurityService'
import { SessionManager } from '../../../../../../src/private/data/session/sessionManager'
import { ResetBackupKeyUseCase } from '../../../../../../src/private/domain/use-cases/security/resetBackupKeyUseCase'
import { HandleId } from '../../../../../../src/public'

describe('ResetBackupKeyUseCase Test Suite', () => {
  const mockSessionManager = mock<SessionManager>()

  let instanceUnderTest: ResetBackupKeyUseCase

  beforeEach(() => {
    reset(mockSessionManager)

    instanceUnderTest = new ResetBackupKeyUseCase(instance(mockSessionManager))
  })

  describe('execute', () => {
    it('Resets a backup key successfully', async () => {
      const handleId = new HandleId('handleId')

      jest
        .spyOn(MatrixSecurityService.prototype, 'resetBackupKey')
        .mockResolvedValue('backupId')

      await expect(
        instanceUnderTest.execute({
          handleId,
        }),
      ).resolves.not.toThrow()

      expect(MatrixSecurityService.prototype.resetBackupKey).toHaveBeenCalled()
    })
  })
})
