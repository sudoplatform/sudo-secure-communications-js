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
import { ChannelEntity } from '../../entities/channels/channelEntity'
import { ChannelsService } from '../../entities/channels/channelsService'
import { RoomEntity } from '../../entities/rooms/roomEntity'

/**
 * Input for `GetChannelUseCase`.
 *
 * @interface GetChannelUseCaseInput
 */
interface GetChannelUseCaseInput {
  handleId: HandleId
  channelId: ChannelId
}

/**
 * Application business logic for retrieving a channel.
 */
export class GetChannelUseCase {
  private readonly log: Logger

  public constructor(
    private readonly channelsService: ChannelsService,
    private readonly sessionManager: SessionManager,
  ) {
    this.log = new DefaultLogger(this.constructor.name)
  }

  async execute(
    input: GetChannelUseCaseInput,
  ): Promise<ChannelEntity | undefined> {
    this.log.debug(this.constructor.name, {
      input,
    })
    const channel = await this.channelsService.get(input.channelId.toString())
    if (!channel) {
      return undefined
    }
    const room = await this.getRoom(input)
    const memberCount = room?.memberCount ?? 0

    let powerLevels
    if (room?.powerLevels) {
      const transformer = new ChannelPowerLevelsTransformer()
      const powerLevelsMap = transformer.toPowerLevelsMap([room])
      powerLevels = powerLevelsMap.get(input.channelId.toString())
    }
    return {
      ...channel,
      ...(powerLevels ?? {}),
      memberCount,
    }
  }

  private async getRoom(
    input: GetChannelUseCaseInput,
  ): Promise<RoomEntity | undefined> {
    {
      const matrixClient = await this.sessionManager.getMatrixClient(
        input.handleId,
      )
      const matrixRoomsService = new MatrixRoomsService(matrixClient)
      return await matrixRoomsService.get(input.channelId.toString())
    }
  }
}
