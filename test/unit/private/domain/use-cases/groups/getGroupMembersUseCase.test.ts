/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { instance, mock, reset } from 'ts-mockito'
import { MatrixRoomsService } from '../../../../../../src/private/data/rooms/matrixRoomsService'
import { SessionManager } from '../../../../../../src/private/data/session/sessionManager'
import { GetGroupMembersUseCase } from '../../../../../../src/private/domain/use-cases/groups/getGroupMembersUseCase'
import { GroupId, HandleId } from '../../../../../../src/public'
import { EntityDataFactory } from '../../../../../data-factory/entity'

jest.mock('../../../../../../src/private/data/rooms/matrixRoomsService')

describe('GetGroupMembersUseCase Test Suite', () => {
  const mockSessionManager = mock<SessionManager>()

  let instanceUnderTest: GetGroupMembersUseCase

  beforeEach(() => {
    reset(mockSessionManager)

    instanceUnderTest = new GetGroupMembersUseCase(instance(mockSessionManager))
  })

  describe('execute', () => {
    it('Lists group members successfully', async () => {
      const mockMatrixRoomsService = {
        getMembers: jest.fn().mockResolvedValue([EntityDataFactory.roomMember]),
      }
      ;(MatrixRoomsService as unknown as jest.Mock).mockReturnValue(
        mockMatrixRoomsService,
      )

      const handleId = new HandleId('handleId')
      const groupId = new GroupId('fooId')
      const result = await instanceUnderTest.execute({ handleId, groupId })

      expect(result).toStrictEqual([EntityDataFactory.groupMember])
      expect(mockMatrixRoomsService.getMembers).toHaveBeenCalledWith(
        groupId.toString(),
      )
    })

    it('List group members successfully with empty result', async () => {
      const mockMatrixRoomsService = {
        getMembers: jest.fn().mockResolvedValue([]),
      }
      ;(MatrixRoomsService as unknown as jest.Mock).mockReturnValue(
        mockMatrixRoomsService,
      )

      const handleId = new HandleId('handleId')
      const groupId = new GroupId('fooId')
      const result = await instanceUnderTest.execute({ handleId, groupId })

      expect(result).toStrictEqual([])
      expect(mockMatrixRoomsService.getMembers).toHaveBeenCalledWith(
        groupId.toString(),
      )
    })
  })
})
