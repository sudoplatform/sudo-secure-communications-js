/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { ChannelId } from '../../../../public'

/**
 * Core entity representation of a channel business rule.
 *
 * @interface ChannelEntity
 * @property {ChannelId} channelId Unique identifier of the channel.
 * @property {string} name Optional display name for the channel.
 * @property {string} description Optional explanation about what the channel is about.
 * @property {string} avatarUrl Optional url for associated avatar image.
 * @property {ChannelJoinRuleEntity} joinRule Optional rule for joining and whether the channel is searchable, if known.
 * @property {string[]} tags A list of words to help searchability.
 * @property {ChannelPermissionsEntity} permissions Mapping of which channel-related change action can be performed by
 *  which channel role. Will be undefined if the handle hasn't joined the channel.
 * @property {ChannelRoleEntity} defaultMemberRole The default role members inherit when joining the channel.
 * @property {number} memberCount The number of joined members of the channel.
 * @property {Date} createdAt Date for when the channel was created.
 * @property {Date} updatedAt Date for when the channel was last updated.
 */
export interface ChannelEntity {
  channelId: ChannelId
  name?: string
  description?: string
  avatarUrl?: string
  joinRule?: ChannelJoinRuleEntity
  tags: string[]
  permissions?: ChannelPermissionsEntity
  defaultMemberRole?: ChannelRoleEntity
  memberCount: number
  createdAt: Date
  updatedAt: Date
}

/**
 * Core entity representation of a public channel search result business rule.
 *
 * @interface PublicChannelSearchResultEntity
 * @property {ChannelId} channelId Unique identifier of the public channel.
 * @property {string} name Display name of the public channel.
 * @property {string} description Optional explanation about what the channel is about.
 * @property {string} avatarUrl Optional url for associated avatar image.
 * @property {PublicChannelJoinRuleEntity} joinRule Optional rule for joining.
 * @property {string[]} tags  A list of words to help searchability.
 * @property {number} memberCount The number of joined members of the public channel.
 * @property {Date} createdAt Date for when the public channel was created.
 * @property {Date} updatedAt Date for when the public channel was last updated.
 */
export interface PublicChannelSearchResultEntity {
  channelId: ChannelId
  name: string
  description?: string
  avatarUrl?: string
  joinRule: PublicChannelJoinRuleEntity
  tags: string[]
  memberCount: number
  createdAt: Date
  updatedAt: Date
}

/**
 * Enumeration that defines rules for searching and joining a channel.
 *
 * @property PRIVATE: Channels with this rule are not searchable and can only be joined
 *  if explicitly invited.
 * @property PUBLIC: Channels with this rule are searchable and can be joined without
 *  an invitation.
 * @property PUBLIC_WITH_INVITE: Channels with this rule are searchable, but unlike
 *  PUBLIC they can only be joined if explicitly invited or by being approved after
 *  requesting to join.
 *
 * @enum
 */
export enum ChannelJoinRuleEntity {
  PRIVATE = 'PRIVATE',
  PUBLIC = 'PUBLIC',
  PUBLIC_WITH_INVITE = 'PUBLIC_WITH_INVITE',
}

/**
 * Utility to check if a channel is searchable.
 */
export function isChannelVisible(joinRule: ChannelJoinRuleEntity): boolean {
  return (
    joinRule === ChannelJoinRuleEntity.PUBLIC ||
    joinRule === ChannelJoinRuleEntity.PUBLIC_WITH_INVITE
  )
}

/**
 * Enumeration that defines whether channel search is for public or public
 * with invite channels.
 *
 * @property PUBLIC: Search for public channels only.
 * @property PUBLIC_WITH_INVITE: Search for public with invite channels only.
 *
 * @enum
 */
export enum PublicChannelJoinRuleEntity {
  PUBLIC = 'PUBLIC',
  PUBLIC_WITH_INVITE = 'PUBLIC_WITH_INVITE',
}

/**
 * The role of a member within a channel, ranked in descending order.
 * Higher ranked roles are granted permissions of lower ranked roles.
 *
 * @property ADMIN: The handle has power to make any changes to the channel.
 * @property MODERATOR: The handle has elevated power over making changes to the channel.
 * @property PARTICIPANT: The handle has basic power of making changes to the channel.
 * @property REACT_ONLY_PARTICIPANT: The handle can only react to messages in the chat.
 *
 * @enum
 */
export enum ChannelRoleEntity {
  ADMIN = 'ADMIN',
  MODERATOR = 'MODERATOR',
  PARTICIPANT = 'PARTICIPANT',
  REACT_ONLY_PARTICIPANT = 'REACT_ONLY_PARTICIPANT',
}

/**
 * Permissions of certain channel chat functions and capabilities. Each chat capability requires a minimum
 * {@link ChannelRoleEntity} for handles to be able to execute.
 */
export class ChannelPermissionsEntity {
  /**
   * Constructs a new instance of channel permissions with role-based access control.
   *
   * @interface ChannelPermissionsEntity
   * @property {ChannelRoleEntity} sendMessages What role can send messages in the chat.
   * @property {ChannelRoleEntity} inviteHandles What role can invite other handles.
   * @property {ChannelRoleEntity} kickHandles What role can kick other handles.
   * @property {ChannelRoleEntity} banHandles What role can ban other handles.
   * @property {ChannelRoleEntity} changeChannelName What role can change the channel's name.
   * @property {ChannelRoleEntity} changeChannelDescription What role can change the channel's description.
   * @property {ChannelRoleEntity} changeChannelAvatar What role can change the channel's avatar.
   * @property {ChannelRoleEntity} deleteOthersMessages What role can delete anyone's messages.
   */
  constructor(
    public sendMessages: ChannelRoleEntity,
    public inviteHandles: ChannelRoleEntity,
    public kickHandles: ChannelRoleEntity,
    public banHandles: ChannelRoleEntity,
    public changeChannelName: ChannelRoleEntity,
    public changeChannelDescription: ChannelRoleEntity,
    public changeChannelAvatar: ChannelRoleEntity,
    public deleteOthersMessages: ChannelRoleEntity,
  ) {}

  /**
   * Default required roles necessary to perform each action for new channels if not overridden
   * with {@link ChannelPermissionsInputEntity}.
   */
  static default = new ChannelPermissionsEntity(
    ChannelRoleEntity.PARTICIPANT,
    ChannelRoleEntity.PARTICIPANT,
    ChannelRoleEntity.MODERATOR,
    ChannelRoleEntity.MODERATOR,
    ChannelRoleEntity.MODERATOR,
    ChannelRoleEntity.MODERATOR,
    ChannelRoleEntity.MODERATOR,
    ChannelRoleEntity.MODERATOR,
  )
}

/**
 * An enumeration of all role customizable channel actions that can be updated
 * If undefined is set for a particular field the option will remain unchanged.
 *
 * @interface ChannelPermissionsInputEntity
 */
export interface ChannelPermissionsInputEntity {
  sendMessages?: ChannelRoleEntity
  inviteHandles?: ChannelRoleEntity
  kickHandles?: ChannelRoleEntity
  banHandles?: ChannelRoleEntity
  changeChannelName?: ChannelRoleEntity
  changeChannelDescription?: ChannelRoleEntity
  changeChannelAvatar?: ChannelRoleEntity
  deleteOthersMessages?: ChannelRoleEntity
}

/**
 * Representation of the fields and direction to sort channels.
 *
 * @interface ChannelSortOrderEntity
 * @property {ChannelSortFieldEntity} field The field names that search order can be applied to.
 * @property {ChannelSortDirectionEntity} direction The direction of the sorting on the field attribute.
 */
export interface ChannelSortOrderEntity {
  field: ChannelSortFieldEntity
  direction: ChannelSortDirectionEntity
}

/**
 * Enumeration that defines the attributes that ordering can be applied to.
 *
 * @property NAME: Order should be applied to the channel name attribute.
 * @property MEMBER_COUNT: Order should be applied to the channel member count attribute.
 *
 * @enum
 */
export enum ChannelSortFieldEntity {
  NAME = 'NAME',
  MEMBER_COUNT = 'MEMBER_COUNT',
}

/**
 * Enumeration that defines the direction of sort ordering.
 *
 * @property ASCENDING: Ascending order, smallest to largest or A-Z.
 * @property DESCENDING: Descending order, largest to smallest or Z-A.
 *
 * @enum
 */
export enum ChannelSortDirectionEntity {
  ASCENDING = 'ASCENDING',
  DESCENDING = 'DESCENDING',
}
