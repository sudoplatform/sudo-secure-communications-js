/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { KnownMembership, Membership } from 'matrix-js-sdk/lib/types'
import { MembershipState } from '../../../../public'
import { MembershipStateEntity } from '../../../domain/entities/common/memberEntity'

export class MembershipStateTransformer {
  fromEntityToAPI(entity: MembershipStateEntity): MembershipState {
    switch (entity) {
      case MembershipStateEntity.BANNED:
        return MembershipState.BANNED
      case MembershipStateEntity.INVITED:
        return MembershipState.INVITED
      case MembershipStateEntity.JOINED:
        return MembershipState.JOINED
      case MembershipStateEntity.REQUESTED:
        return MembershipState.REQUESTED
      case MembershipStateEntity.LEFT:
        return MembershipState.LEFT
    }
  }

  fromMatrixToEntity(membership: Membership): MembershipStateEntity {
    switch (membership) {
      case KnownMembership.Ban:
        return MembershipStateEntity.BANNED
      case KnownMembership.Invite:
        return MembershipStateEntity.INVITED
      case KnownMembership.Join:
        return MembershipStateEntity.JOINED
      case KnownMembership.Knock:
        return MembershipStateEntity.REQUESTED
      case KnownMembership.Leave:
        return MembershipStateEntity.LEFT
      default:
        return MembershipStateEntity.JOINED
    }
  }
}
