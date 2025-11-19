/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { DirectChatRoleEntity } from '../../../domain/entities/directChats/directChatEntity'

export class DirectChatPowerLevelsTransformer {
  fromEntityToPowerLevel(role: DirectChatRoleEntity): number {
    switch (role) {
      case DirectChatRoleEntity.NOBODY:
        return 101
      case DirectChatRoleEntity.PARTICIPANT:
        return 100
    }
  }
}
