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
 * Input for `LeaveChannelUseCase`.
 *
 * @interface LeaveChannelUseCaseInput
 */
interface LeaveChannelUseCaseInput {
  handleId: HandleId
  channelId: ChannelId
}

/**
 * Application business logic for removing a handle from a channel.
 */
export class LeaveChannelUseCase {
  private readonly log: Logger

  public constructor(private readonly sessionManager: SessionManager) {
    this.log = new DefaultLogger(this.constructor.name)
  }

  async execute(input: LeaveChannelUseCaseInput): Promise<void> {
    this.log.debug(this.constructor.name, {
      input,
    })
    await this.leaveChannel(input)
    // Delay to allow room to be fully returned by matrix
    await delay(3000)
  }

  private async leaveChannel(input: LeaveChannelUseCaseInput): Promise<void> {
    const matrixClient = await this.sessionManager.getMatrixClient(
      input.handleId,
    )
    const matrixRoomsService = new MatrixRoomsService(matrixClient)
    return await matrixRoomsService.leave(input.channelId.toString())
  }
}
