/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { DefaultLogger, Logger } from '@sudoplatform/sudo-common'
import { ChannelId, HandleId } from '../../../../public'
import { MatrixRoomsService } from '../../../data/rooms/matrixRoomsService'
import { SessionManager } from '../../../data/session/sessionManager'
import { delay } from '../../../util/delay'

/**
 * Input for `KickHandleUseCase`.
 *
 * @interface KickHandleUseCaseInput
 */
interface KickHandleUseCaseInput {
  handleId: HandleId
  channelId: ChannelId
  targetHandleId: HandleId
  reason?: string
}

/**
 * Application business logic for kicking a handle from a channel.
 */
export class KickHandleUseCase {
  private readonly log: Logger

  public constructor(private readonly sessionManager: SessionManager) {
    this.log = new DefaultLogger(this.constructor.name)
  }

  async execute(input: KickHandleUseCaseInput): Promise<void> {
    this.log.debug(this.constructor.name, {
      input,
    })
    await this.kickHandle(input)
    // Delay to allow channel members to be updated by matrix
    await delay(3000)
  }

  private async kickHandle(input: KickHandleUseCaseInput): Promise<void> {
    {
      const matrixClient = await this.sessionManager.getMatrixClient(
        input.handleId,
      )
      const matrixRoomsService = new MatrixRoomsService(matrixClient)
      await matrixRoomsService.kickHandle({
        roomId: input.channelId.toString(),
        targetHandleId: input.targetHandleId.toString(),
        reason: input.reason,
      })
    }
  }
}
