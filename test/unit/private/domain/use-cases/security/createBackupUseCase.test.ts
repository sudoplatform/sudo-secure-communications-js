/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { instance, mock, reset } from 'ts-mockito'
import { MatrixSecurityService } from '../../../../../../src/private/data/security/matrixSecurityService'
import { SessionManager } from '../../../../../../src/private/data/session/sessionManager'
import { CreateBackupUseCase } from '../../../../../../src/private/domain/use-cases/security/createBackupUseCase'
import { HandleId } from '../../../../../../src/public'

describe('CreateBackupUseCase Test Suite', () => {
  const mockSessionManager = mock<SessionManager>()

  let instanceUnderTest: CreateBackupUseCase

  beforeEach(() => {
    reset(mockSessionManager)

    instanceUnderTest = new CreateBackupUseCase(instance(mockSessionManager))
  })

  describe('execute', () => {
    it('Creates a backup successfully', async () => {
      const handleId = new HandleId('handleId')

      jest
        .spyOn(MatrixSecurityService.prototype, 'createBackup')
        .mockResolvedValue('backupId')

      await expect(
        instanceUnderTest.execute({
          handleId,
        }),
      ).resolves.not.toThrow()

      expect(MatrixSecurityService.prototype.createBackup).toHaveBeenCalled()
    })
  })
})
