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
import {
  ChannelsService,
  ListChannelsOutput,
} from '../../entities/channels/channelsService'
import { RoomEntity } from '../../entities/rooms/roomEntity'

/**
 * Input for `GetChannelsUseCase`.
 *
 * @interface GetChannelsUseCaseInput
 */
interface ListChannelsUseCaseInput {
  handleId: HandleId
  channelIds: ChannelId[]
}

/**
 * Application business logic for retrieving a list of channels.
 */
export class GetChannelsUseCase {
  private readonly log: Logger

  public constructor(
    private readonly channelsService: ChannelsService,
    private readonly sessionManager: SessionManager,
  ) {
    this.log = new DefaultLogger(this.constructor.name)
  }

  async execute(input: ListChannelsUseCaseInput): Promise<ChannelEntity[]> {
    this.log.debug(this.constructor.name, {
      input,
    })
    if (!input.channelIds.length) {
      return []
    }
    const channelIds = input.channelIds.map((id) => id.toString())

    const [rooms, channels] = await Promise.all([
      this.getRooms(input),
      this.channelsService.list(channelIds),
    ])
    const powerLevelsTransformer = new ChannelPowerLevelsTransformer()
    const powerLevelsMap = powerLevelsTransformer.toPowerLevelsMap(rooms)
    const memberCountMap = new Map<string, number>(
      rooms.map((room) => [room.roomId, room.memberCount]),
    )

    const processedChannels = await processChannelsResult(
      channels,
      this.channelsService,
      this.log,
    )
    return processedChannels.map((channel) => {
      const channelId = channel.channelId.toString()
      const powerLevels = powerLevelsMap.get(channelId)
      const memberCount = memberCountMap.get(channelId) ?? 0

      return powerLevels
        ? { ...channel, ...powerLevels, memberCount }
        : { ...channel, memberCount }
    })
  }

  private async getRooms(
    input: ListChannelsUseCaseInput,
  ): Promise<RoomEntity[]> {
    {
      const matrixClient = await this.sessionManager.getMatrixClient(
        input.handleId,
      )
      const matrixRoomsService = new MatrixRoomsService(matrixClient)
      return await matrixRoomsService.list(
        input.channelIds.map((channelId) => channelId.toString()),
      )
    }
  }
}

export async function processChannelsResult(
  result: ListChannelsOutput,
  channelsService: ChannelsService,
  log: Logger,
): Promise<ChannelEntity[]> {
  const channels = [...result.channels]
  if (result.unprocessedIds?.length) {
    // Try process the ids again
    const retryResult = await channelsService.list(result.unprocessedIds)
    channels.push(...retryResult.channels)
    if (retryResult.unprocessedIds?.length) {
      // Log ids which still could not be processed and move on
      log.error(
        `Could not process the following ids: ${retryResult.unprocessedIds}`,
      )
    }
  }
  return channels
}
