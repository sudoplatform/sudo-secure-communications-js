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
 * Input for `AcceptVerificationUseCase`.
 *
 * @interface AcceptVerificationUseCaseInput
 */
interface AcceptVerificationUseCaseInput {
  handleId: HandleId
  senderId: HandleId
  flowId: string
}

/**
 * Use case for accepting a verification request.
 */
export class AcceptVerificationUseCase {
  private readonly log: Logger

  constructor(private readonly sessionManager: SessionManager) {
    this.log = new DefaultLogger(this.constructor.name)
  }

  async execute(input: AcceptVerificationUseCaseInput): Promise<void> {
    this.log.debug(this.constructor.name, { input })

    const matrixClient = await this.sessionManager.getMatrixClient(
      input.handleId,
    )
    const securityService = new MatrixSecurityService(matrixClient)
    await securityService.acceptVerificationRequest({
      senderId: input.senderId,
      flowId: input.flowId,
    })
  }
}
