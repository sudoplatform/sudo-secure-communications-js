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
import { ListSentInvitationRequestsUseCase } from '../../../../../../src/private/domain/use-cases/channels/listSentInvitationRequestsUseCase'
import { EntityDataFactory } from '../../../../../data-factory/entity'

jest.mock('../../../../../../src/private/data/rooms/matrixRoomsService')

describe('ListSentInvitationRequestsUseCase Test Suite', () => {
  const mockChannelsService = mock<ChannelsService>()
  const mockSessionManager = mock<SessionManager>()

  let instanceUnderTest: ListSentInvitationRequestsUseCase

  beforeEach(() => {
    reset(mockChannelsService)
    reset(mockSessionManager)

    instanceUnderTest = new ListSentInvitationRequestsUseCase(
      instance(mockChannelsService),
      instance(mockSessionManager),
    )
  })

  describe('execute', () => {
    it('Lists all the channels the handle has sent an invitation request for successfully', async () => {
      const handleId = EntityDataFactory.handle.handleId
      const channelId = EntityDataFactory.channel.channelId.toString()
      const mockMatrixRoomsService = {
        listKnockedRooms: jest
          .fn()
          .mockResolvedValue([
            { ...EntityDataFactory.channelRoom, roomId: channelId },
          ]),
      }
      ;(MatrixRoomsService as unknown as jest.Mock).mockReturnValue(
        mockMatrixRoomsService,
      )
      when(mockChannelsService.list(anything())).thenResolve({
        channels: [EntityDataFactory.channel],
        unprocessedIds: [],
      })

      await expect(instanceUnderTest.execute(handleId)).resolves.toEqual([
        EntityDataFactory.channel,
      ])

      expect(mockMatrixRoomsService.listKnockedRooms).toHaveBeenCalledWith()
      const [inputArgs] = capture(mockChannelsService.list).first()
      expect(inputArgs).toStrictEqual<typeof inputArgs>([channelId])
      verify(mockChannelsService.list(anything())).once()
    })

    it('Lists channels the handle has sent an invitation request for with an empty result successfully', async () => {
      const handleId = EntityDataFactory.handle.handleId
      const mockMatrixRoomsService = {
        listKnockedRooms: jest.fn().mockResolvedValue([]),
      }
      ;(MatrixRoomsService as unknown as jest.Mock).mockReturnValue(
        mockMatrixRoomsService,
      )

      await expect(instanceUnderTest.execute(handleId)).resolves.toEqual([])

      expect(mockMatrixRoomsService.listKnockedRooms).toHaveBeenCalledWith()
    })
  })
})
