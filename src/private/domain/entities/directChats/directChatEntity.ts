/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { ChatId } from '../../../../public'
import { HandleEntity } from '../handle/handleEntity'

/**
 * Core entity representation of a direct chat business rule.
 *
 * @interface DirectChatEntity
 * @property {ChatId} chatId The identifier of the direct chat.
 * @property {HandleEntity} otherHandle The handle that is participating in the direct chat.
 */
export interface DirectChatEntity {
  chatId: ChatId
  otherHandle: HandleEntity
}

/**
 * The role of a member within a direct chat, ranked in descending order.
 *
 * @property PARTICIPANT: The handle has basic power of making changes to the direct chat.
 * @property NOBODY: The handle has no power to make any changes to the direct chat.
 *
 * @enum
 */
export enum DirectChatRoleEntity {
  PARTICIPANT = 'PARTICIPANT',
  NOBODY = 'NOBODY',
}

/**
 * Permissions of certain direct chat functions and capabilities. Each capability requires a minimum
 * {@link DirectChatRoleEntity} for handles to be able to execute.
 */
export class DirectChatPermissionsEntity {
  /**
   * Constructs a new instance of direct chat permissions with role-based access control.
   *
   * @property {DirectChatRoleEntity} deleteOthersMessages What role can delete anyone's messages.
   */
  constructor(public deleteOthersMessages: DirectChatRoleEntity) {}

  static default = new DirectChatPermissionsEntity(DirectChatRoleEntity.NOBODY)
}
