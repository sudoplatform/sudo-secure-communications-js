/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { DefaultLogger, Logger } from '@sudoplatform/sudo-common'
import { HandleId } from '../../../../public'
import { SessionManager } from '../../../data/session/sessionManager'
import { OwnedHandleEntity } from '../../entities/handle/handleEntity'
import { HandleService } from '../../entities/handle/handleService'

/**
 * Application business logic for deprovisioning a handle.
 */
export class DeprovisionHandleUseCase {
  private readonly log: Logger

  public constructor(
    private readonly handleService: HandleService,
    private readonly sessionManager: SessionManager,
  ) {
    this.log = new DefaultLogger(this.constructor.name)
  }

  async execute(id: HandleId): Promise<OwnedHandleEntity> {
    this.log.debug(this.constructor.name, {
      id,
    })
    const handle = await this.handleService.delete(id.toString())
    await this.sessionManager.deleteSession(id, true)
    return handle
  }
}
