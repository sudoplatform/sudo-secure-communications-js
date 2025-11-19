/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { ChatId } from '../../../../public'
import { HandleEntity } from '../handle/handleEntity'

/**
 * Core entity representation of a direct chat invitation business rule.
 *
 * @interface DirectChatInvitationEntity
 * @property {ChatId} chatId The identifier of the direct chat.
 * @property {HandleEntity} inviterHandle The handle that is participating in the direct chat.
 */
export interface DirectChatInvitationEntity {
  chatId: ChatId
  inviterHandle: HandleEntity
}
