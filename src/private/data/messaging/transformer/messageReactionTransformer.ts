/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { MessageReaction } from '../../../../public'
import { MessageReactionEntity } from '../../../domain/entities/messaging/messageEntity'

export class MessageReactionTransformer {
  fromAPIToEntity(data: MessageReaction): MessageReactionEntity {
    return {
      content: data.content,
      count: data.count,
      senderHandleIds: data.senderHandleIds,
    }
  }

  fromEntityToAPI(entity: MessageReactionEntity): MessageReaction {
    return {
      content: entity.content,
      count: entity.count,
      senderHandleIds: entity.senderHandleIds,
    }
  }
}
