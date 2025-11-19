/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { DefaultLogger, Logger } from '@sudoplatform/sudo-common'
import { HandleId, UnacceptableWordsError } from '../../../../public'
import { GroupPowerLevelsTransformer } from '../../../data/groups/transformer/groupPowerLevelsTransformer'
import { GroupTransformer } from '../../../data/groups/transformer/groupTransformer'
import { MatrixRoomsService } from '../../../data/rooms/matrixRoomsService'
import { SessionManager } from '../../../data/session/sessionManager'
import { delay } from '../../../util/delay'
import { PowerLevelsEntity } from '../../entities/common/powerLevelsEntity'
import {
  GroupEntity,
  GroupPermissionsEntity,
  GroupRoleEntity,
} from '../../entities/groups/groupEntity'
import { CreateRoomInput } from '../../entities/rooms/roomsService'
import { WordValidationService } from '../../entities/wordValidation/wordValidationService'

/**
 * Input for `CreateGroupUseCase`.
 *
 * @interface CreateGroupUseCaseInput
 */
interface CreateGroupUseCaseInput {
  handleId: HandleId
  name?: string
  description?: string
  invitedHandleIds: HandleId[]
}

/**
 * Application business logic for creating a group.
 */
export class CreateGroupUseCase {
  private readonly log: Logger

  public constructor(
    private readonly sessionManager: SessionManager,
    private readonly wordValidationService: WordValidationService,
  ) {
    this.log = new DefaultLogger(this.constructor.name)
  }

  async execute(input: CreateGroupUseCaseInput): Promise<GroupEntity> {
    this.log.debug(this.constructor.name, {
      input,
    })
    // Validate words used in the input
    const wordsToValidate = new Set([
      ...(input.name ? [input.name] : []),
      ...(input.description ? [input.description] : []),
    ])
    const validWords =
      await this.wordValidationService.checkWordValidity(wordsToValidate)
    if (wordsToValidate.size != validWords.size) {
      throw new UnacceptableWordsError()
    }
    const powerLevelsTransformer = new GroupPowerLevelsTransformer()
    const powerLevels: PowerLevelsEntity = {
      usersDefault: powerLevelsTransformer.fromEntityToPowerLevel(
        GroupRoleEntity.PARTICIPANT,
      ),
      eventsDefault: powerLevelsTransformer.fromEntityToPowerLevel(
        GroupPermissionsEntity.default.sendMessages,
      ),
      invite: powerLevelsTransformer.fromEntityToPowerLevel(
        GroupPermissionsEntity.default.inviteHandles,
      ),
      kick: powerLevelsTransformer.fromEntityToPowerLevel(
        GroupPermissionsEntity.default.kickHandles,
      ),
      ban: powerLevelsTransformer.fromEntityToPowerLevel(
        GroupPermissionsEntity.default.banHandles,
      ),
      redact: powerLevelsTransformer.fromEntityToPowerLevel(
        GroupPermissionsEntity.default.deleteOthersMessages,
      ),
      events: {
        'm.room.name': powerLevelsTransformer.fromEntityToPowerLevel(
          GroupPermissionsEntity.default.changeGroupName,
        ),
        'm.room.topic': powerLevelsTransformer.fromEntityToPowerLevel(
          GroupPermissionsEntity.default.changeGroupDescription,
        ),
        'm.room.avatar': powerLevelsTransformer.fromEntityToPowerLevel(
          GroupPermissionsEntity.default.changeGroupAvatar,
        ),
      },
    }
    const request: CreateRoomInput = {
      name: input.name,
      description: input.description,
      avatarUrl: undefined,
      invitedHandleIds: input.invitedHandleIds.map((id) => {
        return id.toString()
      }),
      powerLevels,
    }
    const result = await this.createGroup(input.handleId, request)
    // Delay to allow new room to be fully returned by matrix
    await delay(3000)
    return result
  }

  private async createGroup(
    handleId: HandleId,
    input: CreateRoomInput,
  ): Promise<GroupEntity> {
    {
      const matrixClient = await this.sessionManager.getMatrixClient(handleId)
      const matrixRoomsService = new MatrixRoomsService(matrixClient)
      const room = await matrixRoomsService.create(input)
      const transformer = new GroupTransformer()
      return transformer.fromRoomToEntity(room)
    }
  }
}
