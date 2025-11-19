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
 * Input for `LeaveGroupUseCase`.
 *
 * @interface LeaveGroupUseCaseInput
 */
interface LeaveGroupUseCaseInput {
  handleId: HandleId
  groupId: GroupId
}

/**
 * Application business logic for removing a handle from a group.
 */
export class LeaveGroupUseCase {
  private readonly log: Logger

  public constructor(private readonly sessionManager: SessionManager) {
    this.log = new DefaultLogger(this.constructor.name)
  }

  async execute(input: LeaveGroupUseCaseInput): Promise<void> {
    this.log.debug(this.constructor.name, {
      input,
    })
    await this.leaveGroup(input.handleId, input.groupId.toString())
    // Delay to allow room to be fully returned by matrix
    await delay(3000)
  }

  private async leaveGroup(handleId: HandleId, groupId: string): Promise<void> {
    const matrixClient = await this.sessionManager.getMatrixClient(handleId)
    const matrixRoomsService = new MatrixRoomsService(matrixClient)
    return await matrixRoomsService.leave(groupId)
  }
}
