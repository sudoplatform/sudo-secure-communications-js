/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { DefaultLogger, Logger } from '@sudoplatform/sudo-common'
import { GroupId, HandleId } from '../../../../public'
import { GroupMemberTransformer } from '../../../data/groups/transformer/groupMemberTransformer'
import { MatrixRoomsService } from '../../../data/rooms/matrixRoomsService'
import { SessionManager } from '../../../data/session/sessionManager'
import { GroupMemberEntity } from '../../entities/common/memberEntity'

/**
 * Input for `GetGroupMembersUseCase`.
 *
 * @interface GetGroupMembersUseCaseInput
 */
interface GetGroupMembersUseCaseInput {
  handleId: HandleId
  groupId: GroupId
}

/**
 * Application business logic for retrieving a list of group members in a group.
 */
export class GetGroupMembersUseCase {
  private readonly log: Logger

  public constructor(private readonly sessionManager: SessionManager) {
    this.log = new DefaultLogger(this.constructor.name)
  }

  async execute(
    input: GetGroupMembersUseCaseInput,
  ): Promise<GroupMemberEntity[]> {
    this.log.debug(this.constructor.name, {
      input,
    })
    return await this.getGroupMembers(input.handleId, input.groupId.toString())
  }

  private async getGroupMembers(
    handleId: HandleId,
    groupId: string,
  ): Promise<GroupMemberEntity[]> {
    const matrixClient = await this.sessionManager.getMatrixClient(handleId)
    const matrixRoomsService = new MatrixRoomsService(matrixClient)
    const members = await matrixRoomsService.getMembers(groupId)
    const transformer = new GroupMemberTransformer()
    return members.map(transformer.fromRoomToEntity)
  }
}
