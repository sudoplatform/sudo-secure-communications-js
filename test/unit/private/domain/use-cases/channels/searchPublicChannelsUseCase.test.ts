/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  anything,
  capture,
  instance,
  mock,
  reset,
  verify,
  when,
} from 'ts-mockito'
import { v4 } from 'uuid'
import {
  ChannelSortDirectionEntity,
  ChannelSortFieldEntity,
  PublicChannelJoinRuleEntity,
} from '../../../../../../src/private/domain/entities/channels/channelEntity'
import { ChannelsService } from '../../../../../../src/private/domain/entities/channels/channelsService'
import { SearchPublicChannelsUseCase } from '../../../../../../src/private/domain/use-cases/channels/searchPublicChannelsUseCase'
import { HandleId } from '../../../../../../src/public/typings/handle'
import { EntityDataFactory } from '../../../../../data-factory/entity'

describe('SearchPublicChannelsUseCase Test Suite', () => {
  const mockChannelsService = mock<ChannelsService>()

  let instanceUnderTest: SearchPublicChannelsUseCase

  beforeEach(() => {
    reset(mockChannelsService)

    instanceUnderTest = new SearchPublicChannelsUseCase(
      instance(mockChannelsService),
    )
  })

  describe('execute', () => {
    it('Search for public channels successfully', async () => {
      const handleId = new HandleId(v4())
      const order = {
        field: ChannelSortFieldEntity.NAME,
        direction: ChannelSortDirectionEntity.ASCENDING,
      }
      const searchTerm = v4()
      const joinRule = PublicChannelJoinRuleEntity.PUBLIC
      const isJoined = true
      when(mockChannelsService.search(anything())).thenResolve({
        channels: [EntityDataFactory.publicChannelSearchResult],
        nextToken: undefined,
      })
      const result = await instanceUnderTest.execute({
        handleId,
        order,
        searchTerm,
        joinRule,
        isJoined,
      })

      expect(result).toStrictEqual({
        channels: [EntityDataFactory.publicChannelSearchResult],
        nextToken: undefined,
      })
      const [inputArgs] = capture(mockChannelsService.search).first()
      expect(inputArgs).toStrictEqual<typeof inputArgs>({
        selfHandleId: handleId.toString(),
        order,
        searchTerm,
        joinRule,
        isJoined,
        tags: undefined,
        limit: undefined,
        nextToken: undefined,
      })
      verify(mockChannelsService.search(anything())).once()
    })

    it('Search for public channels with empty result items', async () => {
      const handleId = new HandleId(v4())
      const order = {
        field: ChannelSortFieldEntity.NAME,
        direction: ChannelSortDirectionEntity.ASCENDING,
      }
      when(mockChannelsService.search(anything())).thenResolve({
        channels: [],
        nextToken: undefined,
      })
      const result = await instanceUnderTest.execute({
        handleId,
        order,
      })

      expect(result).toStrictEqual({ channels: [], nextToken: undefined })
      const [inputArgs] = capture(mockChannelsService.search).first()
      expect(inputArgs).toStrictEqual<typeof inputArgs>({
        selfHandleId: handleId.toString(),
        order,
        searchTerm: undefined,
        joinRule: undefined,
        isJoined: undefined,
        tags: undefined,
        limit: undefined,
        nextToken: undefined,
      })
      verify(mockChannelsService.search(anything())).once()
    })
  })
})
