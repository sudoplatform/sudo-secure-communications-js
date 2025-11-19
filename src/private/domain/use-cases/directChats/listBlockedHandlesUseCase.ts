/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { DefaultLogger, Logger } from '@sudoplatform/sudo-common'
import { HandleId } from '../../../../public'
import { MatrixDirectChatsService } from '../../../data/directChats/matrixDirectChatsService'
import { SessionManager } from '../../../data/session/sessionManager'
import { toHandleId } from '../../../util/id'

/**
 * Application business logic for listing all blocked handles.
 */
export class ListBlockedHandlesUseCase {
  private readonly log: Logger

  public constructor(private readonly sessionManager: SessionManager) {
    this.log = new DefaultLogger(this.constructor.name)
  }

  async execute(handleId: HandleId): Promise<HandleId[]> {
    this.log.debug(this.constructor.name, {
      handleId,
    })
    return await this.listBlockedHandles(handleId)
  }

  private async listBlockedHandles(handleId: HandleId): Promise<HandleId[]> {
    {
      const matrixClient = await this.sessionManager.getMatrixClient(handleId)
      const matrixDirectChatsService = new MatrixDirectChatsService(
        matrixClient,
      )
      const blockedIds = await matrixDirectChatsService.listBlockedHandles()
      return blockedIds.map((id) => toHandleId(id))
    }
  }
}
