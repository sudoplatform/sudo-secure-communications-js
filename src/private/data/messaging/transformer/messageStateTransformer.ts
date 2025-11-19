/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { MessageState } from '../../../../public'
import { MessageStateEntity } from '../../../domain/entities/messaging/messageEntity'

export class MessageStateTransformer {
  fromAPIToEntity(data: MessageState): MessageStateEntity {
    switch (data) {
      case MessageState.PENDING:
        return MessageStateEntity.PENDING
      case MessageState.COMMITTED:
        return MessageStateEntity.COMMITTED
      case MessageState.FAILED:
        return MessageStateEntity.FAILED
    }
  }

  fromEntityToAPI(entity: MessageStateEntity): MessageState {
    switch (entity) {
      case MessageStateEntity.PENDING:
        return MessageState.PENDING
      case MessageStateEntity.COMMITTED:
        return MessageState.COMMITTED
      case MessageStateEntity.FAILED:
        return MessageState.FAILED
    }
  }
}
