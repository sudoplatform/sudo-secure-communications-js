/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { DefaultLogger, Logger } from '@sudoplatform/sudo-common'
import { GroupId, HandleId } from '../../../../public'
import { MatrixRoomsService } from '../../../data/rooms/matrixRoomsService'
import { SessionManager } from '../../../data/session/sessionManager'
import { delay } from '../../../util/delay'

/**
 * Input for `BanHandleUseCase`.
 *
 * @interface BanHandleUseCaseInput
 */
interface BanHandleUseCaseInput {
  handleId: HandleId
  groupId: GroupId
  targetHandleId: HandleId
  reason?: string
}

/**
 * Application business logic for banning a handle from a group.
 */
export class BanHandleUseCase {
  private readonly log: Logger

  public constructor(private readonly sessionManager: SessionManager) {
    this.log = new DefaultLogger(this.constructor.name)
  }

  async execute(input: BanHandleUseCaseInput): Promise<void> {
    this.log.debug(this.constructor.name, {
      input,
    })
    await this.banHandle(input)
    // Delay to allow room members to be updated by matrix
    await delay(3000)
  }

  private async banHandle(input: BanHandleUseCaseInput): Promise<void> {
    {
      const matrixClient = await this.sessionManager.getMatrixClient(
        input.handleId,
      )
      const matrixRoomsService = new MatrixRoomsService(matrixClient)
      await matrixRoomsService.banHandle({
        roomId: input.groupId.toString(),
        targetHandleId: input.targetHandleId.toString(),
        reason: input.reason,
      })
    }
  }
}
