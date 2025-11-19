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
import { ChannelsService } from '../../../../../../src/private/domain/entities/channels/channelsService'
import { DeleteChannelUseCase } from '../../../../../../src/private/domain/use-cases/channels/deleteChannelUseCase'
import { ChannelId } from '../../../../../../src/public'
import { EntityDataFactory } from '../../../../../data-factory/entity'

describe('DeleteChannelUseCase Test Suite', () => {
  const mockChannelsService = mock<ChannelsService>()

  let instanceUnderTest: DeleteChannelUseCase

  beforeEach(() => {
    reset(mockChannelsService)

    instanceUnderTest = new DeleteChannelUseCase(instance(mockChannelsService))
  })

  describe('execute', () => {
    it('Deletes a channel successfully', async () => {
      const handleId = EntityDataFactory.handle.handleId
      const channelId = new ChannelId('channelId')
      when(mockChannelsService.delete(anything())).thenResolve(undefined)

      await expect(
        instanceUnderTest.execute({ handleId, channelId }),
      ).resolves.not.toThrow()

      const [inputArgs] = capture(mockChannelsService.delete).first()
      expect(inputArgs).toStrictEqual<typeof inputArgs>({
        selfHandleId: EntityDataFactory.handle.handleId.toString(),
        channelId: channelId.toString(),
      })
      verify(mockChannelsService.delete(anything())).once()
    })
  })
})
