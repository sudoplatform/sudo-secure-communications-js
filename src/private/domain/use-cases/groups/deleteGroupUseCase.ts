/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { DefaultLogger, Logger } from '@sudoplatform/sudo-common'
import {
  GroupId,
  HandleId,
  HandleNotFoundError,
  PermissionDeniedError,
} from '../../../../public'
import { GroupPowerLevelsTransformer } from '../../../data/groups/transformer/groupPowerLevelsTransformer'
import { MatrixRoomsService } from '../../../data/rooms/matrixRoomsService'
import { SessionManager } from '../../../data/session/sessionManager'
import { delay } from '../../../util/delay'
import { MembershipStateEntity } from '../../entities/common/memberEntity'
import { GroupRoleEntity } from '../../entities/groups/groupEntity'

/**
 * Input for `DeleteGroupUseCase`.
 *
 * @interface DeleteGroupUseCaseInput
 */
interface DeleteGroupUseCaseInput {
  handleId: HandleId
  groupId: GroupId
}

/**
 * Application business logic for deleting a handle from a group.
 */
export class DeleteGroupUseCase {
  private readonly log: Logger

  public constructor(private readonly sessionManager: SessionManager) {
    this.log = new DefaultLogger(this.constructor.name)
  }

  async execute(input: DeleteGroupUseCaseInput): Promise<void> {
    this.log.debug(this.constructor.name, {
      input,
    })
    await this.deleteGroup(input.handleId, input.groupId.toString())
    // Delay to allow room to be fully returned by matrix
    await delay(3000)
  }

  private async deleteGroup(
    handleId: HandleId,
    groupId: string,
  ): Promise<void> {
    const matrixClient = await this.sessionManager.getMatrixClient(handleId)
    const matrixRoomsService = new MatrixRoomsService(matrixClient)

    const groupPowerLevelsTransformer = new GroupPowerLevelsTransformer()
    const members = await matrixRoomsService.getMembers(groupId)
    const currentMember = members.find(
      (member) => member.handle.handleId.toString() === handleId.toString(),
    )
    if (
      !currentMember ||
      currentMember.membership != MembershipStateEntity.JOINED
    ) {
      throw new HandleNotFoundError('Handle not found in group')
    } else if (
      groupPowerLevelsTransformer.fromPowerLevelToEntity(
        currentMember.powerLevel,
      ) != GroupRoleEntity.ADMIN
    ) {
      throw new PermissionDeniedError(
        'Cannot delete group as you are not the admin',
      )
    }

    // Check if current member has a higher role than everyone else in the group
    const isHighestRole = members.every(
      (member) =>
        member.handle.handleId.toString() === handleId.toString() ||
        !(
          member.membership === MembershipStateEntity.JOINED ||
          member.membership === MembershipStateEntity.INVITED
        ) ||
        member.powerLevel < currentMember.powerLevel,
    )
    if (!isHighestRole) {
      throw new PermissionDeniedError(
        'Cannot delete group as you do not have a role higher than all other members',
      )
    }

    // Delete group by kicking all members
    members.forEach(async (member) => {
      if (member.handle.handleId.toString() !== handleId.toString()) {
        await matrixRoomsService.kickHandle({
          roomId: groupId,
          targetHandleId: member.handle.handleId.toString(),
        })
      }
    })
    await matrixRoomsService.leave(groupId)
  }
}
