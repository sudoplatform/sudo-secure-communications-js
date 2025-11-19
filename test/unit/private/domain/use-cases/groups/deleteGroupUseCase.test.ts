/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { instance, mock, reset } from 'ts-mockito'
import { MatrixRoomsService } from '../../../../../../src/private/data/rooms/matrixRoomsService'
import { SessionManager } from '../../../../../../src/private/data/session/sessionManager'
import { MembershipStateEntity } from '../../../../../../src/private/domain/entities/common/memberEntity'
import { DeleteGroupUseCase } from '../../../../../../src/private/domain/use-cases/groups/deleteGroupUseCase'
import {
  GroupId,
  HandleId,
  HandleNotFoundError,
  PermissionDeniedError,
} from '../../../../../../src/public'
import { EntityDataFactory } from '../../../../../data-factory/entity'

jest.mock('../../../../../../src/private/data/rooms/matrixRoomsService')

describe('DeleteGroupUseCase Test Suite', () => {
  const mockSessionManager = mock<SessionManager>()

  let instanceUnderTest: DeleteGroupUseCase

  beforeEach(() => {
    reset(mockSessionManager)

    instanceUnderTest = new DeleteGroupUseCase(instance(mockSessionManager))
  })

  describe('execute', () => {
    it('Deletes a group successfully', async () => {
      const handleId = EntityDataFactory.handle.handleId
      const otherHandleId = new HandleId('otherHandleId')
      const groupId = new GroupId('fooId')
      const members = [
        EntityDataFactory.roomMember,
        {
          ...EntityDataFactory.roomMember,
          handle: { handleId: otherHandleId, name: 'testOtherHandleName' },
          powerLevel: 25,
        },
      ]
      const mockMatrixRoomsService = {
        getMembers: jest.fn().mockResolvedValue(members),
        leave: jest.fn().mockResolvedValue(undefined),
        kickHandle: jest.fn().mockResolvedValue(undefined),
      }
      ;(MatrixRoomsService as unknown as jest.Mock).mockReturnValue(
        mockMatrixRoomsService,
      )

      await expect(
        instanceUnderTest.execute({
          handleId,
          groupId,
        }),
      ).resolves.not.toThrow()

      expect(mockMatrixRoomsService.getMembers).toHaveBeenCalledWith(
        groupId.toString(),
      )
      expect(mockMatrixRoomsService.leave).toHaveBeenCalledWith(
        groupId.toString(),
      )
      expect(mockMatrixRoomsService.kickHandle).toHaveBeenCalledWith({
        roomId: groupId.toString(),
        targetHandleId: otherHandleId.toString(),
      })
    })

    it('Should throw a HandleNotFoundError if current handle cannot be found in group', async () => {
      const handleId = EntityDataFactory.handle.handleId
      const otherHandleId = new HandleId('otherHandleId')
      const groupId = new GroupId('fooId')
      const members = [
        {
          ...EntityDataFactory.roomMember,
          handle: { handleId: otherHandleId, name: 'testOtherHandleName' },
          powerLevel: 25,
        },
      ]
      const mockMatrixRoomsService = {
        getMembers: jest.fn().mockResolvedValue(members),
        leave: jest.fn().mockResolvedValue(undefined),
        kickHandle: jest.fn().mockResolvedValue(undefined),
      }
      ;(MatrixRoomsService as unknown as jest.Mock).mockReturnValue(
        mockMatrixRoomsService,
      )

      await expect(
        instanceUnderTest.execute({
          handleId,
          groupId,
        }),
      ).rejects.toThrow(HandleNotFoundError)

      expect(mockMatrixRoomsService.getMembers).toHaveBeenCalledWith(
        groupId.toString(),
      )
      expect(mockMatrixRoomsService.leave).toHaveBeenCalledTimes(0)
      expect(mockMatrixRoomsService.kickHandle).toHaveBeenCalledTimes(0)
    })

    it('Should throw a HandleNotFoundError if current handle membership state is not JOINED', async () => {
      const handleId = EntityDataFactory.handle.handleId
      const otherHandleId = new HandleId('otherHandleId')
      const groupId = new GroupId('fooId')
      const members = [
        {
          ...EntityDataFactory.roomMember,
          membership: MembershipStateEntity.INVITED,
        },
        {
          ...EntityDataFactory.roomMember,
          handleId: otherHandleId,
          powerLevel: 25,
        },
      ]
      const mockMatrixRoomsService = {
        getMembers: jest.fn().mockResolvedValue(members),
        leave: jest.fn().mockResolvedValue(undefined),
        kickHandle: jest.fn().mockResolvedValue(undefined),
      }
      ;(MatrixRoomsService as unknown as jest.Mock).mockReturnValue(
        mockMatrixRoomsService,
      )

      await expect(
        instanceUnderTest.execute({
          handleId,
          groupId,
        }),
      ).rejects.toThrow(HandleNotFoundError)

      expect(mockMatrixRoomsService.getMembers).toHaveBeenCalledWith(
        groupId.toString(),
      )
      expect(mockMatrixRoomsService.leave).toHaveBeenCalledTimes(0)
      expect(mockMatrixRoomsService.kickHandle).toHaveBeenCalledTimes(0)
    })

    it('Should throw a PermissionDeniedError if current handle is not an ADMIN role', async () => {
      const handleId = EntityDataFactory.handle.handleId
      const otherHandleId = new HandleId('otherHandleId')
      const groupId = new GroupId('fooId')
      const members = [
        {
          ...EntityDataFactory.roomMember,
          powerLevel: 25,
        },
        {
          ...EntityDataFactory.roomMember,
          handleId: otherHandleId,
          powerLevel: 25,
        },
      ]
      const mockMatrixRoomsService = {
        getMembers: jest.fn().mockResolvedValue(members),
        leave: jest.fn().mockResolvedValue(undefined),
        kickHandle: jest.fn().mockResolvedValue(undefined),
      }
      ;(MatrixRoomsService as unknown as jest.Mock).mockReturnValue(
        mockMatrixRoomsService,
      )

      await expect(
        instanceUnderTest.execute({
          handleId,
          groupId,
        }),
      ).rejects.toThrow(PermissionDeniedError)

      expect(mockMatrixRoomsService.getMembers).toHaveBeenCalledWith(
        groupId.toString(),
      )
      expect(mockMatrixRoomsService.leave).toHaveBeenCalledTimes(0)
      expect(mockMatrixRoomsService.kickHandle).toHaveBeenCalledTimes(0)
    })

    it('Should throw a PermissionDeniedError if current handle is not the highest role in the group', async () => {
      const handleId = EntityDataFactory.handle.handleId
      const otherHandleId = new HandleId('otherHandleId')
      const groupId = new GroupId('fooId')
      const members = [
        {
          ...EntityDataFactory.roomMember,
          powerLevel: 100,
        },
        {
          ...EntityDataFactory.roomMember,
          handle: { handleId: otherHandleId, name: 'testOtherHandleName' },
          powerLevel: 100,
        },
      ]
      const mockMatrixRoomsService = {
        getMembers: jest.fn().mockResolvedValue(members),
        leave: jest.fn().mockResolvedValue(undefined),
        kickHandle: jest.fn().mockResolvedValue(undefined),
      }
      ;(MatrixRoomsService as unknown as jest.Mock).mockReturnValue(
        mockMatrixRoomsService,
      )

      await expect(
        instanceUnderTest.execute({
          handleId,
          groupId,
        }),
      ).rejects.toThrow(PermissionDeniedError)

      expect(mockMatrixRoomsService.getMembers).toHaveBeenCalledWith(
        groupId.toString(),
      )
      expect(mockMatrixRoomsService.leave).toHaveBeenCalledTimes(0)
      expect(mockMatrixRoomsService.kickHandle).toHaveBeenCalledTimes(0)
    })
  })
})
