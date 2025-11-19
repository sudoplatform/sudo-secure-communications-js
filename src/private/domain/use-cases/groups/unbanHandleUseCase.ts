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
 * Input for `UnbanHandleUseCase`.
 *
 * @interface UnbanHandleUseCaseInput
 */
interface UnbanHandleUseCaseInput {
  handleId: HandleId
  groupId: GroupId
  targetHandleId: HandleId
  reason?: string
}

/**
 * Application business logic for unbanning a handle from a group.
 */
export class UnbanHandleUseCase {
  private readonly log: Logger

  public constructor(private readonly sessionManager: SessionManager) {
    this.log = new DefaultLogger(this.constructor.name)
  }

  async execute(input: UnbanHandleUseCaseInput): Promise<void> {
    this.log.debug(this.constructor.name, {
      input,
    })
    await this.unbanHandle(input)
    // Delay to allow room members to be updated by matrix
    await delay(3000)
  }

  private async unbanHandle(input: UnbanHandleUseCaseInput): Promise<void> {
    {
      const matrixClient = await this.sessionManager.getMatrixClient(
        input.handleId,
      )
      const matrixRoomsService = new MatrixRoomsService(matrixClient)
      await matrixRoomsService.unbanHandle({
        roomId: input.groupId.toString(),
        targetHandleId: input.targetHandleId.toString(),
        reason: input.reason,
      })
    }
  }
}
