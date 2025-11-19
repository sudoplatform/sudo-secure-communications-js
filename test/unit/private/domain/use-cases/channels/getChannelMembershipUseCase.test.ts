/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { instance, mock, reset } from 'ts-mockito'
import { MatrixRoomsService } from '../../../../../../src/private/data/rooms/matrixRoomsService'
import { SessionManager } from '../../../../../../src/private/data/session/sessionManager'
import { GetChannelMembershipUseCase } from '../../../../../../src/private/domain/use-cases/channels/getChannelMembershipUseCase'
import { ChannelId, HandleId } from '../../../../../../src/public'
import { EntityDataFactory } from '../../../../../data-factory/entity'

jest.mock('../../../../../../src/private/data/rooms/matrixRoomsService')

describe('GetChannelMembershipUseCase Test Suite', () => {
  const mockSessionManager = mock<SessionManager>()

  let instanceUnderTest: GetChannelMembershipUseCase

  beforeEach(() => {
    reset(mockSessionManager)

    instanceUnderTest = new GetChannelMembershipUseCase(
      instance(mockSessionManager),
    )
  })

  describe('execute', () => {
    it('Retrieves the channel membership of a handle successfully', async () => {
      const mockMatrixRoomsService = {
        getMembershipState: jest
          .fn()
          .mockResolvedValue(EntityDataFactory.roomMember.membership),
      }
      ;(MatrixRoomsService as unknown as jest.Mock).mockReturnValue(
        mockMatrixRoomsService,
      )

      const handleId = new HandleId('handleId')
      const channelId = new ChannelId('fooId')
      const result = await instanceUnderTest.execute({ handleId, channelId })

      expect(result).toStrictEqual(EntityDataFactory.channelMember.membership)
      expect(mockMatrixRoomsService.getMembershipState).toHaveBeenCalledWith({
        roomId: channelId.toString(),
        handleId: handleId.toString(),
      })
    })

    it('completes successfully with undefined result', async () => {
      const mockMatrixRoomsService = {
        getMembershipState: jest.fn().mockResolvedValue(undefined),
      }
      ;(MatrixRoomsService as unknown as jest.Mock).mockReturnValue(
        mockMatrixRoomsService,
      )

      const handleId = new HandleId('handleId')
      const channelId = new ChannelId('fooId')
      const result = await instanceUnderTest.execute({ handleId, channelId })

      expect(result).toStrictEqual(undefined)
      expect(mockMatrixRoomsService.getMembershipState).toHaveBeenCalledWith({
        roomId: channelId.toString(),
        handleId: handleId.toString(),
      })
    })
  })
})
