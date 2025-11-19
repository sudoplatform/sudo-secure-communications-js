/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { instance, mock, reset } from 'ts-mockito'
import { MatrixRoomsService } from '../../../../../../src/private/data/rooms/matrixRoomsService'
import { SessionManager } from '../../../../../../src/private/data/session/sessionManager'
import { JoinChannelUseCase } from '../../../../../../src/private/domain/use-cases/channels/joinChannelUseCase'
import { ChannelId, HandleId } from '../../../../../../src/public'

jest.mock('../../../../../../src/private/data/rooms/matrixRoomsService')

describe('JoinChannelUseCase Test Suite', () => {
  const mockSessionManager = mock<SessionManager>()

  let instanceUnderTest: JoinChannelUseCase

  beforeEach(() => {
    reset(mockSessionManager)

    instanceUnderTest = new JoinChannelUseCase(instance(mockSessionManager))
  })

  describe('execute', () => {
    it('Joins a channel successfully', async () => {
      const mockMatrixRoomsService = {
        join: jest.fn().mockResolvedValue(undefined),
      }
      ;(MatrixRoomsService as unknown as jest.Mock).mockReturnValue(
        mockMatrixRoomsService,
      )

      const handleId = new HandleId('handleId')
      const channelId = new ChannelId('fooId')
      await expect(
        instanceUnderTest.execute({ handleId, channelId }),
      ).resolves.not.toThrow()

      expect(mockMatrixRoomsService.join).toHaveBeenCalledWith(
        channelId.toString(),
      )
    })
  })
})
