/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { GroupId } from '../../../../public'

/**
 * Core entity representation of a group business rule.
 *
 * @interface GroupEntity
 * @property {GroupId} groupId Unique identifier of the group.
 * @property {string} name Optional display name for the group.
 * @property {string} description Optional explanation about what the group is about.
 * @property {string} avatarUrl Optional url for associated avatar image.
 * @property {GroupPermissionsEntity} permissions Optional permissions describing what roles can perform
 *  certain actions within the group.
 * @property {number} memberCount The number of joined members of the group.
 */
export interface GroupEntity {
  groupId: GroupId
  name?: string
  description?: string
  avatarUrl?: string
  permissions?: GroupPermissionsEntity
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
export enum GroupRoleEntity {
  ADMIN = 'ADMIN',
  PARTICIPANT = 'PARTICIPANT',
  NOBODY = 'NOBODY',
}

/**
 * Permissions of certain group functions and capabilities. Each capability requires a minimum
 * {@link GroupRoleEntity} for handles to be able to execute.
 */
export class GroupPermissionsEntity {
  /**
   * Constructs a new instance of group permissions with role-based access control.
   *
   * @property {GroupRoleEntity} sendMessages What role can send messages in the chat.
   * @property {GroupRoleEntity} inviteHandles What role can invite other handles.
   * @property {GroupRoleEntity} kickHandles What role can kick other handles.
   * @property {GroupRoleEntity} banHandles What role can ban other handles.
   * @property {GroupRoleEntity} changeGroupName What role can change the group's name.
   * @property {GroupRoleEntity} changeGroupDescription What role can change the group's description.
   * @property {GroupRoleEntity} changeGroupAvatar What role can change the group's avatar.
   * @property {GroupRoleEntity} deleteOthersMessages What role can delete anyone's messages.
   */
  constructor(
    public sendMessages: GroupRoleEntity,
    public inviteHandles: GroupRoleEntity,
    public kickHandles: GroupRoleEntity,
    public banHandles: GroupRoleEntity,
    public changeGroupName: GroupRoleEntity,
    public changeGroupDescription: GroupRoleEntity,
    public changeGroupAvatar: GroupRoleEntity,
    public deleteOthersMessages: GroupRoleEntity,
  ) {}

  static default = new GroupPermissionsEntity(
    GroupRoleEntity.PARTICIPANT,
    GroupRoleEntity.PARTICIPANT,
    GroupRoleEntity.ADMIN,
    GroupRoleEntity.ADMIN,
    GroupRoleEntity.PARTICIPANT,
    GroupRoleEntity.PARTICIPANT,
    GroupRoleEntity.PARTICIPANT,
    GroupRoleEntity.NOBODY,
  )
}
