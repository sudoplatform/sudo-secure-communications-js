/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { instance, mock, reset } from 'ts-mockito'
import { MatrixRoomsService } from '../../../../../../src/private/data/rooms/matrixRoomsService'
import { SessionManager } from '../../../../../../src/private/data/session/sessionManager'
import { ListJoinedGroupsUseCase } from '../../../../../../src/private/domain/use-cases/groups/listJoinedGroupsUseCase'
import { HandleId } from '../../../../../../src/public'
import { EntityDataFactory } from '../../../../../data-factory/entity'

jest.mock('../../../../../../src/private/data/rooms/matrixRoomsService')

describe('ListJoinedGroupsUseCase Test Suite', () => {
  const mockSessionManager = mock<SessionManager>()

  let instanceUnderTest: ListJoinedGroupsUseCase

  beforeEach(() => {
    reset(mockSessionManager)

    instanceUnderTest = new ListJoinedGroupsUseCase(
      instance(mockSessionManager),
    )
  })

  describe('execute', () => {
    it('Lists all the groups the handle has joined successfully', async () => {
      const groupId = EntityDataFactory.group.groupId.toString()
      const mockMatrixRoomsService = {
        listJoinedRoomIds: jest.fn().mockResolvedValue([groupId]),
        list: jest
          .fn()
          .mockResolvedValue([
            { ...EntityDataFactory.groupRoom, roomId: groupId },
          ]),
      }
      ;(MatrixRoomsService as unknown as jest.Mock).mockReturnValue(
        mockMatrixRoomsService,
      )

      const handleId = new HandleId('handleId')
      await expect(instanceUnderTest.execute(handleId)).resolves.toEqual([
        EntityDataFactory.group,
      ])

      expect(mockMatrixRoomsService.listJoinedRoomIds).toHaveBeenCalledWith()
      expect(mockMatrixRoomsService.list).toHaveBeenCalledWith([groupId])
    })

    it('Lists groups the handle has joined with an empty result for non GROUP room type', async () => {
      const channelId = EntityDataFactory.channel.channelId.toString()
      const mockMatrixRoomsService = {
        listJoinedRoomIds: jest.fn().mockResolvedValue([channelId]),
        list: jest
          .fn()
          .mockResolvedValue([
            { ...EntityDataFactory.channelRoom, roomId: channelId },
          ]),
      }
      ;(MatrixRoomsService as unknown as jest.Mock).mockReturnValue(
        mockMatrixRoomsService,
      )

      const handleId = new HandleId('handleId')
      await expect(instanceUnderTest.execute(handleId)).resolves.toEqual([])

      expect(mockMatrixRoomsService.listJoinedRoomIds).toHaveBeenCalledWith()
      expect(mockMatrixRoomsService.list).toHaveBeenCalledWith([channelId])
    })

    it('Lists groups the handle has joined with an empty result successfully', async () => {
      const mockMatrixRoomsService = {
        listJoinedRoomIds: jest.fn().mockResolvedValue([]),
      }
      ;(MatrixRoomsService as unknown as jest.Mock).mockReturnValue(
        mockMatrixRoomsService,
      )
      const handleId = new HandleId('handleId')
      await expect(instanceUnderTest.execute(handleId)).resolves.toEqual([])

      expect(mockMatrixRoomsService.listJoinedRoomIds).toHaveBeenCalledWith()
    })
  })
})
