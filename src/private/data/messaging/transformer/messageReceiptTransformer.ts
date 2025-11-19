/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { CachedReceipt } from 'matrix-js-sdk'
import { HandleId, MessageReceipt } from '../../../../public'
import { MessageReceiptEntity } from '../../../domain/entities/messaging/messageEntity'

export class MessageReceiptTransformer {
  fromAPIToEntity(data: MessageReceipt): MessageReceiptEntity {
    return {
      timestamp: data.timestamp,
      handleId: data.handleId,
    }
  }

  fromEntityToAPI(entity: MessageReceiptEntity): MessageReceipt {
    return {
      timestamp: entity.timestamp,
      handleId: entity.handleId,
    }
  }

  fromMatrixToEntity(receipt: CachedReceipt): MessageReceiptEntity {
    return {
      timestamp: receipt.data.ts,
      handleId: new HandleId(receipt.userId),
    }
  }
}
