/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { DirectChat } from '../../../../public/typings/directChat'
import { DirectChatEntity } from '../../../domain/entities/directChats/directChatEntity'

export class DirectChatTransformer {
  fromEntityToAPI(entity: DirectChatEntity): DirectChat {
    return {
      id: entity.chatId,
      otherHandle: entity.otherHandle,
    }
  }
}
