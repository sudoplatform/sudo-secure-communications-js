/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { instance, mock, reset } from 'ts-mockito'
import { MatrixRoomsService } from '../../../../../../src/private/data/rooms/matrixRoomsService'
import { SessionManager } from '../../../../../../src/private/data/session/sessionManager'
import { SendInvitationRequestUseCase } from '../../../../../../src/private/domain/use-cases/channels/sendInvitationRequestUseCase'
import { ChannelId, HandleId } from '../../../../../../src/public'

jest.mock('../../../../../../src/private/data/rooms/matrixRoomsService')

describe('SendInvitationRequestUseCase Test Suite', () => {
  const mockSessionManager = mock<SessionManager>()

  let instanceUnderTest: SendInvitationRequestUseCase

  beforeEach(() => {
    reset(mockSessionManager)

    instanceUnderTest = new SendInvitationRequestUseCase(
      instance(mockSessionManager),
    )
  })

  describe('execute', () => {
    it('Sends an invitation request to join a channel successfully', async () => {
      const mockMatrixRoomsService = {
        knockRoom: jest.fn().mockResolvedValue(undefined),
      }
      ;(MatrixRoomsService as unknown as jest.Mock).mockReturnValue(
        mockMatrixRoomsService,
      )

      const handleId = new HandleId('handleId')
      const channelId = new ChannelId('fooId')
      const reason = 'some reason'
      await expect(
        instanceUnderTest.execute({
          handleId,
          channelId,
          reason,
        }),
      ).resolves.not.toThrow()

      expect(mockMatrixRoomsService.knockRoom).toHaveBeenCalledWith({
        roomId: channelId.toString(),
        reason,
      })
    })
  })
})
