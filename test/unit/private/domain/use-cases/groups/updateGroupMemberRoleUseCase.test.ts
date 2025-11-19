/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { instance, mock, reset } from 'ts-mockito'
import { MatrixRoomsService } from '../../../../../../src/private/data/rooms/matrixRoomsService'
import { SessionManager } from '../../../../../../src/private/data/session/sessionManager'
import { GroupRoleEntity } from '../../../../../../src/private/domain/entities/groups/groupEntity'
import { UpdateGroupMemberRoleUseCase } from '../../../../../../src/private/domain/use-cases/groups/updateGroupMemberRoleUseCase'
import { GroupId, HandleId } from '../../../../../../src/public'

jest.mock('../../../../../../src/private/data/rooms/matrixRoomsService')

describe('UpdateGroupMemberRoleUseCase Test Suite', () => {
  const mockSessionManager = mock<SessionManager>()

  let instanceUnderTest: UpdateGroupMemberRoleUseCase

  beforeEach(() => {
    reset(mockSessionManager)

    instanceUnderTest = new UpdateGroupMemberRoleUseCase(
      instance(mockSessionManager),
    )
  })

  describe('execute', () => {
    it('Updates a group member role successfully', async () => {
      const mockMatrixRoomsService = {
        updateRoomMemberPowerLevel: jest.fn().mockResolvedValue(undefined),
      }
      ;(MatrixRoomsService as unknown as jest.Mock).mockReturnValue(
        mockMatrixRoomsService,
      )

      const handleId = new HandleId('handleId')
      const groupId = new GroupId('fooId')
      const targetHandleId = new HandleId('targetHandleId')
      const role = GroupRoleEntity.PARTICIPANT
      await expect(
        instanceUnderTest.execute({
          handleId,
          groupId,
          targetHandleId,
          role,
        }),
      ).resolves.not.toThrow()

      expect(
        mockMatrixRoomsService.updateRoomMemberPowerLevel,
      ).toHaveBeenCalledWith({
        roomId: groupId.toString(),
        targetHandleId: targetHandleId.toString(),
        powerLevel: 25,
      })
    })
  })
})
