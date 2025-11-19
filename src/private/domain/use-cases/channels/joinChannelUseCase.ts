/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { DefaultLogger, Logger } from '@sudoplatform/sudo-common'
import { ChannelId, HandleId } from '../../../../public'
import { MatrixRoomsService } from '../../../data/rooms/matrixRoomsService'
import { SessionManager } from '../../../data/session/sessionManager'

/**
 * Input for `JoinChannelUseCase`.
 *
 * @interface JoinChannelUseCaseInput
 */
interface JoinChannelUseCaseInput {
  handleId: HandleId
  channelId: ChannelId
}

/**
 * Application business logic adding a handle to a channel.
 */
export class JoinChannelUseCase {
  private readonly log: Logger

  public constructor(private readonly sessionManager: SessionManager) {
    this.log = new DefaultLogger(this.constructor.name)
  }

  async execute(input: JoinChannelUseCaseInput): Promise<void> {
    this.log.debug(this.constructor.name, {
      input,
    })
    await this.joinChannel(input)
  }

  private async joinChannel(input: JoinChannelUseCaseInput): Promise<void> {
    {
      const matrixClient = await this.sessionManager.getMatrixClient(
        input.handleId,
      )
      const matrixRoomsService = new MatrixRoomsService(matrixClient)
      await matrixRoomsService.join(input.channelId.toString())
    }
  }
}
