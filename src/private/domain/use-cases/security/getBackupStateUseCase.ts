/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { DefaultLogger, Logger } from '@sudoplatform/sudo-common'
import { BackupState, HandleId } from '../../../../public'
import { MatrixSecurityService } from '../../../data/security/matrixSecurityService'
import { SessionManager } from '../../../data/session/sessionManager'

/**
 * Input for `GetBackupStateUseCase`.
 *
 * @interface GetBackupStateUseCaseInput
 */
interface GetBackupStateUseCaseInput {
  handleId: HandleId
}

/**
 * Use case for getting backup state.
 */
export class GetBackupStateUseCase {
  private readonly log: Logger

  constructor(private readonly sessionManager: SessionManager) {
    this.log = new DefaultLogger(this.constructor.name)
  }

  async execute(input: GetBackupStateUseCaseInput): Promise<BackupState> {
    this.log.debug(this.constructor.name, { input })

    const matrixClient = await this.sessionManager.getMatrixClient(
      input.handleId,
    )
    const securityService = new MatrixSecurityService(matrixClient)
    const backupState = await securityService.getBackupState()
    return backupState
  }
}
