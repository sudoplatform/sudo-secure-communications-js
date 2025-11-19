/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { ChatId, HandleId } from '../../public'

export function toMatrixUserId(id: string, homeServer: string): string {
  return `@${id}:${homeServer}`
}

export function toHandleId(id: string): HandleId {
  return new HandleId(id.split('@')[1]?.split(':')[0] || '')
}

export function toChatId(id: string): ChatId {
  return new ChatId(id)
}
