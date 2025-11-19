/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { instance, mock, reset } from 'ts-mockito'
import { MatrixRoomsService } from '../../../../../../src/private/data/rooms/matrixRoomsService'
import { SessionManager } from '../../../../../../src/private/data/session/sessionManager'
import { BanHandleUseCase } from '../../../../../../src/private/domain/use-cases/channels/banHandleUseCase'
import { ChannelId, HandleId } from '../../../../../../src/public'

jest.mock('../../../../../../src/private/data/rooms/matrixRoomsService')

describe('BanHandleUseCase Test Suite', () => {
  const mockSessionManager = mock<SessionManager>()

  let instanceUnderTest: BanHandleUseCase

  beforeEach(() => {
    reset(mockSessionManager)

    instanceUnderTest = new BanHandleUseCase(instance(mockSessionManager))
  })

  describe('execute', () => {
    it('Ban handle from channel successfully', async () => {
      const mockMatrixRoomsService = {
        banHandle: jest.fn().mockResolvedValue(undefined),
      }
      ;(MatrixRoomsService as unknown as jest.Mock).mockReturnValue(
        mockMatrixRoomsService,
      )

      const handleId = new HandleId('handleId')
      const channelId = new ChannelId('fooId')
      const targetHandleId = new HandleId('targetHandleId')
      await expect(
        instanceUnderTest.execute({ handleId, channelId, targetHandleId }),
      ).resolves.not.toThrow()

      expect(mockMatrixRoomsService.banHandle).toHaveBeenCalledWith({
        roomId: channelId.toString(),
        targetHandleId: targetHandleId.toString(),
      })
    })

    it('Ban handle from channel with reason successfully', async () => {
      const mockMatrixRoomsService = {
        banHandle: jest.fn().mockResolvedValue(undefined),
      }
      ;(MatrixRoomsService as unknown as jest.Mock).mockReturnValue(
        mockMatrixRoomsService,
      )

      const handleId = new HandleId('handleId')
      const channelId = new ChannelId('fooId')
      const targetHandleId = new HandleId('targetHandleId')
      const reason = 'some reason'
      await expect(
        instanceUnderTest.execute({
          handleId,
          channelId,
          targetHandleId,
          reason,
        }),
      ).resolves.not.toThrow()

      expect(mockMatrixRoomsService.banHandle).toHaveBeenCalledWith({
        roomId: channelId.toString(),
        targetHandleId: targetHandleId.toString(),
        reason,
      })
    })
  })
})
