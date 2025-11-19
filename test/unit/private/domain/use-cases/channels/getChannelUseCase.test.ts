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
import { CustomRoomType } from '../../../../../../src/private/domain/entities/rooms/roomEntity'
import { GetChannelUseCase } from '../../../../../../src/private/domain/use-cases/channels/getChannelUseCase'
import { ChannelId, HandleId } from '../../../../../../src/public'
import { EntityDataFactory } from '../../../../../data-factory/entity'

jest.mock('../../../../../../src/private/data/rooms/matrixRoomsService')

describe('GetChannelUseCase Test Suite', () => {
  const mockChannelsService = mock<ChannelsService>()
  const mockSessionManager = mock<SessionManager>()

  let instanceUnderTest: GetChannelUseCase

  beforeEach(() => {
    reset(mockChannelsService)

    instanceUnderTest = new GetChannelUseCase(
      instance(mockChannelsService),
      instance(mockSessionManager),
    )
  })

  describe('execute', () => {
    it('Retrieves a channel successfully', async () => {
      const channelId = new ChannelId('testChannelId')
      const mockMatrixRoomsService = {
        get: jest.fn().mockResolvedValue({
          ...EntityDataFactory.channel,
          roomId: channelId,
          type: CustomRoomType.PUBLIC_CHANNEL,
        }),
      }
      ;(MatrixRoomsService as unknown as jest.Mock).mockReturnValue(
        mockMatrixRoomsService,
      )
      when(mockChannelsService.get(anything())).thenResolve(
        EntityDataFactory.channel,
      )

      const handleId = new HandleId('handleId')
      const result = await instanceUnderTest.execute({ handleId, channelId })

      expect(result).toStrictEqual(EntityDataFactory.channel)
      const [inputArg] = capture(mockChannelsService.get).first()
      expect(inputArg).toStrictEqual<typeof inputArg>(channelId.toString())
      verify(mockChannelsService.get(anything())).once()
    })

    it('completes successfully with undefined result', async () => {
      const channelId = new ChannelId('testChannelId')
      const mockMatrixRoomsService = {
        get: jest.fn().mockResolvedValue(undefined),
      }
      ;(MatrixRoomsService as unknown as jest.Mock).mockReturnValue(
        mockMatrixRoomsService,
      )
      when(mockChannelsService.get(anything())).thenResolve(undefined)

      const handleId = new HandleId('handleId')
      const result = await instanceUnderTest.execute({ handleId, channelId })

      expect(result).toStrictEqual(undefined)
      const [inputArg] = capture(mockChannelsService.get).first()
      expect(inputArg).toStrictEqual<typeof inputArg>(channelId.toString())
      verify(mockChannelsService.get(anything())).once()
    })
  })
})
