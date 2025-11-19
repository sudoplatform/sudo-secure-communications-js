/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { instance, mock, reset } from 'ts-mockito'
import { MatrixRoomsService } from '../../../../../../src/private/data/rooms/matrixRoomsService'
import { SessionManager } from '../../../../../../src/private/data/session/sessionManager'
import { ChannelRoleEntity } from '../../../../../../src/private/domain/entities/channels/channelEntity'
import { UpdateChannelMemberRoleUseCase } from '../../../../../../src/private/domain/use-cases/channels/updateChannelMemberRoleUseCase'
import { ChannelId, HandleId } from '../../../../../../src/public'

jest.mock('../../../../../../src/private/data/rooms/matrixRoomsService')

describe('UpdateChannelMemberRoleUseCase Test Suite', () => {
  const mockSessionManager = mock<SessionManager>()

  let instanceUnderTest: UpdateChannelMemberRoleUseCase

  beforeEach(() => {
    reset(mockSessionManager)

    instanceUnderTest = new UpdateChannelMemberRoleUseCase(
      instance(mockSessionManager),
    )
  })

  describe('execute', () => {
    it('Updates a channel member role successfully', async () => {
      const mockMatrixRoomsService = {
        updateRoomMemberPowerLevel: jest.fn().mockResolvedValue(undefined),
      }
      ;(MatrixRoomsService as unknown as jest.Mock).mockReturnValue(
        mockMatrixRoomsService,
      )

      const handleId = new HandleId('handleId')
      const channelId = new ChannelId('fooId')
      const targetHandleId = new HandleId('targetHandleId')
      const role = ChannelRoleEntity.PARTICIPANT
      await expect(
        instanceUnderTest.execute({
          handleId,
          channelId,
          targetHandleId,
          role,
        }),
      ).resolves.not.toThrow()

      expect(
        mockMatrixRoomsService.updateRoomMemberPowerLevel,
      ).toHaveBeenCalledWith({
        roomId: channelId.toString(),
        targetHandleId: targetHandleId.toString(),
        powerLevel: 25,
      })
    })
  })
})
