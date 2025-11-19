/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { DefaultLogger, Logger } from '@sudoplatform/sudo-common'
import { HandleId, SecureCommsError } from '../../../../public'
import { MatrixSecurityService } from '../../../data/security/matrixSecurityService'
import { SessionManager } from '../../../data/session/sessionManager'

/**
 * Input for `RotateBackupKeyUseCase`.
 *
 * @interface RotateBackupKeyUseCaseInput
 */
interface RotateBackupKeyUseCaseInput {
  handleId: HandleId
}

/**
 * Use case for rotating a backup key.
 */
export class RotateBackupKeyUseCase {
  private readonly log: Logger

  constructor(private readonly sessionManager: SessionManager) {
    this.log = new DefaultLogger(this.constructor.name)
  }

  async execute(input: RotateBackupKeyUseCaseInput): Promise<string> {
    this.log.debug(this.constructor.name, { input })

    const matrixClient = await this.sessionManager.getMatrixClient(
      input.handleId,
    )
    const securityService = new MatrixSecurityService(matrixClient)

    const recoveryKey = await securityService.rotateBackupKey()
    if (!recoveryKey) {
      throw new SecureCommsError('Failed to rotate key backup')
    }
    return recoveryKey
  }
}
