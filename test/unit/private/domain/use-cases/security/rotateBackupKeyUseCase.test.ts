/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { instance, mock, reset } from 'ts-mockito'
import { MatrixSecurityService } from '../../../../../../src/private/data/security/matrixSecurityService'
import { SessionManager } from '../../../../../../src/private/data/session/sessionManager'
import { RotateBackupKeyUseCase } from '../../../../../../src/private/domain/use-cases/security/rotateBackupKeyUseCase'
import { HandleId } from '../../../../../../src/public'

describe('RotateBackupKeyUseCase Test Suite', () => {
  const mockSessionManager = mock<SessionManager>()

  let instanceUnderTest: RotateBackupKeyUseCase

  beforeEach(() => {
    reset(mockSessionManager)

    instanceUnderTest = new RotateBackupKeyUseCase(instance(mockSessionManager))
  })

  describe('execute', () => {
    it('Rotates a backup key successfully', async () => {
      const handleId = new HandleId('handleId')

      jest
        .spyOn(MatrixSecurityService.prototype, 'rotateBackupKey')
        .mockResolvedValue('backupKey')

      await expect(
        instanceUnderTest.execute({
          handleId,
        }),
      ).resolves.not.toThrow()

      expect(MatrixSecurityService.prototype.rotateBackupKey).toHaveBeenCalled()
    })
  })
})
