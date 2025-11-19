/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { EventType } from 'matrix-js-sdk/lib/matrix'

/**
 * The elements of required power levels to perform each action in a room.
 *
 * @interface RoomPowerLevelsEntity
 */
export interface RoomPowerLevelsEntity {
  ban?: number
  events?: Record<EventType | string, number>
  events_default?: number
  invite?: number
  kick?: number
  notifications?: Record<string, number>
  redact?: number
  state_default?: number
  users?: Record<string, number>
  users_default?: number
}
