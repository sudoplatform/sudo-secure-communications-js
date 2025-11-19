/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { DefaultLogger, Logger } from '@sudoplatform/sudo-common'
import { HandleId } from '../../../../public'
import { MatrixDirectChatsService } from '../../../data/directChats/matrixDirectChatsService'
import { SessionManager } from '../../../data/session/sessionManager'
import { delay } from '../../../util/delay'

/**
 * Input for `UnblockHandleUseCase`.
 *
 * @interface UnblockHandleUseCaseInput
 */
interface UnblockHandleUseCaseInput {
  handleId: HandleId
  handleIdToUnblock: HandleId
}

/**
 * Application business logic to unblock a handle from a direct chat.
 */
export class UnblockHandleUseCase {
  private readonly log: Logger

  public constructor(private readonly sessionManager: SessionManager) {
    this.log = new DefaultLogger(this.constructor.name)
  }

  async execute(input: UnblockHandleUseCaseInput): Promise<void> {
    this.log.debug(this.constructor.name, {
      input,
    })
    await this.unblockHandle(input)
    // Delay to allow direct chat members to be updated by matrix
    await delay(3000)
  }

  private async unblockHandle(input: UnblockHandleUseCaseInput): Promise<void> {
    {
      const matrixClient = await this.sessionManager.getMatrixClient(
        input.handleId,
      )
      const matrixDirectChatsService = new MatrixDirectChatsService(
        matrixClient,
      )
      await matrixDirectChatsService.unblockHandle(
        input.handleIdToUnblock.toString(),
      )
    }
  }
}
