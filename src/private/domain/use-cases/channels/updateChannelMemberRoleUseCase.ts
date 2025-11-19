/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { DefaultLogger, Logger } from '@sudoplatform/sudo-common'
import { ChannelId, HandleId } from '../../../../public'
import { ChannelPowerLevelsTransformer } from '../../../data/channels/transformer/channelPowerLevelsTransformer'
import { MatrixRoomsService } from '../../../data/rooms/matrixRoomsService'
import { SessionManager } from '../../../data/session/sessionManager'
import { delay } from '../../../util/delay'
import { ChannelRoleEntity } from '../../entities/channels/channelEntity'
import { UpdateRoomMemberPowerLevelInput } from '../../entities/rooms/roomsService'

/**
 * Input for `UpdateChannelMemberRoleUseCase`.
 *
 * @interface UpdateChannelMemberRoleUseCaseInput
 */
interface UpdateChannelMemberRoleUseCaseInput {
  handleId: HandleId
  channelId: ChannelId
  targetHandleId: HandleId
  role: ChannelRoleEntity
}

/**
 * Application business logic for updating the role of a channel member in a channel.
 */
export class UpdateChannelMemberRoleUseCase {
  private readonly log: Logger

  public constructor(private readonly sessionManager: SessionManager) {
    this.log = new DefaultLogger(this.constructor.name)
  }

  async execute(input: UpdateChannelMemberRoleUseCaseInput): Promise<void> {
    this.log.debug(this.constructor.name, {
      input,
    })
    const powerLevelTransformer = new ChannelPowerLevelsTransformer()
    const powerLevel = powerLevelTransformer.fromEntityToPowerLevel(input.role)
    await this.updateChannelMemberRole(input.handleId, {
      roomId: input.channelId.toString(),
      targetHandleId: input.targetHandleId.toString(),
      powerLevel,
    })
    // Delay to allow room to be fully returned by matrix
    await delay(3000)
  }

  private async updateChannelMemberRole(
    handleId: HandleId,
    input: UpdateRoomMemberPowerLevelInput,
  ): Promise<void> {
    const matrixClient = await this.sessionManager.getMatrixClient(handleId)
    const matrixRoomsService = new MatrixRoomsService(matrixClient)
    await matrixRoomsService.updateRoomMemberPowerLevel(input)
  }
}
