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
 * Input for `AcceptInvitationUseCase`.
 *
 * @interface AcceptInvitationUseCaseInput
 */
interface AcceptInvitationUseCaseInput {
  handleId: HandleId
  groupId: GroupId
}

/**
 * Application business logic for accepting an invitation to join a group.
 */
export class AcceptInvitationUseCase {
  private readonly log: Logger

  public constructor(private readonly sessionManager: SessionManager) {
    this.log = new DefaultLogger(this.constructor.name)
  }

  async execute(input: AcceptInvitationUseCaseInput): Promise<void> {
    this.log.debug(this.constructor.name, {
      input,
    })
    await this.acceptInvitation(input)
    // Delay to allow room members to be updated by matrix
    await delay(3000)
  }

  private async acceptInvitation(
    input: AcceptInvitationUseCaseInput,
  ): Promise<void> {
    {
      const matrixClient = await this.sessionManager.getMatrixClient(
        input.handleId,
      )
      const matrixRoomsService = new MatrixRoomsService(matrixClient)
      await matrixRoomsService.join(input.groupId.toString())
    }
  }
}
