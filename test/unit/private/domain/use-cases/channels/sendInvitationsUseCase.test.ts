/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { instance, mock, reset } from 'ts-mockito'
import { MatrixRoomsService } from '../../../../../../src/private/data/rooms/matrixRoomsService'
import { SessionManager } from '../../../../../../src/private/data/session/sessionManager'
import { SendInvitationsUseCase } from '../../../../../../src/private/domain/use-cases/channels/sendInvitationsUseCase'
import { ChannelId, HandleId } from '../../../../../../src/public'

jest.mock('../../../../../../src/private/data/rooms/matrixRoomsService')

describe('SendInvitationsUseCase Test Suite', () => {
  const mockSessionManager = mock<SessionManager>()

  let instanceUnderTest: SendInvitationsUseCase

  beforeEach(() => {
    reset(mockSessionManager)

    instanceUnderTest = new SendInvitationsUseCase(instance(mockSessionManager))
  })

  describe('execute', () => {
    it('Sends a single invitation to join a channel successfully', async () => {
      const mockMatrixRoomsService = {
        sendInvitations: jest.fn().mockResolvedValue(undefined),
      }
      ;(MatrixRoomsService as unknown as jest.Mock).mockReturnValue(
        mockMatrixRoomsService,
      )

      const handleId = new HandleId('handleId')
      const channelId = new ChannelId('fooId')
      const targetHandleId = new HandleId('targetHandleId')
      await expect(
        instanceUnderTest.execute({
          handleId,
          channelId,
          targetHandleIds: [targetHandleId],
        }),
      ).resolves.not.toThrow()

      expect(mockMatrixRoomsService.sendInvitations).toHaveBeenCalledWith({
        roomId: channelId.toString(),
        targetHandleIds: [targetHandleId.toString()],
      })
    })

    it('Sends multiple invitations to join a channel successfully', async () => {
      const mockMatrixRoomsService = {
        sendInvitations: jest.fn().mockResolvedValue(undefined),
      }
      ;(MatrixRoomsService as unknown as jest.Mock).mockReturnValue(
        mockMatrixRoomsService,
      )

      const handleId = new HandleId('handleId')
      const channelId = new ChannelId('fooId')
      const targetHandleId1 = new HandleId('targetHandleId1')
      const targetHandleId2 = new HandleId('targetHandleId2')
      await expect(
        instanceUnderTest.execute({
          handleId,
          channelId,
          targetHandleIds: [targetHandleId1, targetHandleId2],
        }),
      ).resolves.not.toThrow()

      expect(mockMatrixRoomsService.sendInvitations).toHaveBeenCalledWith({
        roomId: channelId.toString(),
        targetHandleIds: [
          targetHandleId1.toString(),
          targetHandleId2.toString(),
        ],
      })
    })
  })
})
