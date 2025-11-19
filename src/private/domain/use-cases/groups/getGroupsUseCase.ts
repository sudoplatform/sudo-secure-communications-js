/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { DefaultLogger, Logger } from '@sudoplatform/sudo-common'
import { GroupId, HandleId } from '../../../../public'
import { GroupTransformer } from '../../../data/groups/transformer/groupTransformer'
import { MatrixRoomsService } from '../../../data/rooms/matrixRoomsService'
import { SessionManager } from '../../../data/session/sessionManager'
import { GroupEntity } from '../../entities/groups/groupEntity'

/**
 * Input for `GetGroupsUseCase`.
 *
 * @interface GetGroupsUseCaseInput
 */
interface GetGroupsUseCaseInput {
  handleId: HandleId
  groupIds: GroupId[]
}

/**
 * Application business logic for retrieving a list of groups.
 */
export class GetGroupsUseCase {
  private readonly log: Logger

  public constructor(private readonly sessionManager: SessionManager) {
    this.log = new DefaultLogger(this.constructor.name)
  }

  async execute(input: GetGroupsUseCaseInput): Promise<GroupEntity[]> {
    this.log.debug(this.constructor.name, {
      input,
    })
    if (!input.groupIds.length) {
      return []
    }
    const ids = input.groupIds.map((id) => id.toString())
    return await this.listGroups(input.handleId, ids)
  }

  private async listGroups(
    handleId: HandleId,
    groupIds: string[],
  ): Promise<GroupEntity[]> {
    const matrixClient = await this.sessionManager.getMatrixClient(handleId)
    const matrixRoomsService = new MatrixRoomsService(matrixClient)
    const rooms = await matrixRoomsService.list(groupIds)
    const transformer = new GroupTransformer()
    return rooms.map(transformer.fromRoomToEntity)
  }
}
