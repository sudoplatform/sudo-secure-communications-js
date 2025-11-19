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
 * Input for `OnSessionVerificationChangedUseCase`.
 *
 * @interface OnSessionVerificationChangedUseCaseInput
 */
interface OnSessionVerificationChangedUseCaseInput {
  handleId: HandleId
  handler: (state: boolean) => void
}

/**
 * Use case for registering a handler for session verification changed events.
 */
export class OnSessionVerificationChangedUseCase {
  private readonly log: Logger

  constructor(private readonly sessionManager: SessionManager) {
    this.log = new DefaultLogger(this.constructor.name)
  }

  async execute(
    input: OnSessionVerificationChangedUseCaseInput,
  ): Promise<void> {
    this.log.debug(this.constructor.name, { input })

    const matrixClient = await this.sessionManager.getMatrixClient(
      input.handleId,
    )
    const securityService = new MatrixSecurityService(matrixClient)

    securityService.onSessionVerificationChanged(input.handler)
  }
}
