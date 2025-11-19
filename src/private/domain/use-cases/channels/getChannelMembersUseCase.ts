/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { DefaultLogger, Logger } from '@sudoplatform/sudo-common'
import { ChannelId, HandleId } from '../../../../public'
import { ChannelMemberTransformer } from '../../../data/channels/transformer/channelMemberTransformer'
import { MatrixRoomsService } from '../../../data/rooms/matrixRoomsService'
import { SessionManager } from '../../../data/session/sessionManager'
import { ChannelMemberEntity } from '../../entities/common/memberEntity'

/**
 * Input for `GetChannelMembersUseCase`.
 *
 * @interface GetChannelMembersUseCaseInput
 */
interface GetChannelMembersUseCaseInput {
  handleId: HandleId
  channelId: ChannelId
}

/**
 * Application business logic for retrieving a list of channel members in a channel.
 */
export class GetChannelMembersUseCase {
  private readonly log: Logger

  public constructor(private readonly sessionManager: SessionManager) {
    this.log = new DefaultLogger(this.constructor.name)
  }

  async execute(
    input: GetChannelMembersUseCaseInput,
  ): Promise<ChannelMemberEntity[]> {
    this.log.debug(this.constructor.name, {
      input,
    })
    return await this.getChannelMembers(input)
  }

  private async getChannelMembers(
    input: GetChannelMembersUseCaseInput,
  ): Promise<ChannelMemberEntity[]> {
    const matrixClient = await this.sessionManager.getMatrixClient(
      input.handleId,
    )
    const matrixRoomsService = new MatrixRoomsService(matrixClient)
    const members = await matrixRoomsService.getMembers(
      input.channelId.toString(),
    )
    const transformer = new ChannelMemberTransformer()
    return members.map(transformer.fromRoomToEntity)
  }
}
