/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { instance, mock, reset } from 'ts-mockito'
import { v4 } from 'uuid'
import { MatrixRoomsService } from '../../../../../../src/private/data/rooms/matrixRoomsService'
import { SessionManager } from '../../../../../../src/private/data/session/sessionManager'
import { GetGroupsUseCase } from '../../../../../../src/private/domain/use-cases/groups/getGroupsUseCase'
import { GroupId, HandleId } from '../../../../../../src/public'
import { EntityDataFactory } from '../../../../../data-factory/entity'

jest.mock('../../../../../../src/private/data/rooms/matrixRoomsService')

describe('GetGroupsUseCase Test Suite', () => {
  const mockSessionManager = mock<SessionManager>()

  let instanceUnderTest: GetGroupsUseCase

  beforeEach(() => {
    reset(mockSessionManager)

    instanceUnderTest = new GetGroupsUseCase(instance(mockSessionManager))
  })

  describe('execute', () => {
    it('Lists groups successfully', async () => {
      const mockMatrixRoomsService = {
        list: jest.fn().mockResolvedValue([
          {
            ...EntityDataFactory.groupRoom,
            roomId: EntityDataFactory.group.groupId.toString(),
          },
        ]),
      }
      ;(MatrixRoomsService as unknown as jest.Mock).mockReturnValue(
        mockMatrixRoomsService,
      )

      const handleId = new HandleId('handleId')
      const id = new GroupId(v4())
      const result = await instanceUnderTest.execute({
        handleId,
        groupIds: [id],
      })

      expect(result).toStrictEqual([EntityDataFactory.group])
      expect(mockMatrixRoomsService.list).toHaveBeenCalledWith([id.toString()])
    })

    it('Lists groups successfully with empty result', async () => {
      const mockMatrixRoomsService = {
        list: jest.fn().mockResolvedValue([]),
      }
      ;(MatrixRoomsService as unknown as jest.Mock).mockReturnValue(
        mockMatrixRoomsService,
      )

      const handleId = new HandleId('handleId')
      const id = new GroupId(v4())
      const result = await instanceUnderTest.execute({
        handleId,
        groupIds: [id],
      })

      expect(result).toStrictEqual([])
      expect(mockMatrixRoomsService.list).toHaveBeenCalledWith([id.toString()])
    })

    it('Returns empty result for empty input ids', async () => {
      const handleId = new HandleId('handleId')
      const result = await instanceUnderTest.execute({ handleId, groupIds: [] })

      expect(result).toStrictEqual([])
    })
  })
})
