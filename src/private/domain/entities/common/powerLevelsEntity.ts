/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * The elements of required power levels to perform each action and
 *  default level of handles in a {@link GroupEntity}.
 *
 * @interface PowerLevelsEntity
 * @property {number} usersDefault The default level of handles in the group.
 * @property {number} eventsDefault The default required level to send message events.
 * @property {number} invite The level required to invite a handle.
 * @property {number} kick The level required to kick a handle.
 * @property {number} ban The level required to ban a handle.
 * @property {number} redact The level required to redact an event sent by another handle.
 * @property {Record<string, number>} events The levels required to send specific event types.
 */
export interface PowerLevelsEntity {
  usersDefault?: number
  eventsDefault?: number
  invite?: number
  kick?: number
  ban?: number
  redact?: number
  events?: Record<string, number>
}
