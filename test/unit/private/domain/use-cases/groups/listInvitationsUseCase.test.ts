/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { anything, instance, mock, reset, verify, when } from 'ts-mockito'
import { MatrixRoomsService } from '../../../../../../src/private/data/rooms/matrixRoomsService'
import { SessionManager } from '../../../../../../src/private/data/session/sessionManager'
import { ChannelsService } from '../../../../../../src/private/domain/entities/channels/channelsService'
import { ListInvitationsUseCase } from '../../../../../../src/private/domain/use-cases/groups/listInvitationsUseCase'
import { HandleId } from '../../../../../../src/public'
import { EntityDataFactory } from '../../../../../data-factory/entity'

jest.mock('../../../../../../src/private/data/rooms/matrixRoomsService')

describe('ListInvitationsUseCase Test Suite', () => {
  const mockChannelsService = mock<ChannelsService>()
  const mockSessionManager = mock<SessionManager>()
  const mockMatrixClient = {
    getRoom: jest.fn(),
    getUserId: jest.fn(),
  }

  let instanceUnderTest: ListInvitationsUseCase

  beforeEach(() => {
    reset(mockChannelsService)
    reset(mockSessionManager)

    mockMatrixClient.getUserId.mockResolvedValue('userId')

    instanceUnderTest = new ListInvitationsUseCase(
      instance(mockSessionManager),
      instance(mockChannelsService),
    )
  })

  describe('execute', () => {
    it('Lists all the groups the handle has an active invitation for successfully', async () => {
      const handleId = new HandleId('handleId')
      const groupId = EntityDataFactory.group.groupId.toString()
      const mockGroup = {
        getMembers: () => [
          {
            events: {
              member: {
                getContent: () => ({ is_direct: false }),
              },
            },
          },
        ],
        getMember: (id: string) => {
          const inviterId = '@inviterId:host'
          return id === inviterId
            ? {
                name: 'InviterName',
              }
            : {
                events: {
                  member: {
                    getSender: () => inviterId,
                  },
                },
              }
        },
      }
      when(mockSessionManager.getMatrixClient(handleId)).thenResolve(
        mockMatrixClient as any,
      )
      const mockMatrixRoomsService = {
        listInvitedRooms: jest
          .fn()
          .mockResolvedValue([
            { ...EntityDataFactory.groupRoom, roomId: groupId },
          ]),
      }
      ;(MatrixRoomsService as unknown as jest.Mock).mockReturnValue(
        mockMatrixRoomsService,
      )
      when(mockChannelsService.list(anything())).thenResolve({
        channels: [],
        unprocessedIds: [],
      })
      mockMatrixClient.getRoom.mockResolvedValue(mockGroup)

      const result = await instanceUnderTest['listInvitedGroups'](handleId)
      expect(result).toEqual([EntityDataFactory.groupInvitation])

      expect(mockMatrixRoomsService.listInvitedRooms).toHaveBeenCalledWith()
      expect(mockMatrixClient.getRoom).toHaveBeenCalledWith(groupId)
      verify(mockChannelsService.list(anything())).once()
    })

    it('Lists groups the handle has an active invitation with an empty result for non GROUP room type', async () => {
      const handleId = new HandleId('handleId')
      const channelId = EntityDataFactory.channel.channelId.toString()
      const mockMatrixRoomsService = {
        listInvitedRooms: jest
          .fn()
          .mockResolvedValue([
            { ...EntityDataFactory.channelRoom, roomId: channelId },
          ]),
      }
      ;(MatrixRoomsService as unknown as jest.Mock).mockReturnValue(
        mockMatrixRoomsService,
      )
      when(mockSessionManager.getMatrixClient(handleId)).thenResolve(
        mockMatrixClient as any,
      )
      when(mockChannelsService.list(anything())).thenResolve({
        channels: [EntityDataFactory.channel],
        unprocessedIds: [],
      })

      await expect(instanceUnderTest.execute(handleId)).resolves.toEqual([])

      expect(mockMatrixRoomsService.listInvitedRooms).toHaveBeenCalledWith()
      verify(mockChannelsService.list(anything())).once()
    })

    it('Lists groups the handle has an active invitation with an empty result successfully', async () => {
      const handleId = new HandleId('handleId')
      const mockMatrixRoomsService = {
        listInvitedRooms: jest.fn().mockResolvedValue([]),
      }
      ;(MatrixRoomsService as unknown as jest.Mock).mockReturnValue(
        mockMatrixRoomsService,
      )
      when(mockSessionManager.getMatrixClient(handleId)).thenResolve(
        mockMatrixClient as any,
      )
      when(mockChannelsService.list(anything())).thenResolve({
        channels: [],
        unprocessedIds: [],
      })

      await expect(instanceUnderTest.execute(handleId)).resolves.toEqual([])

      expect(mockMatrixRoomsService.listInvitedRooms).toHaveBeenCalledWith()
    })
  })
})
