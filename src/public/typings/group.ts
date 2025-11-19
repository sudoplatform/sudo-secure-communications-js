/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { GroupId } from './recipient'

/**
 * The Sudo Platform SDK representation of a Group. Model for a wrapper around a messaging group with 
 * extra fields for discoverability and customization.
 *
 * @interface Group
 * @property {GroupId} groupId Unique identifier of the group.
 * @property {string} name Optional display name for the group.
 * @property {string} description Optional explanation about what the group is about.
 * @property {string} avatarUrl Optional url for associated avatar image.
 * @property {GroupPermissions} permissions Optional permissions describing what roles can perform
 *  certain actions within the group.
 * @property {number} memberCount The number of joined members of the group.
 */
export interface Group {
  groupId: GroupId
  name?: string
  description?: string
  avatarUrl?: string
  permissions?: GroupPermissions
  memberCount: number
}

/**
 * The role of a member within a group, ranked in descending order.
 * Higher ranked roles are granted permissions of lower ranked roles.
 * 
 * @property ADMIN: The handle has power to make any changes to the group.
 * @property PARTICIPANT: The handle has basic power of making changes to the group.
 * @property NOBODY: The handle has no power to make any changes to the group.
 * 
 * @enum
 */
export enum GroupRole {
  ADMIN = 'ADMIN',
  PARTICIPANT = 'PARTICIPANT',
  NOBODY = 'NOBODY',
}

/**
 * Permissions of certain group functions and capabilities. Each capability requires a minimum 
 * {@link GroupRole} for handles to be able to execute.
 */
export class GroupPermissions {
  /**
   * Constructs a new instance of group permissions with role-based access control.
   * 
   * @property {GroupRole} sendMessages What role can send messages in the chat.
   * @property {GroupRole} inviteHandles What role can invite other handles.
   * @property {GroupRole} kickHandles What role can kick other handles.
   * @property {GroupRole} banHandles What role can ban other handles.
   * @property {GroupRole} changeGroupName What role can change the group's name.
   * @property {GroupRole} changeGroupDescription What role can change the group's description.
   * @property {GroupRole} changeGroupAvatar What role can change the group's avatar.
   * @property {GroupRole} deleteOthersMessages What role can delete anyone's messages.
   */
  constructor(
    public sendMessages: GroupRole,
    public inviteHandles: GroupRole,
    public kickHandles: GroupRole,
    public banHandles: GroupRole,
    public changeGroupName: GroupRole,
    public changeGroupDescription: GroupRole,
    public changeGroupAvatar: GroupRole,
    public deleteOthersMessages: GroupRole,
  ) {}

  /**
   * The default permissions for a group.
   */
  static default = new GroupPermissions(
    GroupRole.PARTICIPANT,
    GroupRole.PARTICIPANT,
    GroupRole.ADMIN,
    GroupRole.ADMIN,
    GroupRole.PARTICIPANT,
    GroupRole.PARTICIPANT,
    GroupRole.PARTICIPANT,
    GroupRole.NOBODY,
  )
}
