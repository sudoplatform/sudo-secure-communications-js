/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { instance, mock, reset } from 'ts-mockito'
import { MatrixRoomsService } from '../../../../../../src/private/data/rooms/matrixRoomsService'
import { SessionManager } from '../../../../../../src/private/data/session/sessionManager'
import { GetChannelMembersUseCase } from '../../../../../../src/private/domain/use-cases/channels/getChannelMembersUseCase'
import { ChannelId, HandleId } from '../../../../../../src/public'
import { EntityDataFactory } from '../../../../../data-factory/entity'

jest.mock('../../../../../../src/private/data/rooms/matrixRoomsService')

describe('GetChannelMembersUseCase Test Suite', () => {
  const mockSessionManager = mock<SessionManager>()

  let instanceUnderTest: GetChannelMembersUseCase

  beforeEach(() => {
    reset(mockSessionManager)

    instanceUnderTest = new GetChannelMembersUseCase(
      instance(mockSessionManager),
    )
  })

  describe('execute', () => {
    it('Lists channel members successfully', async () => {
      const mockMatrixRoomsService = {
        getMembers: jest.fn().mockResolvedValue([EntityDataFactory.roomMember]),
      }
      ;(MatrixRoomsService as unknown as jest.Mock).mockReturnValue(
        mockMatrixRoomsService,
      )

      const handleId = new HandleId('handleId')
      const channelId = new ChannelId('fooId')
      const result = await instanceUnderTest.execute({ handleId, channelId })

      expect(result).toStrictEqual([EntityDataFactory.channelMember])
      expect(mockMatrixRoomsService.getMembers).toHaveBeenCalledWith(
        channelId.toString(),
      )
    })

    it('List channel members successfully with empty result', async () => {
      const mockMatrixRoomsService = {
        getMembers: jest.fn().mockResolvedValue([]),
      }
      ;(MatrixRoomsService as unknown as jest.Mock).mockReturnValue(
        mockMatrixRoomsService,
      )

      const handleId = new HandleId('handleId')
      const channelId = new ChannelId('fooId')
      const result = await instanceUnderTest.execute({ handleId, channelId })

      expect(result).toStrictEqual([])
      expect(mockMatrixRoomsService.getMembers).toHaveBeenCalledWith(
        channelId.toString(),
      )
    })
  })
})
