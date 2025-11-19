/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { ChannelRoleEntity } from '../channels/channelEntity'
import { GroupRoleEntity } from '../groups/groupEntity'
import { HandleEntity } from '../handle/handleEntity'

/**
 * Core entity representation of a member business rule.
 *
 * @interface MemberEntity
 * @property {HandleEntity} handle Handle associated with the member.
 * @property {MembershipStateEntity} membership The membership state for this handle. See {@link MembershipStateEntity}.
 */
export interface MemberEntity {
  handle: HandleEntity
  membership: MembershipStateEntity
}

/**
 * The state of a member.
 *
 * @enum
 */
export enum MembershipStateEntity {
  INVITED = 'INVITED',
  REQUESTED = 'REQUESTED',
  JOINED = 'JOINED',
  LEFT = 'LEFT',
  BANNED = 'BANNED',
}

/**
 * Core entity representation of a channe lmember business rule.
 *
 * @interface ChannelMemberEntity
 * @property {HandleEntity} handle See {@link MemberEntity}.
 * @property {GroupMembershipState} membership See {@link MemberEntity}.
 * @property {ChannelRoleEntity} role The role this channel member is assigned. See {@link ChannelRoleEntity}.
 */
export interface ChannelMemberEntity extends MemberEntity {
  role: ChannelRoleEntity
}

/**
 * Core entity representation of a group member business rule.
 *
 * @interface GroupMemberEntity
 * @property {HandleEntity} handle See {@link MemberEntity}.
 * @property {GroupMembershipState} membership See {@link MemberEntity}.
 * @property {GroupRoleEntity} role The role this group member is assigned. See {@link GroupRoleEntity}.
 */
export interface GroupMemberEntity extends MemberEntity {
  role: GroupRoleEntity
}

/**
 * Core entity representation of a room member business rule.
 *
 * @interface RoomMemberEntity
 * @property {HandleEntity} handle Handle associated with the member.
 * @property {MembershipStateEntity} membership The membership state for this handle. See {@link MembershipStateEntity}.
 * @property {number} powerLevel The power level this member is assigned.
 */
export interface RoomMemberEntity {
  handle: HandleEntity
  membership: MembershipStateEntity
  powerLevel: number
}
