/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { instance, mock, reset } from 'ts-mockito'
import { MatrixRoomsService } from '../../../../../../src/private/data/rooms/matrixRoomsService'
import { SessionManager } from '../../../../../../src/private/data/session/sessionManager'
import { DeclineInvitationUseCase } from '../../../../../../src/private/domain/use-cases/channels/declineInvitationUseCase'
import { ChannelId, HandleId } from '../../../../../../src/public'

jest.mock('../../../../../../src/private/data/rooms/matrixRoomsService')

describe('DeclineInvitationUseCase Test Suite', () => {
  const mockSessionManager = mock<SessionManager>()

  let instanceUnderTest: DeclineInvitationUseCase

  beforeEach(() => {
    reset(mockSessionManager)

    instanceUnderTest = new DeclineInvitationUseCase(
      instance(mockSessionManager),
    )
  })

  describe('execute', () => {
    it('Declines an invitation to join a channel successfully', async () => {
      const mockMatrixRoomsService = {
        leave: jest.fn().mockResolvedValue(undefined),
      }
      ;(MatrixRoomsService as unknown as jest.Mock).mockReturnValue(
        mockMatrixRoomsService,
      )

      const handleId = new HandleId('handleId')
      const channelId = new ChannelId('fooId')
      await expect(
        instanceUnderTest.execute({
          handleId,
          channelId,
        }),
      ).resolves.not.toThrow()

      expect(mockMatrixRoomsService.leave).toHaveBeenCalledWith(
        channelId.toString(),
      )
    })
  })
})
