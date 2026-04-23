/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { v4 } from 'uuid'
import { ChannelId } from '../../../public'
import {
  ChannelEntity,
  PublicChannelSearchResultEntity,
} from '../../domain/entities/channels/channelEntity'
import { ApiClient } from '../common/apiClient'
import { ChannelJoinRuleTransformer } from './transformer/channelJoinRuleTransformer'
import { ChannelPowerLevelsTransformer } from './transformer/channelPowerLevelsTransformer'
import { ChannelSortOrderTransformer } from './transformer/channelSortOrderTransformer'
import { ChannelTransformer } from './transformer/channelTransformer'
import { PublicChannelInfoTransformer } from './transformer/publicChannelInfoTransformer'
import { PublicChannelJoinRuleTransformer } from './transformer/publicChannelJoinRuleTransformer'
import { PublicChannelSearchResultTransformer } from './transformer/publicChannelSearchResultTransformer'
import {
  CreateSecureCommsChannelInput,
  ListSecureCommsPublicChannelsInput,
  SecureCommsChannelOptionalProperties,
  UpdateSecureCommsChannelInput,
  UpdateSecureCommsChannelSetInput,
} from '../../../gen/graphqlTypes'
import {
  ChannelsService,
  CreateChannelInput,
  DeleteChannelInput,
  ListChannelsOutput,
  SearchPublicChannelsInput,
  SearchPublicChannelsOutput,
  UpdateChannelInput,
} from '../../domain/entities/channels/channelsService'
import { AvatarImageMetadataTransformer } from '../common/transformer/avatarImageMetadataTransformer'

export class DefaultChannelsService implements ChannelsService {
  private readonly channelTransformer: ChannelTransformer
  private readonly publicChannelInfoTransformer: PublicChannelInfoTransformer
  private readonly channelJoinRuleTransformer: ChannelJoinRuleTransformer
  private readonly powerLevelsTransformer: ChannelPowerLevelsTransformer
  private readonly publicChannelSearchResultTransformer: PublicChannelSearchResultTransformer
  private readonly publicChannelJoinRuleTransformer: PublicChannelJoinRuleTransformer
  private readonly channelSortOrderTransformer: ChannelSortOrderTransformer
  private readonly avatarImageMetadataTransformer: AvatarImageMetadataTransformer

  constructor(private readonly appSync: ApiClient) {
    this.channelTransformer = new ChannelTransformer()
    this.publicChannelInfoTransformer = new PublicChannelInfoTransformer()
    this.channelJoinRuleTransformer = new ChannelJoinRuleTransformer()
    this.powerLevelsTransformer = new ChannelPowerLevelsTransformer()
    this.publicChannelSearchResultTransformer =
      new PublicChannelSearchResultTransformer()
    this.publicChannelJoinRuleTransformer =
      new PublicChannelJoinRuleTransformer()
    this.channelSortOrderTransformer = new ChannelSortOrderTransformer()
    this.avatarImageMetadataTransformer = new AvatarImageMetadataTransformer()
  }

  async create(input: CreateChannelInput): Promise<ChannelEntity> {
    const createChannelInput: CreateSecureCommsChannelInput = {
      creatorHandleId: input.selfHandleId,
      name: input.name ?? v4(),
      description: input.description,
      avatarImageUrl: input.avatarUrl,
      avatarImageMetadata: input.avatarImageMetadata
        ? this.avatarImageMetadataTransformer.fromEntityToGraphQL(
            input.avatarImageMetadata,
          )
        : undefined,
      invitations: input.invitedHandleIds,
      joinRule: this.channelJoinRuleTransformer.fromEntityToGraphQL(
        input.joinRule,
      ),
      tags: input.tags,
      powerLevels: input.powerLevels
        ? this.powerLevelsTransformer.fromEntityToGraphQLInput(
            input.powerLevels,
          )
        : undefined,
    }
    const result =
      await this.appSync.createSecureCommsChannel(createChannelInput)
    return this.channelTransformer.fromGraphQLToEntity(result)
  }

  async get(id: string): Promise<ChannelEntity | undefined> {
    const result = await this.appSync.getSecureCommsChannel(id)
    return result
      ? {
          channelId: new ChannelId(result.id),
          name: result.name ?? undefined,
          description: result.description ?? undefined,
          avatarUrl: result.avatarImageUrl ?? undefined,
          joinRule: this.channelJoinRuleTransformer.fromGraphQLToEntity(
            result.joinRule,
          ),
          tags: result.tags,
          memberCount: 0,
          createdAt: new Date(result.createdAtEpochMs),
          updatedAt: new Date(result.updatedAtEpochMs),
        }
      : undefined
  }

  async update(input: UpdateChannelInput): Promise<ChannelEntity> {
    const joinRule =
      input.joinRule?.value !== undefined
        ? this.channelJoinRuleTransformer.fromEntityToGraphQL(
            input.joinRule.value,
          )
        : undefined
    const setProperties: UpdateSecureCommsChannelSetInput = {
      avatarImageUrl: input.avatarUrl?.value,
      avatarImageMetadata: input.avatarImageMetadata?.value
        ? this.avatarImageMetadataTransformer.fromEntityToGraphQL(
            input.avatarImageMetadata.value,
          )
        : undefined,
      description: input.description?.value,
      joinRule: joinRule,
      name: input.name?.value,
      tags: input.tags?.value,
    }
    const unsetProperties: SecureCommsChannelOptionalProperties[] = []
    if (
      input.description !== undefined &&
      input.description.value === undefined
    ) {
      unsetProperties.push(SecureCommsChannelOptionalProperties.Description)
    }
    if (input.avatarUrl !== undefined && input.avatarUrl.value === undefined) {
      unsetProperties.push(SecureCommsChannelOptionalProperties.AvatarImageUrl)
    }
    const updateChannelInput: UpdateSecureCommsChannelInput = {
      id: input.channelId,
      handleId: input.selfHandleId,
      set: setProperties,
      unset: unsetProperties,
    }
    const result =
      await this.appSync.updateSecureCommsChannel(updateChannelInput)
    return this.publicChannelInfoTransformer.fromGraphQLToEntity(result)
  }

  async delete(input: DeleteChannelInput): Promise<void> {
    await this.appSync.deleteSecureCommsChannel(
      input.channelId,
      input.selfHandleId,
    )
  }

  async list(ids: string[]): Promise<ListChannelsOutput> {
    const result = await this.appSync.listSecureCommsChannels(ids)
    return {
      channels: result.items.map((item) =>
        this.publicChannelInfoTransformer.fromGraphQLToEntity(item),
      ),
      unprocessedIds: result.unprocessedIds,
    }
  }

  async search(
    input: SearchPublicChannelsInput,
  ): Promise<SearchPublicChannelsOutput> {
    const searchPublicChannelsInput: ListSecureCommsPublicChannelsInput = {
      handleId: input.selfHandleId,
      search: input.searchTerm,
      tags: input.tags,
      isJoined: input.isJoined,
      joinRule: input.joinRule
        ? this.publicChannelJoinRuleTransformer.fromEntityToGraphQL(
            input.joinRule,
          )
        : undefined,
      ordering: this.channelSortOrderTransformer.fromEntityToGraphQL(
        input.order,
      ),
      limit: input.limit,
      nextToken: input.nextToken,
    }
    const result = await this.appSync.listSecureCommsPublicChannels(
      searchPublicChannelsInput,
    )
    const channels: PublicChannelSearchResultEntity[] = []
    if (result.items) {
      result.items.map((item) =>
        channels.push(
          this.publicChannelSearchResultTransformer.fromGraphQLToEntity(item),
        ),
      )
    }
    return {
      channels,
      nextToken: result.nextToken ?? undefined,
    }
  }
}
