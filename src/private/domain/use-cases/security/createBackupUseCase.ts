/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { DefaultLogger, Logger } from '@sudoplatform/sudo-common'
import { HandleId } from '../../../../public'
import { MatrixSecurityService } from '../../../data/security/matrixSecurityService'
import { SessionManager } from '../../../data/session/sessionManager'

/**
 * Input for `CreateBackupUseCase`.
 *
 * @interface CreateBackupUseCaseInput
 */
interface CreateBackupUseCaseInput {
  handleId: HandleId
}

/**
 * Use case for creating a backup.
 */
export class CreateBackupUseCase {
  private readonly log: Logger

  constructor(private readonly sessionManager: SessionManager) {
    this.log = new DefaultLogger(this.constructor.name)
  }

  async execute(input: CreateBackupUseCaseInput): Promise<string> {
    this.log.debug(this.constructor.name, { input })

    const matrixClient = await this.sessionManager.getMatrixClient(
      input.handleId,
    )
    const securityService = new MatrixSecurityService(matrixClient)

    const backupKey = await securityService.createBackup()
    return backupKey
  }
}
