/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { instance, mock, reset } from 'ts-mockito'
import { MatrixRoomsService } from '../../../../../../src/private/data/rooms/matrixRoomsService'
import { SessionManager } from '../../../../../../src/private/data/session/sessionManager'
import { GetGroupUseCase } from '../../../../../../src/private/domain/use-cases/groups/getGroupUseCase'
import { GroupId, HandleId } from '../../../../../../src/public'
import { EntityDataFactory } from '../../../../../data-factory/entity'

jest.mock('../../../../../../src/private/data/rooms/matrixRoomsService')

describe('GetGroupUseCase Test Suite', () => {
  const mockSessionManager = mock<SessionManager>()

  let instanceUnderTest: GetGroupUseCase

  beforeEach(() => {
    reset(mockSessionManager)

    instanceUnderTest = new GetGroupUseCase(instance(mockSessionManager))
  })

  describe('execute', () => {
    it('Retrieves a group successfully', async () => {
      const mockMatrixRoomsService = {
        get: jest.fn().mockResolvedValue({
          ...EntityDataFactory.groupRoom,
          roomId: EntityDataFactory.group.groupId.toString(),
        }),
      }
      ;(MatrixRoomsService as unknown as jest.Mock).mockReturnValue(
        mockMatrixRoomsService,
      )

      const handleId = new HandleId('handleId')
      const groupId = new GroupId('fooId')
      const result = await instanceUnderTest.execute({ handleId, groupId })

      expect(result).toStrictEqual(EntityDataFactory.group)
      expect(mockMatrixRoomsService.get).toHaveBeenCalledWith(
        groupId.toString(),
      )
    })

    it('completes successfully with undefined result', async () => {
      const mockMatrixRoomsService = {
        get: jest.fn().mockResolvedValue(undefined),
      }
      ;(MatrixRoomsService as unknown as jest.Mock).mockReturnValue(
        mockMatrixRoomsService,
      )

      const handleId = new HandleId('handleId')
      const groupId = new GroupId('fooId')
      const result = await instanceUnderTest.execute({ handleId, groupId })

      expect(result).toStrictEqual(undefined)
      expect(mockMatrixRoomsService.get).toHaveBeenCalledWith(
        groupId.toString(),
      )
    })
  })
})
