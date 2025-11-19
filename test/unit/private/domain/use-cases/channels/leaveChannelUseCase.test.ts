/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { instance, mock, reset } from 'ts-mockito'
import { MatrixRoomsService } from '../../../../../../src/private/data/rooms/matrixRoomsService'
import { SessionManager } from '../../../../../../src/private/data/session/sessionManager'
import { LeaveChannelUseCase } from '../../../../../../src/private/domain/use-cases/channels/leaveChannelUseCase'
import { ChannelId, HandleId } from '../../../../../../src/public'

jest.mock('../../../../../../src/private/data/rooms/matrixRoomsService')

describe('LeaveChannelUseCase Test Suite', () => {
  const mockSessionManager = mock<SessionManager>()

  let instanceUnderTest: LeaveChannelUseCase

  beforeEach(() => {
    reset(mockSessionManager)

    instanceUnderTest = new LeaveChannelUseCase(instance(mockSessionManager))
  })

  describe('execute', () => {
    it('Leaves a channel successfully', async () => {
      const mockMatrixRoomsService = {
        leave: jest.fn().mockResolvedValue(undefined),
      }
      ;(MatrixRoomsService as unknown as jest.Mock).mockReturnValue(
        mockMatrixRoomsService,
      )

      const handleId = new HandleId('handleId')
      const channelId = new ChannelId('fooId')
      await expect(
        instanceUnderTest.execute({ handleId, channelId }),
      ).resolves.not.toThrow()

      expect(mockMatrixRoomsService.leave).toHaveBeenCalledWith(
        channelId.toString(),
      )
    })
  })
})
