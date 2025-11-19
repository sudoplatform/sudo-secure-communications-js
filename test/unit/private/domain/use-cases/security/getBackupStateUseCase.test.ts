/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { instance, mock, reset } from 'ts-mockito'
import { MatrixSecurityService } from '../../../../../../src/private/data/security/matrixSecurityService'
import { SessionManager } from '../../../../../../src/private/data/session/sessionManager'
import { GetBackupStateUseCase } from '../../../../../../src/private/domain/use-cases/security/getBackupStateUseCase'
import { BackupState, HandleId } from '../../../../../../src/public'

describe('GetBackupStateUseCase Test Suite', () => {
  const mockSessionManager = mock<SessionManager>()

  let instanceUnderTest: GetBackupStateUseCase

  beforeEach(() => {
    reset(mockSessionManager)

    instanceUnderTest = new GetBackupStateUseCase(instance(mockSessionManager))
  })

  describe('execute', () => {
    it('Gets a backup state successfully', async () => {
      const handleId = new HandleId('handleId')

      jest
        .spyOn(MatrixSecurityService.prototype, 'getBackupState')
        .mockResolvedValue(BackupState.backupOnServer)

      await expect(
        instanceUnderTest.execute({
          handleId,
        }),
      ).resolves.not.toThrow()

      expect(MatrixSecurityService.prototype.getBackupState).toHaveBeenCalled()
    })
  })
})
