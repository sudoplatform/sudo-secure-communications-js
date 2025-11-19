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
 * Input for `SendInvitationsUseCase`.
 *
 * @interface SendInvitationsUseCaseInput
 */
interface SendInvitationsUseCaseInput {
  handleId: HandleId
  groupId: GroupId
  targetHandleIds: HandleId[]
}

/**
 * Application business logic for sending invitations to join a group.
 */
export class SendInvitationsUseCase {
  private readonly log: Logger

  public constructor(private readonly sessionManager: SessionManager) {
    this.log = new DefaultLogger(this.constructor.name)
  }

  async execute(input: SendInvitationsUseCaseInput): Promise<void> {
    this.log.debug(this.constructor.name, {
      input,
    })
    const targetHandleIds = input.targetHandleIds.map((id) => id.toString())
    await this.sendInvitations(
      input.handleId,
      input.groupId.toString(),
      targetHandleIds,
    )
    // Delay to allow room members to be updated by matrix
    await delay(3000)
  }

  private async sendInvitations(
    handleId: HandleId,
    groupId: string,
    targetHandleIds: string[],
  ): Promise<void> {
    {
      const matrixClient = await this.sessionManager.getMatrixClient(handleId)
      const matrixRoomsService = new MatrixRoomsService(matrixClient)
      await matrixRoomsService.sendInvitations({
        roomId: groupId,
        targetHandleIds,
      })
    }
  }
}
