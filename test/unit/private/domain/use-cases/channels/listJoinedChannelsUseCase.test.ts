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
import { MatrixRoomsService } from '../../../../../../src/private/data/rooms/matrixRoomsService'
import { SessionManager } from '../../../../../../src/private/data/session/sessionManager'
import { ChannelsService } from '../../../../../../src/private/domain/entities/channels/channelsService'
import { ListJoinedChannelsUseCase } from '../../../../../../src/private/domain/use-cases/channels/listJoinedChannelsUseCase'
import { HandleId } from '../../../../../../src/public'
import { EntityDataFactory } from '../../../../../data-factory/entity'

jest.mock('../../../../../../src/private/data/rooms/matrixRoomsService')

describe('ListJoinedChannelsUseCase Test Suite', () => {
  const mockChannelsService = mock<ChannelsService>()
  const mockSessionManager = mock<SessionManager>()

  let instanceUnderTest: ListJoinedChannelsUseCase

  beforeEach(() => {
    reset(mockChannelsService)
    reset(mockSessionManager)

    instanceUnderTest = new ListJoinedChannelsUseCase(
      instance(mockChannelsService),
      instance(mockSessionManager),
    )
  })

  describe('execute', () => {
    it('Lists all the channels the handle has joined successfully', async () => {
      const channelId = EntityDataFactory.channel.channelId.toString()
      const mockMatrixRoomsService = {
        listJoinedRoomIds: jest.fn().mockResolvedValue([channelId]),
      }
      ;(MatrixRoomsService as unknown as jest.Mock).mockReturnValue(
        mockMatrixRoomsService,
      )
      when(mockChannelsService.list(anything())).thenResolve({
        channels: [EntityDataFactory.channel],
        unprocessedIds: [],
      })

      const handleId = new HandleId('handleId')
      await expect(instanceUnderTest.execute(handleId)).resolves.toEqual([
        EntityDataFactory.channel,
      ])

      expect(mockMatrixRoomsService.listJoinedRoomIds).toHaveBeenCalledWith()
      const [inputArgs] = capture(mockChannelsService.list).first()
      expect(inputArgs).toStrictEqual<typeof inputArgs>([channelId])
      verify(mockChannelsService.list(anything())).once()
    })

    it('Lists channels the handle has joined with an empty result successfully', async () => {
      const mockMatrixRoomsService = {
        listJoinedRoomIds: jest.fn().mockResolvedValue([]),
      }
      ;(MatrixRoomsService as unknown as jest.Mock).mockReturnValue(
        mockMatrixRoomsService,
      )

      const handleId = new HandleId('handleId')
      await expect(instanceUnderTest.execute(handleId)).resolves.toEqual([])

      expect(mockMatrixRoomsService.listJoinedRoomIds).toHaveBeenCalledWith()
    })
  })
})
