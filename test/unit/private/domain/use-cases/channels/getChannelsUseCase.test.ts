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
import { MatrixRoomsService } from '../../../../../../src/private/data/rooms/matrixRoomsService'
import { SessionManager } from '../../../../../../src/private/data/session/sessionManager'
import { ChannelsService } from '../../../../../../src/private/domain/entities/channels/channelsService'
import { CustomRoomType } from '../../../../../../src/private/domain/entities/rooms/roomEntity'
import { GetChannelsUseCase } from '../../../../../../src/private/domain/use-cases/channels/getChannelsUseCase'
import { ChannelId, HandleId } from '../../../../../../src/public'
import { EntityDataFactory } from '../../../../../data-factory/entity'

jest.mock('../../../../../../src/private/data/rooms/matrixRoomsService')

describe('GetChannelsUseCase Test Suite', () => {
  const mockChannelsService = mock<ChannelsService>()
  const mockSessionManager = mock<SessionManager>()

  let instanceUnderTest: GetChannelsUseCase

  beforeEach(() => {
    reset(mockChannelsService)
    reset(mockSessionManager)
    instanceUnderTest = new GetChannelsUseCase(
      instance(mockChannelsService),
      instance(mockSessionManager),
    )
  })

  describe('execute', () => {
    it('Lists channels successfully', async () => {
      const handleId = new HandleId('handleId')
      const channelId = new ChannelId('testChannelId')
      const mockMatrixRoomsService = {
        list: jest.fn().mockResolvedValue([
          {
            ...EntityDataFactory.channel,
            roomId: channelId,
            type: CustomRoomType.PUBLIC_CHANNEL,
          },
        ]),
      }
      ;(MatrixRoomsService as unknown as jest.Mock).mockReturnValue(
        mockMatrixRoomsService,
      )
      when(mockChannelsService.list(anything())).thenResolve({
        channels: [EntityDataFactory.channel],
        unprocessedIds: [],
      })
      const result = await instanceUnderTest.execute({
        handleId,
        channelIds: [channelId],
      })

      expect(result).toStrictEqual([EntityDataFactory.channel])
      const [inputArgs] = capture(mockChannelsService.list).first()
      expect(inputArgs).toStrictEqual<typeof inputArgs>([channelId.toString()])
      verify(mockChannelsService.list(anything())).once()
    })

    it('Lists channels successfully with empty result', async () => {
      const handleId = new HandleId('handleId')
      const id = new ChannelId(v4())
      const mockMatrixRoomsService = {
        list: jest.fn().mockResolvedValue([]),
      }
      ;(MatrixRoomsService as unknown as jest.Mock).mockReturnValue(
        mockMatrixRoomsService,
      )
      when(mockChannelsService.list(anything())).thenResolve({
        channels: [],
        unprocessedIds: [],
      })
      const result = await instanceUnderTest.execute({
        handleId,
        channelIds: [id],
      })

      expect(result).toStrictEqual([])
      const [inputArgs] = capture(mockChannelsService.list).first()
      expect(inputArgs).toStrictEqual<typeof inputArgs>([id.toString()])
      verify(mockChannelsService.list(anything())).once()
    })

    it('Returns empty result for empty input ids', async () => {
      const handleId = new HandleId('handleId')
      const result = await instanceUnderTest.execute({
        handleId,
        channelIds: [],
      })

      expect(result).toStrictEqual([])
      verify(mockChannelsService.list(anything())).never()
    })

    it('List channels successfully having reprocessed unproccessed ids', async () => {
      const handleId = new HandleId('handleId')
      const id = new ChannelId(v4())
      when(mockChannelsService.list(anything())).thenResolve({
        channels: [EntityDataFactory.channel],
        unprocessedIds: ['unprocessed-id'],
      })
      const result = await instanceUnderTest.execute({
        handleId,
        channelIds: [id],
      })

      expect(result).toStrictEqual([
        EntityDataFactory.channel,
        EntityDataFactory.channel,
      ])
      const [inputArgs] = capture(mockChannelsService.list).first()
      expect(inputArgs).toStrictEqual<typeof inputArgs>([id.toString()])
      verify(mockChannelsService.list(anything())).twice()
    })
  })
})
