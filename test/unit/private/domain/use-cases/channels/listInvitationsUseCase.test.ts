/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  anything,
  capture,
  instance,
  mock,
  reset,
  verify,
  when,
} from 'ts-mockito'
import { MatrixRoomsService } from '../../../../../../src/private/data/rooms/matrixRoomsService'
import { SessionManager } from '../../../../../../src/private/data/session/sessionManager'
import { ChannelsService } from '../../../../../../src/private/domain/entities/channels/channelsService'
import { ListInvitationsUseCase } from '../../../../../../src/private/domain/use-cases/channels/listInvitationsUseCase'
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
      instance(mockChannelsService),
      instance(mockSessionManager),
    )
  })

  describe('execute', () => {
    it('Lists all the channels the handle has an active invitation for successfully', async () => {
      const handleId = new HandleId('handleId')
      const channelId = EntityDataFactory.channel.channelId.toString()
      const mockMatrixRoomsService = {
        listInvitedRooms: jest
          .fn()
          .mockResolvedValue([
            { ...EntityDataFactory.channelRoom, roomId: channelId },
          ]),
      }
      when(mockSessionManager.getMatrixClient(handleId)).thenResolve(
        mockMatrixClient as any,
      )
      const mockChannel = {
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
      ;(MatrixRoomsService as unknown as jest.Mock).mockReturnValue(
        mockMatrixRoomsService,
      )
      when(mockChannelsService.list(anything())).thenResolve({
        channels: [EntityDataFactory.channel],
        unprocessedIds: [],
      })
      mockMatrixClient.getRoom.mockResolvedValue(mockChannel)

      await expect(instanceUnderTest.execute(handleId)).resolves.toEqual([
        EntityDataFactory.channelInvitation,
      ])

      expect(mockMatrixRoomsService.listInvitedRooms).toHaveBeenCalledWith()
      const [inputArgs] = capture(mockChannelsService.list).first()
      expect(inputArgs).toStrictEqual<typeof inputArgs>([channelId])
      verify(mockChannelsService.list(anything())).once()
    })

    it('Lists channels the handle has an active invitation with an empty result successfully', async () => {
      const handleId = new HandleId('handleId')
      const mockMatrixRoomsService = {
        listInvitedRooms: jest.fn().mockResolvedValue([]),
      }
      when(mockSessionManager.getMatrixClient(handleId)).thenResolve(
        mockMatrixClient as any,
      )
      ;(MatrixRoomsService as unknown as jest.Mock).mockReturnValue(
        mockMatrixRoomsService,
      )

      await expect(instanceUnderTest.execute(handleId)).resolves.toEqual([])

      expect(mockMatrixRoomsService.listInvitedRooms).toHaveBeenCalledWith()
    })
  })
})
