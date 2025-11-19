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
 * Input for `ResetBackupKeyUseCase`.
 *
 * @interface ResetBackupKeyUseCaseInput
 */
interface ResetBackupKeyUseCaseInput {
  handleId: HandleId
}

/**
 * Use case for resetting a backup key.
 */
export class ResetBackupKeyUseCase {
  private readonly log: Logger

  constructor(private readonly sessionManager: SessionManager) {
    this.log = new DefaultLogger(this.constructor.name)
  }

  async execute(input: ResetBackupKeyUseCaseInput): Promise<string> {
    this.log.debug(this.constructor.name, { input })

    const matrixClient = await this.sessionManager.getMatrixClient(
      input.handleId,
    )
    const securityService = new MatrixSecurityService(matrixClient)

    const recoveryKey = await securityService.resetBackupKey()
    if (!recoveryKey) {
      throw new SecureCommsError('Failed to reset key backup')
    }
    return recoveryKey
  }
}
