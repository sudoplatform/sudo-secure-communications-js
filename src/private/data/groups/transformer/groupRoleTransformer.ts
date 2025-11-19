/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { GroupRole } from '../../../../public'
import { GroupRoleEntity } from '../../../domain/entities/groups/groupEntity'

export class GroupRoleTransformer {
  fromAPIToEntity(data: GroupRole): GroupRoleEntity {
    switch (data) {
      case GroupRole.ADMIN:
        return GroupRoleEntity.ADMIN
      case GroupRole.PARTICIPANT:
        return GroupRoleEntity.PARTICIPANT
      case GroupRole.NOBODY:
        return GroupRoleEntity.NOBODY
    }
  }

  fromEntityToAPI(entity: GroupRoleEntity): GroupRole {
    switch (entity) {
      case GroupRoleEntity.ADMIN:
        return GroupRole.ADMIN
      case GroupRoleEntity.PARTICIPANT:
        return GroupRole.PARTICIPANT
      case GroupRoleEntity.NOBODY:
        return GroupRole.NOBODY
    }
  }
}
