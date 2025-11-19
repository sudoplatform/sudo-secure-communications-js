/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { DefaultLogger, Logger } from '@sudoplatform/sudo-common'
import { ChannelId, HandleId } from '../../../../public'
import { MatrixRoomsService } from '../../../data/rooms/matrixRoomsService'
import { SessionManager } from '../../../data/session/sessionManager'
import { MembershipStateEntity } from '../../entities/common/memberEntity'

/**
 * Input for `GetChannelMembershipUseCase`.
 *
 * @interface GetChannelMembershipUseCaseInput
 */
interface GetChannelMembershipUseCaseInput {
  handleId: HandleId
  channelId: ChannelId
}

/**
 * Application business logic for querying for the channel membership of this handle.
 */
export class GetChannelMembershipUseCase {
  private readonly log: Logger

  public constructor(private readonly sessionManager: SessionManager) {
    this.log = new DefaultLogger(this.constructor.name)
  }

  async execute(
    input: GetChannelMembershipUseCaseInput,
  ): Promise<MembershipStateEntity | undefined> {
    this.log.debug(this.constructor.name, {
      input,
    })
    return await this.getChannelMembership(input)
  }

  private async getChannelMembership(
    input: GetChannelMembershipUseCaseInput,
  ): Promise<MembershipStateEntity | undefined> {
    const matrixClient = await this.sessionManager.getMatrixClient(
      input.handleId,
    )
    const matrixRoomsService = new MatrixRoomsService(matrixClient)
    return await matrixRoomsService.getMembershipState({
      roomId: input.channelId.toString(),
      handleId: input.handleId.toString(),
    })
  }
}
