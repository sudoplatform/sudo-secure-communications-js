/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { DefaultLogger, Logger } from '@sudoplatform/sudo-common'
import { GroupId, HandleId } from '../../../../public'
import { GroupPowerLevelsTransformer } from '../../../data/groups/transformer/groupPowerLevelsTransformer'
import { MatrixRoomsService } from '../../../data/rooms/matrixRoomsService'
import { SessionManager } from '../../../data/session/sessionManager'
import { delay } from '../../../util/delay'
import { GroupRoleEntity } from '../../entities/groups/groupEntity'
import { UpdateRoomMemberPowerLevelInput } from '../../entities/rooms/roomsService'

/**
 * Input for `UpdateGroupMemberRoleUseCase`.
 *
 * @interface UpdateGroupMemberRoleUseCaseInput
 */
interface UpdateGroupMemberRoleUseCaseInput {
  handleId: HandleId
  groupId: GroupId
  targetHandleId: HandleId
  role: GroupRoleEntity
}

/**
 * Application business logic for updating the role of a group member in a group.
 */
export class UpdateGroupMemberRoleUseCase {
  private readonly log: Logger

  public constructor(private readonly sessionManager: SessionManager) {
    this.log = new DefaultLogger(this.constructor.name)
  }

  async execute(input: UpdateGroupMemberRoleUseCaseInput): Promise<void> {
    this.log.debug(this.constructor.name, {
      input,
    })
    const powerLevelTransformer = new GroupPowerLevelsTransformer()
    const powerLevel = powerLevelTransformer.fromEntityToPowerLevel(input.role)
    await this.updateGroupMemberRole(input.handleId, {
      roomId: input.groupId.toString(),
      targetHandleId: input.targetHandleId.toString(),
      powerLevel,
    })
    // Delay to allow room to be fully returned by matrix
    await delay(3000)
  }

  private async updateGroupMemberRole(
    handleId: HandleId,
    input: UpdateRoomMemberPowerLevelInput,
  ): Promise<void> {
    const matrixClient = await this.sessionManager.getMatrixClient(handleId)
    const matrixRoomsService = new MatrixRoomsService(matrixClient)
    await matrixRoomsService.updateRoomMemberPowerLevel(input)
  }
}
