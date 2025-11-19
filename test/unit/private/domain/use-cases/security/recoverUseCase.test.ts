/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { instance, mock, reset } from 'ts-mockito'
import { MatrixSecurityService } from '../../../../../../src/private/data/security/matrixSecurityService'
import { SessionManager } from '../../../../../../src/private/data/session/sessionManager'
import { RecoverUseCase } from '../../../../../../src/private/domain/use-cases/security/recoverUseCase'
import { HandleId } from '../../../../../../src/public'

describe('RecoverUseCase Test Suite', () => {
  const mockSessionManager = mock<SessionManager>()

  let instanceUnderTest: RecoverUseCase

  beforeEach(() => {
    reset(mockSessionManager)

    instanceUnderTest = new RecoverUseCase(instance(mockSessionManager))
  })

  describe('execute', () => {
    it('Recovers a backup successfully', async () => {
      const handleId = new HandleId('handleId')
      const backupKey = 'backupKey'

      jest
        .spyOn(MatrixSecurityService.prototype, 'recover')
        .mockResolvedValue(undefined)

      await expect(
        instanceUnderTest.execute({
          handleId,
          backupKey,
        }),
      ).resolves.not.toThrow()

      expect(MatrixSecurityService.prototype.recover).toHaveBeenCalledWith({
        backupKey,
      })
    })
  })
})
