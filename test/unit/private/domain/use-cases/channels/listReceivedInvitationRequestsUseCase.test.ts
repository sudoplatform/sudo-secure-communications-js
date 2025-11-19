/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { instance, mock, reset } from 'ts-mockito'
import { MatrixRoomsService } from '../../../../../../src/private/data/rooms/matrixRoomsService'
import { SessionManager } from '../../../../../../src/private/data/session/sessionManager'
import { ListReceivedInvitationRequestsUseCase } from '../../../../../../src/private/domain/use-cases/channels/listReceivedInvitationRequestsUseCase'
import { ChannelId, HandleId } from '../../../../../../src/public'
import { EntityDataFactory } from '../../../../../data-factory/entity'

jest.mock('../../../../../../src/private/data/rooms/matrixRoomsService')

describe('ListReceivedInvitationRequestsUseCase Test Suite', () => {
  const mockSessionManager = mock<SessionManager>()

  let instanceUnderTest: ListReceivedInvitationRequestsUseCase

  beforeEach(() => {
    reset(mockSessionManager)

    instanceUnderTest = new ListReceivedInvitationRequestsUseCase(
      instance(mockSessionManager),
    )
  })

  describe('execute', () => {
    it('Lists all the channel invitation requests to join the specified channel successfully', async () => {
      const channelId = EntityDataFactory.channel.channelId
      const mockMatrixRoomsService = {
        listKnockRequests: jest.fn().mockResolvedValue([
          {
            ...EntityDataFactory.channelInvitationRequest,
            channelId,
          },
        ]),
      }
      ;(MatrixRoomsService as unknown as jest.Mock).mockReturnValue(
        mockMatrixRoomsService,
      )

      const handleId = new HandleId('handleId')
      await expect(
        instanceUnderTest.execute({ handleId, channelId }),
      ).resolves.toEqual([
        { ...EntityDataFactory.channelInvitationRequest, channelId },
      ])

      expect(mockMatrixRoomsService.listKnockRequests).toHaveBeenCalledWith(
        channelId.toString(),
      )
    })

    it('List channel invitation requests to join the specified channelwith an empty result successfully', async () => {
      const mockMatrixRoomsService = {
        listKnockRequests: jest.fn().mockResolvedValue([]),
      }
      ;(MatrixRoomsService as unknown as jest.Mock).mockReturnValue(
        mockMatrixRoomsService,
      )

      const handleId = new HandleId('handleId')
      const channelId = new ChannelId('channelId')
      await expect(
        instanceUnderTest.execute({ handleId, channelId }),
      ).resolves.toEqual([])

      expect(mockMatrixRoomsService.listKnockRequests).toHaveBeenCalledWith(
        channelId.toString(),
      )
    })
  })
})
