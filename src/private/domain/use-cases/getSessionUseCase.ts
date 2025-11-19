/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { DefaultLogger, Logger } from '@sudoplatform/sudo-common'
import { SecureCommsSessionEntity } from '../entities/session/secureCommsSessionEntity'
import { SessionService } from '../entities/session/sessionService'

/**
 * Input for `GetSessionUseCase`.
 *
 * @interface GetSessionUseCaseInput
 */
interface GetSessionUseCaseInput {
  handleId: string
  deviceId: string
}

/**
 * Application business logic for retrieving secure comms session information.
 */
export class GetSessionUseCase {
  private readonly log: Logger

  public constructor(private readonly sessionService: SessionService) {
    this.log = new DefaultLogger(this.constructor.name)
  }

  async execute(
    input: GetSessionUseCaseInput,
  ): Promise<SecureCommsSessionEntity> {
    this.log.debug(this.constructor.name, {
      input,
    })
    return await this.sessionService.get({
      handleId: input.handleId,
      deviceId: input.deviceId,
    })
  }
}
