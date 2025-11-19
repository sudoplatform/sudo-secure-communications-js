/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { DefaultLogger, Logger } from '@sudoplatform/sudo-common'
import { HandleId, UnacceptableWordsError } from '../../../../public'
import { ChannelPowerLevelsTransformer } from '../../../data/channels/transformer/channelPowerLevelsTransformer'
import {
  ChannelEntity,
  ChannelJoinRuleEntity,
  ChannelPermissionsInputEntity,
  ChannelRoleEntity,
} from '../../entities/channels/channelEntity'
import {
  ChannelsService,
  CreateChannelInput,
} from '../../entities/channels/channelsService'
import { WordValidationService } from '../../entities/wordValidation/wordValidationService'

/**
 * Input for `CreateChannelUseCase`.
 *
 * @interface CreateChannelUseCaseInput
 */
interface CreateChannelUseCaseInput {
  handleId: HandleId
  name?: string
  description?: string
  joinRule: ChannelJoinRuleEntity
  tags: string[]
  invitedHandleIds: HandleId[]
  permissions: ChannelPermissionsInputEntity
  defaultMemberRole: ChannelRoleEntity
}

/**
 * Application business logic for creating a channel.
 */
export class CreateChannelUseCase {
  private readonly log: Logger

  public constructor(
    private readonly channelsService: ChannelsService,
    private readonly wordValidationService: WordValidationService,
  ) {
    this.log = new DefaultLogger(this.constructor.name)
  }

  async execute(input: CreateChannelUseCaseInput): Promise<ChannelEntity> {
    this.log.debug(this.constructor.name, {
      input,
    })
    // Validate words used in the input
    const wordsToValidate = new Set([
      ...input.tags,
      ...(input.name ? [input.name] : []),
    ])
    const validWords =
      await this.wordValidationService.checkWordValidity(wordsToValidate)
    if (wordsToValidate.size !== validWords.size) {
      throw new UnacceptableWordsError()
    }
    const powerLevelsTransformer = new ChannelPowerLevelsTransformer()
    const request: CreateChannelInput = {
      selfHandleId: input.handleId.toString(),
      name: input.name,
      description: input.description,
      joinRule: input.joinRule,
      tags: input.tags,
      invitedHandleIds: input.invitedHandleIds.map((id) => {
        return id.toString()
      }),
      powerLevels: powerLevelsTransformer.toInitialPowerLevels(
        input.permissions,
        input.defaultMemberRole,
      ),
      avatarUrl: undefined,
    }
    return await this.channelsService.create(request)
  }
}
