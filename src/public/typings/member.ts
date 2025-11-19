/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { ChannelRole } from './channel'
import { GroupRole } from './group'
import { Handle } from './handle'

/**
 * The Sudo Platform SDK representation of a Member.
 *
 * @interface Member
 * @property {Handle} handle Handle associated with the member.
 * @property {MembershipState} membership The membership state for this handle. See {@link MembershipState}.
 */
export interface Member {
  handle: Handle
  membership: MembershipState
}

/**
 * The state of a member.
 * 
 * @property INVITED: The handle was invited to the channel/group.
 * @property REQUESTED: The handle has requested to join the channel.
 * @property JOINED: The handle has joined the channel/group.
 * @property LEFT: The handle was previously a member of the channel/group but chose to leave or was kicked.
 * @property BANNED: The handle was banned from the channel/group.
 *
 * @enum
 */
export enum MembershipState {
  INVITED = 'INVITED',
  REQUESTED = 'REQUESTED',
  JOINED = 'JOINED',
  LEFT = 'LEFT',
  BANNED = 'BANNED'
}

/**
 * The Sudo Platform SDK representation of a Channel Member. Model representing a handle's state as a member
 * of a channel.
 *
 * @interface ChannelMember
 * @property {HandleId} handleId See {@link Member}.
 * @property {MembershipState} membership See {@link Member}.
 * @property {ChannelRole} role The role this channel member is assigned. See {@link ChannelRole}.
 */
export interface ChannelMember extends Member {
  role: ChannelRole
}

/**
 * The Sudo Platform SDK representation of a Group Member. Model representing a handle's state as a member
 * of a group.
 *
 * @interface GroupMember
 * @property {HandleId} handleId See {@link Member}.
 * @property {MembershipState} membership See {@link Member}.
 * @property {GroupRole} role The role this group member is assigned, see {@link GroupRole}.
 */
export interface GroupMember extends Member {
  role: GroupRole
}
