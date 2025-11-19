/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { ChannelInvitationRequest } from '../../../../public'
import { ChannelInvitationRequestEntity } from '../../../domain/entities/channels/channelInvitationRequestEntity'

export class ChannelInvitationRequestTransformer {
  fromEntityToAPI(
    entity: ChannelInvitationRequestEntity,
  ): ChannelInvitationRequest {
    return {
      channelId: entity.channelId,
      handleId: entity.handleId,
      reason: entity.reason,
      createdAt: entity.createdAt,
    }
  }
}
