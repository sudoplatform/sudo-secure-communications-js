/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { DefaultLogger, Logger } from '@sudoplatform/sudo-common'
import { VerificationRequest } from 'matrix-js-sdk/lib/crypto-api'
import { HandleId } from '../../../../public'
import { MatrixSecurityService } from '../../../data/security/matrixSecurityService'
import { SessionManager } from '../../../data/session/sessionManager'

/**
 * Input for `OnVerificationRequestReceivedUseCase`.
 *
 * @interface OnVerificationRequestReceivedUseCaseInput
 */
interface OnVerificationRequestReceivedUseCaseInput {
  handleId: HandleId
  handler: (state: VerificationRequest) => void
}

/**
 * Use case for registering a handler for verification request received events.
 */
export class OnVerificationRequestReceivedUseCase {
  private readonly log: Logger

  constructor(private readonly sessionManager: SessionManager) {
    this.log = new DefaultLogger(this.constructor.name)
  }

  async execute(
    input: OnVerificationRequestReceivedUseCaseInput,
  ): Promise<void> {
    this.log.debug(this.constructor.name, { input })

    const matrixClient = await this.sessionManager.getMatrixClient(
      input.handleId,
    )
    const securityService = new MatrixSecurityService(matrixClient)

    securityService.onVerificationRequestReceived(input.handler)
  }
}
