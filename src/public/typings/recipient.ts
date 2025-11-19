/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 *  The Sudo Platform SDK representation of a base type for Groups, Channels or Direct Chats.
 * 
 * @interface Recipient
 * @property {string} value The value representing either a group, channel or direct chat.
 */
export interface Recipient {
  value: string
}

/**
 * Identifier type representing a unique chat group.
 */
export class GroupId implements Recipient {
  value: string

  constructor(value: string) {
    this.value = value
  }

  toString(): string {
    return this.value
  }
}

/**
 * Identifier type representing a unique channel.
 */
export class ChannelId implements Recipient {
  value: string

  constructor(value: string) {
    this.value = value
  }

  toString(): string {
    return this.value
  }
}

/**
 * Identifier type representing a unique direct chat.
 */
export class ChatId implements Recipient {
  value: string

  constructor(value: string) {
    this.value = value
  }

  toString(): string {
    return this.value
  }
}
