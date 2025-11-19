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
import {
  ChannelJoinRuleEntity,
  ChannelRoleEntity,
} from '../../../../../../src/private/domain/entities/channels/channelEntity'
import { ChannelsService } from '../../../../../../src/private/domain/entities/channels/channelsService'
import { WordValidationService } from '../../../../../../src/private/domain/entities/wordValidation/wordValidationService'
import { CreateChannelUseCase } from '../../../../../../src/private/domain/use-cases/channels/createChannelUseCase'
import { HandleId, UnacceptableWordsError } from '../../../../../../src/public'
import { EntityDataFactory } from '../../../../../data-factory/entity'

describe('CreateChannelUseCase Test Suite', () => {
  const mockChannelsService = mock<ChannelsService>()
  const mockWordValidationService = mock<WordValidationService>()

  let instanceUnderTest: CreateChannelUseCase

  beforeEach(() => {
    reset(mockChannelsService)
    reset(mockWordValidationService)

    instanceUnderTest = new CreateChannelUseCase(
      instance(mockChannelsService),
      instance(mockWordValidationService),
    )
  })

  describe('execute', () => {
    it('Creates a channel successfully', async () => {
      const handleId = new HandleId('testHandleId')
      const name = 'handlename'
      const description = 'testDescription'
      const tags = ['tag-1', 'tag-2']
      const validWords = new Set([name, ...tags])
      const joinRule = ChannelJoinRuleEntity.PUBLIC
      const defaultMemberRole = ChannelRoleEntity.ADMIN
      when(mockWordValidationService.checkWordValidity(anything())).thenResolve(
        validWords,
      )
      when(mockChannelsService.create(anything())).thenResolve(
        EntityDataFactory.channel,
      )

      const result = await instanceUnderTest.execute({
        handleId,
        name,
        description,
        joinRule,
        tags,
        invitedHandleIds: [],
        permissions: EntityDataFactory.defaultChannelPermissionsInput,
        defaultMemberRole,
      })

      expect(result).toStrictEqual(EntityDataFactory.channel)
      const [validateArgs] = capture(
        mockWordValidationService.checkWordValidity,
      ).first()
      expect(validateArgs).toStrictEqual<typeof validateArgs>(validWords)
      verify(mockWordValidationService.checkWordValidity(anything())).once()
      const [inputArgs] = capture(mockChannelsService.create).first()
      expect(inputArgs).toStrictEqual<typeof inputArgs>({
        selfHandleId: handleId.toString(),
        name,
        description,
        joinRule,
        tags,
        invitedHandleIds: [],
        powerLevels: {
          ban: 50,
          events: {
            'm.room.avatar': 50,
            'm.room.name': 50,
            'm.room.topic': 50,
            'm.reaction': 10,
            'm.room.redaction': 10,
          },
          eventsDefault: 25,
          invite: 25,
          kick: 50,
          redact: 50,
          usersDefault: 100,
        },
        avatarUrl: undefined,
      })
      verify(mockChannelsService.create(anything())).once()
    })

    it('Should throw an UnacceptableWordsError when an invalid word is used when creating a channel', async () => {
      const handleId = new HandleId('testHandleId')
      const name = 'handlename'
      const tags = ['tag-1', 'tag-2']
      const validWords = new Set([name, ...tags])
      const joinRule = ChannelJoinRuleEntity.PUBLIC
      const defaultMemberRole = ChannelRoleEntity.ADMIN
      when(mockWordValidationService.checkWordValidity(anything())).thenResolve(
        new Set([]),
      )

      await expect(
        instanceUnderTest.execute({
          handleId,
          name,
          joinRule,
          tags,
          invitedHandleIds: [],
          permissions: EntityDataFactory.defaultChannelPermissionsInput,
          defaultMemberRole,
        }),
      ).rejects.toThrow(UnacceptableWordsError)

      const [validateArgs] = capture(
        mockWordValidationService.checkWordValidity,
      ).first()
      expect(validateArgs).toStrictEqual<typeof validateArgs>(validWords)
      verify(mockWordValidationService.checkWordValidity(anything())).once()
      verify(mockChannelsService.create(anything())).never()
    })
  })
})
