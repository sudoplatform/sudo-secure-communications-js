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
 * Input for `IsVerifiedUseCase`.
 *
 * @interface IsVerifiedUseCaseInput
 */
interface IsVerifiedUseCaseInput {
  handleId: HandleId
}

/**
 * Use case for checking if current session is verified.
 */
export class IsVerifiedUseCase {
  private readonly log: Logger

  constructor(private readonly sessionManager: SessionManager) {
    this.log = new DefaultLogger(this.constructor.name)
  }

  async execute(input: IsVerifiedUseCaseInput): Promise<boolean> {
    this.log.debug(this.constructor.name, { input })

    const matrixClient = await this.sessionManager.getMatrixClient(
      input.handleId,
    )
    const securityService = new MatrixSecurityService(matrixClient)

    const isVerified = await securityService.isVerified()
    return isVerified
  }
}
