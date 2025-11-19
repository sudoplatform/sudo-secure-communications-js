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
 * Input for `GetGroupUseCase`.
 *
 * @interface GetGroupUseCaseInput
 */
interface GetGroupUseCaseInput {
  handleId: HandleId
  groupId: GroupId
}

/**
 * Application business logic for retrieving a group.
 */
export class GetGroupUseCase {
  private readonly log: Logger

  public constructor(private readonly sessionManager: SessionManager) {
    this.log = new DefaultLogger(this.constructor.name)
  }

  async execute(input: GetGroupUseCaseInput): Promise<GroupEntity | undefined> {
    this.log.debug(this.constructor.name, {
      input,
    })
    return await this.getGroup(input.handleId, input.groupId.toString())
  }

  private async getGroup(
    handleId: HandleId,
    groupId: string,
  ): Promise<GroupEntity | undefined> {
    const matrixClient = await this.sessionManager.getMatrixClient(handleId)
    const matrixRoomsService = new MatrixRoomsService(matrixClient)
    const room = await matrixRoomsService.get(groupId)
    const transformer = new GroupTransformer()
    return room ? transformer.fromRoomToEntity(room) : undefined
  }
}
