/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { DefaultLogger, Logger } from '@sudoplatform/sudo-common'
import { HandleId } from '../../../../public'
import {
  ChannelSortOrderEntity,
  PublicChannelJoinRuleEntity,
  PublicChannelSearchResultEntity,
} from '../../entities/channels/channelEntity'
import { ChannelsService } from '../../entities/channels/channelsService'

/**
 * Input for `SearchPublicChannelsUseCase`.
 *
 * @interface SearchPublicChannelsUseCaseInput
 */
interface SearchPublicChannelsUseCaseInput {
  handleId: HandleId
  order: ChannelSortOrderEntity
  searchTerm?: string
  joinRule?: PublicChannelJoinRuleEntity
  isJoined?: boolean
  tags?: string[]
  limit?: number
  nextToken?: string
}

/**
 * Output for `SearchPublicChannelsUseCase`.
 *
 * @interface SearchPublicChannelsUseCaseOutput
 */
interface SearchPublicChannelsUseCaseOutput {
  channels: PublicChannelSearchResultEntity[]
  nextToken?: string
}

/**
 * Application business logic for searching for public channels based on some search criteria.
 */
export class SearchPublicChannelsUseCase {
  private readonly log: Logger

  public constructor(private readonly channelsService: ChannelsService) {
    this.log = new DefaultLogger(this.constructor.name)
  }

  async execute(
    input: SearchPublicChannelsUseCaseInput,
  ): Promise<SearchPublicChannelsUseCaseOutput> {
    this.log.debug(this.constructor.name, {
      input,
    })
    return await this.channelsService.search({
      selfHandleId: input.handleId.toString(),
      order: input.order,
      searchTerm: input.searchTerm,
      joinRule: input.joinRule,
      isJoined: input.isJoined,
      tags: input.tags,
      limit: input.limit,
      nextToken: input.nextToken,
    })
  }
}
