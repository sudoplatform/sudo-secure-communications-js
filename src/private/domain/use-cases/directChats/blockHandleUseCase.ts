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
 * Input for `BlockHandleUseCase`.
 *
 * @interface BlockHandleUseCaseInput
 */
interface BlockHandleUseCaseInput {
  handleId: HandleId
  handleIdToBlock: HandleId
}

/**
 * Application business logic to block a handle from a direct chat.
 */
export class BlockHandleUseCase {
  private readonly log: Logger

  public constructor(private readonly sessionManager: SessionManager) {
    this.log = new DefaultLogger(this.constructor.name)
  }

  async execute(input: BlockHandleUseCaseInput): Promise<void> {
    this.log.debug(this.constructor.name, {
      input,
    })
    await this.blockHandle(input)
    // Delay to allow direct chat members to be updated by matrix
    await delay(3000)
  }

  private async blockHandle(input: BlockHandleUseCaseInput): Promise<void> {
    {
      const matrixClient = await this.sessionManager.getMatrixClient(
        input.handleId,
      )
      const matrixDirectChatsService = new MatrixDirectChatsService(
        matrixClient,
      )
      await matrixDirectChatsService.blockHandle(
        input.handleIdToBlock.toString(),
      )
    }
  }
}
