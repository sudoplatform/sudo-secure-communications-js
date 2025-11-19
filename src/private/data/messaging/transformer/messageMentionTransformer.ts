/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { InvalidArgumentError, MessageMention } from '../../../../public'
import { MessageMentionEntity } from '../../../domain/entities/messaging/messageEntity'

export class MessageMentionTransformer {
  fromAPIToEntity(data: MessageMention): MessageMentionEntity {
    switch (data.type) {
      case 'Handle':
        return {
          type: 'Handle',
          handleId: data.handleId,
          name: data.name,
        }
      case 'Chat':
        return { type: 'Chat' }
      default:
        throw new InvalidArgumentError(
          `Unsupported mention type: ${(data as any).type}`,
        )
    }
  }
}
