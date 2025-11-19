/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { ChannelId } from './recipient'

/**
 * The Sudo Platform SDK representation of a Channel. Model for a wrapper around a messaging channel with 
 * extra fields for discoverability and customization.
 *
 * @interface Channel
 * @property {ChannelId} channelId Unique identifier of the channel.
 * @property {string} name Optional display name for the channel.
 * @property {string} description Optional explanation about what the channel is about.
 * @property {string} avatarUrl Optional url for associated avatar image.
 * @property {ChannelJoinRule} joinRule Optional rule for joining and whether the channel is searchable, if known.
 * @property {string[]} tags A list of words to help searchability.
 * @property {ChannelPermissions} permissions Mapping of which channel-related change action can be performed by
 *  which channel role. Will be undefined if the handle hasn't joined the channel.
 * @property {ChannelRole} defaultMemberRole The default role members inherit when joining the channel.
 * @property {number} memberCount The number of joined members of the channel.
 * @property {Date} createdAt Date for when the channel was created.
 * @property {Date} updatedAt Date for when the channel was last updated.
 */
export interface Channel {
  channelId: ChannelId
  name?: string
  description?: string
  avatarUrl?: string
  joinRule?: ChannelJoinRule
  tags: string[]
  permissions?: ChannelPermissions
  defaultMemberRole?: ChannelRole
  memberCount: number
  createdAt: Date
  updatedAt: Date
}

/**
 * The Sudo Platform SDK representation of a Public Channel Search Result.
 * 
 * @interface PublicChannelSearchResult
 * @property {ChannelId} channelId Unique identifier of the public channel.
 * @property {string} name Display name of the public channel.
 * @property {string} description Optional explanation about what the channel is about.
 * @property {string} avatarUrl Optional url for associated avatar image.
 * @property {PublicChannelJoinRule} joinRule Optional rule for joining.
 * @property {string[]} tags  A list of words to help searchability.
 * @property {number} memberCount The number of joined members of the public channel.
 * @property {Date} createdAt Date for when the public channel was created.
 * @property {Date} updatedAt Date for when the public channel was last updated.
 */
export interface PublicChannelSearchResult {
  channelId: ChannelId
  name: string
  description?: string
  avatarUrl?: string
  joinRule: PublicChannelJoinRule
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
export enum ChannelJoinRule {
  PRIVATE = 'PRIVATE',
  PUBLIC = 'PUBLIC',
  PUBLIC_WITH_INVITE = 'PUBLIC_WITH_INVITE'
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
export enum PublicChannelJoinRule {
  PUBLIC = 'PUBLIC',
  PUBLIC_WITH_INVITE = 'PUBLIC_WITH_INVITE',
}

/**
 * The role of a member within a channel, ranked in descending order.
 * Higher ranked roles are granted permissions of lower ranked roles.
 * 
 * @property ADMIN: The handle has power to make any changes to the channel
 * @property MODERATOR: The handle has elevated power over making changes to the channel.
 * @property PARTICIPANT: The handle has basic power of making changes to the channel.
 * @property REACT_ONLY_PARTICIPANT: The handle can only react to messages in the chat.
 * 
 * @enum
 */
export enum ChannelRole {
  ADMIN = 'ADMIN',
  MODERATOR = 'MODERATOR',
  PARTICIPANT = 'PARTICIPANT',
  REACT_ONLY_PARTICIPANT = 'REACT_ONLY_PARTICIPANT'
}

/**
 * Permissions of certain channel chat functions and capabilities. Each chat capability requires a minimum 
 * {@link ChannelRole} for handles to be able to execute.
 */
export class ChannelPermissions {
  /**
   * Constructs a new instance of channel permissions with role-based access control.
   * 
   * @interface ChannelPermissions
   * @property {ChannelRole} sendMessages What role can send messages in the chat.
   * @property {ChannelRole} inviteHandles What role can invite other handles.
   * @property {ChannelRole} kickHandles What role can kick other handles.
   * @property {ChannelRole} banHandles What role can ban other handles.
   * @property {ChannelRole} changeChannelName What role can change the channel's name.
   * @property {ChannelRole} changeChannelDescription What role can change the channel's description.
   * @property {ChannelRole} changeChannelAvatar What role can change the channel's avatar.
   * @property {ChannelRole} deleteOthersMessages What role can delete anyone's messages.
   */
  constructor(
    public sendMessages: ChannelRole,
    public inviteHandles: ChannelRole,
    public kickHandles: ChannelRole,
    public banHandles: ChannelRole,
    public changeChannelName: ChannelRole,
    public changeChannelDescription: ChannelRole,
    public changeChannelAvatar: ChannelRole,
    public deleteOthersMessages: ChannelRole,
  ) {}

  /**
   * Default required roles necessary to perform each action for new channels if not overridden
   * with {@link ChannelPermissionsInput}.
   */
  static default = new ChannelPermissions(
    ChannelRole.PARTICIPANT,
    ChannelRole.PARTICIPANT,
    ChannelRole.MODERATOR,
    ChannelRole.MODERATOR,
    ChannelRole.MODERATOR,
    ChannelRole.MODERATOR,
    ChannelRole.MODERATOR,
    ChannelRole.MODERATOR
  )
}

/**
 * An enumeration of all role customizable channel actions that can be updated
 * If undefined is set for a particular field the option will remain unchanged.
 * 
 * @interface ChannelPermissionsInput
 */
export interface ChannelPermissionsInput {
  sendMessages?: ChannelRole
  inviteHandles?: ChannelRole
  kickHandles?: ChannelRole
  banHandles?: ChannelRole
  changeChannelName?: ChannelRole
  changeChannelDescription?: ChannelRole
  changeChannelAvatar?: ChannelRole
  deleteOthersMessages?: ChannelRole
}

/**
 * Representation of the fields and direction to sort channels.
 *
 * @interface ChannelSortOrder
 * @property {ChannelSortField} field The field names that search order can be applied to.
 * @property {ChannelSortDirection} direction The direction of the sorting on the field attribute.
 */
export interface ChannelSortOrder {
  field: ChannelSortField
  direction: ChannelSortDirection
}

/**
 * Enumeration that defines the attributes that ordering can be applied to.
 * 
 * @property NAME: Order should be applied to the channel name attribute.
 * @property MEMBER_COUNT: Order should be applied to the channel member count attribute.
 * 
 * @enum
 */
export enum ChannelSortField {
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
export enum ChannelSortDirection {
  ASCENDING = 'ASCENDING',
  DESCENDING = 'DESCENDING',
}
