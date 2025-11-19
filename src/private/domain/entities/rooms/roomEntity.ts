/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { RoomPowerLevelsEntity } from './roomPowerLevelsEntity'

/**
 * Core entity representation of a room business rule.
 *
 * @interface RoomEntity
 * @property {string} roomId Unique identifier of the room.
 * @property {CustomRoomType} type Optional type of room.
 * @property {string} name Optional display name for the room.
 * @property {string} description Optional explanation about what the room is about.
 * @property {string[]} tags Optional list of words to help searchability.
 * @property {string} avatarUrl Optional avatar image URL.
 * @property {RoomPowerLevelsEntity} powerLevels Optional power levels indicating what roles can perform
 *  certain actions within the room.
 * @property {number} memberCount The number of joined members of the room.
 */
export interface RoomEntity {
  roomId: string
  type?: CustomRoomType
  name?: string
  description?: string
  tags?: string[]
  avatarUrl?: string
  powerLevels?: RoomPowerLevelsEntity
  memberCount: number
}

/**
 * The type of room based on the custom type state event.
 *
 * @property DIRECT_CHAT: chat.direct
 * @property GROUP: chat.group
 * @property PRIVATE_CHANNEL: channel.private
 * @property PUBLIC_CHANNEL: channel.public
 * @property PUBLIC_INVITE_ONLY_CHANNEL: channel.public.invite
 *
 * @enum
 */
export enum CustomRoomType {
  DIRECT_CHAT = 'chat.direct',
  GROUP = 'chat.group',
  PRIVATE_CHANNEL = 'channel.private',
  PUBLIC_CHANNEL = 'channel.public',
  PUBLIC_INVITE_ONLY_CHANNEL = 'channel.public.invite',
}
