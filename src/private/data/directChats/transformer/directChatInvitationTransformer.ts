/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { DirectChatInvitation } from '../../../../public/typings/directChatInvitation'
import { DirectChatInvitationEntity } from '../../../domain/entities/directChats/directChatInvitationEntity'

export class DirectChatInvitationTransformer {
  fromEntityToAPI(entity: DirectChatInvitationEntity): DirectChatInvitation {
    return {
      chatId: entity.chatId,
      inviterHandle: entity.inviterHandle,
    }
  }
}
