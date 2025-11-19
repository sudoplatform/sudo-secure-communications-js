/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { DefaultLogger, Logger } from '@sudoplatform/sudo-common'
import { DefaultChannelsService } from '../../private/data/channels/defaultChannelsService'
import { ApiClient } from '../../private/data/common/apiClient'
import { SecureCommsServiceConfig } from '../../private/data/common/config'
import { GroupMemberTransformer } from '../../private/data/groups/transformer/groupMemberTransformer'
import { GroupRoleTransformer } from '../../private/data/groups/transformer/groupRoleTransformer'
import { GroupTransformer } from '../../private/data/groups/transformer/groupTransformer'
import { MediaCredentialManager } from '../../private/data/media/mediaCredentialManager'
import { SessionManager } from '../../private/data/session/sessionManager'
import { DefaultWordValidationService } from '../../private/data/wordValidation/defaultWordValidationService'
import { AcceptInvitationUseCase } from '../../private/domain/use-cases/groups/acceptInvitationUseCase'
import { BanHandleUseCase } from '../../private/domain/use-cases/groups/banHandleUseCase'
import { CreateGroupUseCase } from '../../private/domain/use-cases/groups/createGroupUseCase'
import { DeclineInvitationUseCase } from '../../private/domain/use-cases/groups/declineInvitationUseCase'
import { DeleteGroupUseCase } from '../../private/domain/use-cases/groups/deleteGroupUseCase'
import { GetGroupMembersUseCase } from '../../private/domain/use-cases/groups/getGroupMembersUseCase'
import { GetGroupUseCase } from '../../private/domain/use-cases/groups/getGroupUseCase'
import { GetGroupsUseCase } from '../../private/domain/use-cases/groups/getGroupsUseCase'
import { KickHandleUseCase } from '../../private/domain/use-cases/groups/kickHandleUseCase'
import { LeaveGroupUseCase } from '../../private/domain/use-cases/groups/leaveGroupUseCase'
import { ListInvitationsUseCase } from '../../private/domain/use-cases/groups/listInvitationsUseCase'
import { ListJoinedGroupsUseCase } from '../../private/domain/use-cases/groups/listJoinedGroupsUseCase'
import { SendInvitationsUseCase } from '../../private/domain/use-cases/groups/sendInvitationsUseCase'
import { UnbanHandleUseCase } from '../../private/domain/use-cases/groups/unbanHandleUseCase'
import { UpdateGroupMemberRoleUseCase } from '../../private/domain/use-cases/groups/updateGroupMemberRoleUseCase'
import { UpdateGroupUseCase } from '../../private/domain/use-cases/groups/updateGroupUseCase'
import { WithdrawInvitationUseCase } from '../../private/domain/use-cases/groups/withdrawInvitationUseCase'
import { AvatarInput, Input } from '../secureCommsClient'
import { Group, GroupId, GroupMember, GroupRole, HandleId } from '../typings'

/**
 * Properties required or optional when creating a new group. Groups are always
 * end-to-end encrypted.
 *
 * @interface CreateGroupInput
 * @property {HandleId} handleId Identifier of the handle owned by this client.
 * @property {string} name Optional display name for the group.
 * @property {string} description Optional explanation about what the group is about.
 * @property {AvatarInput} avatar Optional file to use as the group's avatar.
 * @property {HandleId[]} invitedHandleIds The identifiers of the handles to invite immediately when the group is created.
 */
export interface CreateGroupInput {
  handleId: HandleId
  name?: string
  description?: string
  avatar?: AvatarInput
  invitedHandleIds: HandleId[]
}

/**
 * Updatable fields when making an update to a group. If a field's {@link Input} is
 * undefined, that setting is not modified. If the value inside the {@link Input} is undefined,
 * that setting is unset.
 *
 * @interface UpdateGroupInput
 * @property {HandleId} handleId Identifier of the handle owned by this client.
 * @property {GroupId} groupId The identifier of the group to update.
 * @property {Input<string | undefined>} name The display name for the group.
 * @property {Input<string | undefined>} description An explanation about what the group is about.
 * @property {Input<AvatarInput | undefined>} avatar File to upload to use as the group's avatar.
 */
export interface UpdateGroupInput {
  handleId: HandleId
  groupId: GroupId
  name?: Input<string | undefined>
  description?: Input<string | undefined>
  avatar?: Input<AvatarInput | undefined>
}

/**
 * Properties required to delete an existing group.
 *
 * @interface DeleteGroupInput
 * @property {HandleId} handleId Identifier of the handle owned by this client.
 * @property {GroupId} groupId Identifier of the group to delete.
 */
export interface DeleteGroupInput {
  handleId: HandleId
  groupId: GroupId
}

/**
 * Properties required to retrieve a group.
 *
 * @interface GetGroupInput
 * @property {HandleId} handleId Identifier of the handle owned by this client.
 * @property {GroupId} groupId The identifier of the group to retrieve.
 */
export interface GetGroupInput {
  handleId: HandleId
  groupId: GroupId
}

/**
 * Properties required to retrieve a list of groups.
 *
 * @interface GetGroupsInput
 * @property {HandleId} handleId Identifier of the handle owned by this client.
 * @property {GroupId[]} groupIds A list of group identifiers for the desired groups.
 */
export interface GetGroupsInput {
  handleId: HandleId
  groupIds: GroupId[]
}

/**
 * Properties required to invite handles to join an existing group.
 *
 * @interface SendGroupInvitationsInput
 * @property {HandleId} handleId Identifier of the handle owned by this client.
 * @property {GroupId} groupId The identifier of the group to invite handles to.
 * @property {HandleId[]} targetHandleIds A list of handle identifiers to invite.
 */
export interface SendGroupInvitationsInput {
  handleId: HandleId
  groupId: GroupId
  targetHandleIds: HandleId[]
}

/**
 * Properties required to withdraw a previously sent group invitation.
 *
 * @interface WithdrawGroupInvitationInput
 * @property {HandleId} handleId Identifier of the handle owned by this client.
 * @property {GroupId} groupId The identifier of the group in which an invitation was sent.
 * @property {HandleId} targetHandleId A handle identifier for the handle that is
 *  intended to have their invitation withdrawn.
 */
export interface WithdrawGroupInvitationInput {
  handleId: HandleId
  groupId: GroupId
  targetHandleId: HandleId
}

/**
 * Properties required to accept an invitation to join a group.
 *
 * @interface AcceptGroupInvitationInput
 * @property {HandleId} handleId Identifier of the handle owned by this client.
 * @property {GroupId} groupId The identifier of the group in which the invitation
 *  to join is to be accepted.
 */
export interface AcceptGroupInvitationInput {
  handleId: HandleId
  groupId: GroupId
}

/**
 * Properties required to decline an invitation to join a group.
 *
 * @interface DeclineGroupInvitationInput
 * @property {HandleId} handleId Identifier of the handle owned by this client.
 * @property {GroupId} groupId The identifier of the group in which the invitation
 *  to join is to be declined.
 */
export interface DeclineGroupInvitationInput {
  handleId: HandleId
  groupId: GroupId
}

/**
 * Properties required to remove a handle from a specified group.
 *
 * @interface LeaveGroupInput
 * @property {HandleId} handleId Identifier of the handle owned by this client.
 * @property {GroupId} groupId The identifier of the desired group to leave.
 */
export interface LeaveGroupInput {
  handleId: HandleId
  groupId: GroupId
}

/**
 * Properties required to retrieve a list of all group members of a group.
 *
 * @interface GetGroupMembersInput
 * @property {HandleId} handleId Identifier of the handle owned by this client.
 * @property {GroupId} groupId The identifier associated with the group to query.
 */
export interface GetGroupMembersInput {
  handleId: HandleId
  groupId: GroupId
}

/**
 * Properties required to update the group role for a specific member of a group.
 *
 * @interface UpdateGroupMemberRoleInput
 * @property {HandleId} handleId Identifier of the handle owned by this client.
 * @property {GroupId} groupId Identifier of the group.
 * @property {HandleId} targetHandleId Identifier of the handle associated with the
 *  group member to update.
 * @property {GroupRole} role The updated group role for this handle.
 */
export interface UpdateGroupMemberRoleInput {
  handleId: HandleId
  groupId: GroupId
  targetHandleId: HandleId
  role: GroupRole
}

/**
 * Properties required to kick a handle from a group.
 *
 * @interface KickGroupHandleInput
 * @property {HandleId} handleId Identifier of the handle owned by this client.
 * @property {GroupId} groupId Identifier of the group.
 * @property {HandleId} targetHandleId Identifier of the handle associated with the
 *  handle you intend to kick.
 * @property {String} reason Optional reason associated with the action.
 */
export interface KickGroupHandleInput {
  handleId: HandleId
  groupId: GroupId
  targetHandleId: HandleId
  reason?: string
}

/**
 * Properties required to ban a handle from a group.
 *
 * @interface BanGroupHandleInput
 * @property {HandleId} handleId Identifier of the handle owned by this client.
 * @property {GroupId} groupId Identifier of the group.
 * @property {HandleId} targetHandleId Identifier of the handle associated with the
 *  handle you intend to ban.
 * @property {String} reason Optional reason associated with the action.
 */
export interface BanGroupHandleInput {
  handleId: HandleId
  groupId: GroupId
  targetHandleId: HandleId
  reason?: string
}

/**
 * Properties required to unban a handle from a group.
 *
 * @interface UnbanGroupHandleInput
 * @property {HandleId} handleId Identifier of the handle owned by this client.
 * @property {GroupId} groupId Identifier of the group.
 * @property {HandleId} targetHandleId Identifier of the handle associated with the
 *  handle you intend to unban.
 * @property {String} reason Optional reason associated with the action.
 */
export interface UnbanGroupHandleInput {
  handleId: HandleId
  groupId: GroupId
  targetHandleId: HandleId
  reason?: string
}

/**
 * Group management for the Secure Communications Service.
 */
export interface GroupsModule {
  /**
   * Create a new group.
   *
   * Invites handles to the newly created group if a list of handle identifiers are supplied in the input.
   *
   * @param {CreateGroupInput} input Parameters with the initial fields state for the new group.
   * @returns {Group} The newly created group.
   */
  createGroup(input: CreateGroupInput): Promise<Group>

  /**
   * Update the editable fields of a group.
   *
   * @param {UpdateGroupInput} input Parameters defining the changed settings of a group.
   * @returns {Group} The updated group.
   */
  updateGroup(input: UpdateGroupInput): Promise<Group>

  /**
   * Deletes an existing group.
   *
   * **Note:** The handle has to have a higher role than everyone else in the group in order to delete
   * it for others. This usually means that only the creator of the group can delete it.
   *
   * @param {DeleteGroupInput} input Parameters used to delete a group.
   */
  deleteGroup(input: DeleteGroupInput): Promise<void>

  /**
   * Retrieve an individual group by the group's identifier.
   *
   * @param {GetGroupInput} input Parameters used to retrieve a group.
   * @returns {Group} The group matching the input identifier, or undefined if not found.
   */
  getGroup(input: GetGroupInput): Promise<Group | undefined>

  /**
   * Batch retrieve groups with a list of group identifiers.
   *
   * @param {GetGroupsInput} input Parameters used to retrieve a list of groups.
   * @returns {Group[]} List of groups matching the supplied identifiers, less any identifiers
   *  that did not correspond to a group.
   */
  getGroups(input: GetGroupsInput): Promise<Group[]>

  /**
   * Invite handles to join an existing group.
   *
   * @param {SendGroupInvitationsInput} input Parameters used to invite handles to join a group.
   */
  sendInvitations(input: SendGroupInvitationsInput): Promise<void>

  /**
   * Withdraw a previously sent group invitation.
   *
   * @param {WithdrawGroupInvitationInput} input Parameters used to withdraw a group invitation.
   */
  withdrawInvitation(input: WithdrawGroupInvitationInput): Promise<void>

  /**
   * Accepts an invitation to join a group.
   *
   * @param {AcceptGroupInvitationInput} input Parameters used to accept an invitation to join a group.
   */
  acceptInvitation(input: AcceptGroupInvitationInput): Promise<void>

  /**
   * Declines an invitation to join a group.
   *
   * @param {DeclineGroupInvitationInput} input Parameters used to decline an invitation to join a group.
   */
  declineInvitation(input: DeclineGroupInvitationInput): Promise<void>

  /**
   * Remove this handle from a specified group by identifier.
   *
   * @param {LeaveGroupInput} input Parameters used to remove a handle from a group.
   */
  leaveGroup(input: LeaveGroupInput): Promise<void>

  /**
   * Retrieve a list of all groups this handle has an active invitation for.
   *
   * @param {HandleId} handleId Identifier of the handle owned by this client.
   * @returns {Group[]} A list of groups this handle has been invited to.
   */
  listInvitations(handleId: HandleId): Promise<Group[]>

  /**
   * Retrieve a list of all groups this handle is included in as a member.
   *
   * @param {HandleId} handleId Identifier of the handle owned by this client.
   * @returns {Group[]} A list of groups containing all of the handle's joined groups.
   */
  listJoined(handleId: HandleId): Promise<Group[]>

  /**
   * Retrieves a list of all members of a group that the current handle is a member of.
   *
   * @param {GetGroupMembersInput} input Parameters used to retrieve a list of all group members
   *  of a group that this handle is a member of.
   * @returns {GroupMember[]} The list of group members in the group.
   */
  getGroupMembers(input: GetGroupMembersInput): Promise<GroupMember[]>

  /**
   * Updates the group role for a specific member of a group. Must have a higher role than the target
   * handle to perform this action. Can downgrade your own role.
   *
   * @param {UpdateGroupMemberRoleInput} input Parameters used to update the group role of a member
   *  in the group.
   */
  updateGroupMemberRole(input: UpdateGroupMemberRoleInput): Promise<void>

  /**
   * Kicks a handle from a group. Must have a higher role than the target handle to perform this
   * action. Can kick yourself.
   *
   * @param {KickGroupHandleInput} input Parameters used to kick a handle from a group.
   */
  kickHandle(input: KickGroupHandleInput): Promise<void>

  /**
   * Bans a handle from a group. Must have a higher role than the target handle to perform this
   * action.
   *
   * @param {BanGroupHandleInput} input Parameters used to ban a handle from a group.
   */
  banHandle(input: BanGroupHandleInput): Promise<void>

  /**
   * Unbans a handle from a group. Must have a higher role than the target handle to perform this
   * action.
   *
   * @param {UnbanGroupHandleInput} input Parameters used to unban a handle from a group.
   */
  unbanHandle(input: UnbanGroupHandleInput): Promise<void>
}

export class DefaultGroupsModule implements GroupsModule {
  private readonly log: Logger
  private readonly channelsService: DefaultChannelsService
  private readonly wordValidationService: DefaultWordValidationService

  public constructor(
    private readonly apiClient: ApiClient,
    private readonly sessionManager: SessionManager,
    private readonly mediaCredentialManager: MediaCredentialManager,
    private readonly secureCommsServiceConfig: SecureCommsServiceConfig,
  ) {
    this.log = new DefaultLogger(this.constructor.name)
    this.channelsService = new DefaultChannelsService(this.apiClient)
    this.wordValidationService = new DefaultWordValidationService(
      this.apiClient,
    )
  }

  async createGroup(input: CreateGroupInput): Promise<Group> {
    this.log.debug(this.createGroup.name, {
      input,
    })
    const useCase = new CreateGroupUseCase(
      this.sessionManager,
      this.wordValidationService,
    )
    const createdGroup = await useCase.execute({
      handleId: input.handleId,
      name: input.name,
      description: input.description,
      invitedHandleIds: input.invitedHandleIds,
    })

    // Set the avatar after the group is created so that the group id
    // can be used to scope the media access
    let result = createdGroup
    if (input.avatar) {
      const updateGroupUseCase = new UpdateGroupUseCase(
        this.sessionManager,
        this.wordValidationService,
        this.mediaCredentialManager,
      )
      try {
        const updatedGroup = await updateGroupUseCase.execute({
          groupId: createdGroup.groupId,
          handleId: input.handleId,
          avatar: { value: input.avatar },
        })
        if (updatedGroup?.avatarUrl) {
          result = { ...createdGroup, avatarUrl: updatedGroup.avatarUrl }
        }
      } catch (err) {
        // Log avatar upload error but do not fail creation
        this.log.error('Failed to upload the avatar', { err })
      }
    }
    const transformer = new GroupTransformer()
    return transformer.fromEntityToAPI(result)
  }

  async updateGroup(input: UpdateGroupInput): Promise<Group> {
    this.log.debug(this.updateGroup.name, {
      input,
    })
    const useCase = new UpdateGroupUseCase(
      this.sessionManager,
      this.wordValidationService,
      this.mediaCredentialManager,
    )
    const result = await useCase.execute({
      handleId: input.handleId,
      groupId: input.groupId,
      name: input.name,
      description: input.description,
      avatar: input.avatar,
    })
    const transformer = new GroupTransformer()
    return transformer.fromEntityToAPI(result)
  }

  async deleteGroup(input: DeleteGroupInput): Promise<void> {
    this.log.debug(this.deleteGroup.name, {
      input,
    })
    const useCase = new DeleteGroupUseCase(this.sessionManager)
    await useCase.execute({
      handleId: input.handleId,
      groupId: input.groupId,
    })
  }

  async getGroup(input: GetGroupInput): Promise<Group | undefined> {
    this.log.debug(this.getGroup.name, {
      input,
    })
    const useCase = new GetGroupUseCase(this.sessionManager)
    const result = await useCase.execute({
      handleId: input.handleId,
      groupId: input.groupId,
    })
    const transformer = new GroupTransformer()
    return result ? transformer.fromEntityToAPI(result) : undefined
  }

  async getGroups(input: GetGroupsInput): Promise<Group[]> {
    this.log.debug(this.getGroups.name, {
      input,
    })
    const useCase = new GetGroupsUseCase(this.sessionManager)
    const result = await useCase.execute({
      handleId: input.handleId,
      groupIds: input.groupIds,
    })
    const transformer = new GroupTransformer()
    return result.map((group) => transformer.fromEntityToAPI(group))
  }

  async sendInvitations(input: SendGroupInvitationsInput): Promise<void> {
    this.log.debug(this.sendInvitations.name, {
      input,
    })
    const useCase = new SendInvitationsUseCase(this.sessionManager)
    await useCase.execute({
      handleId: input.handleId,
      groupId: input.groupId,
      targetHandleIds: input.targetHandleIds,
    })
  }

  async withdrawInvitation(input: WithdrawGroupInvitationInput): Promise<void> {
    this.log.debug(this.withdrawInvitation.name, {
      input,
    })
    const useCase = new WithdrawInvitationUseCase(this.sessionManager)
    await useCase.execute({
      handleId: input.handleId,
      groupId: input.groupId,
      targetHandleId: input.targetHandleId,
    })
  }

  async acceptInvitation(input: AcceptGroupInvitationInput): Promise<void> {
    this.log.debug(this.acceptInvitation.name, {
      input,
    })
    const useCase = new AcceptInvitationUseCase(this.sessionManager)
    await useCase.execute({
      handleId: input.handleId,
      groupId: input.groupId,
    })
  }

  async declineInvitation(input: DeclineGroupInvitationInput): Promise<void> {
    this.log.debug(this.declineInvitation.name, {
      input,
    })
    const useCase = new DeclineInvitationUseCase(this.sessionManager)
    await useCase.execute({
      handleId: input.handleId,
      groupId: input.groupId,
    })
  }

  async leaveGroup(input: LeaveGroupInput): Promise<void> {
    this.log.debug(this.leaveGroup.name, {
      input,
    })
    const useCase = new LeaveGroupUseCase(this.sessionManager)
    await useCase.execute({
      handleId: input.handleId,
      groupId: input.groupId,
    })
  }

  async listInvitations(handleId: HandleId): Promise<Group[]> {
    this.log.debug(this.listInvitations.name, {
      handleId,
    })
    const useCase = new ListInvitationsUseCase(
      this.sessionManager,
      this.channelsService,
    )
    const result = await useCase.execute(handleId)

    const transformer = new GroupTransformer()
    return result.map((group) => transformer.fromEntityToAPI(group))
  }

  async listJoined(handleId: HandleId): Promise<Group[]> {
    this.log.debug(this.listJoined.name, {
      handleId,
    })
    const useCase = new ListJoinedGroupsUseCase(this.sessionManager)
    const result = await useCase.execute(handleId)
    const transformer = new GroupTransformer()
    return result.map((group) => transformer.fromEntityToAPI(group))
  }

  async getGroupMembers(input: GetGroupMembersInput): Promise<GroupMember[]> {
    this.log.debug(this.getGroupMembers.name, {
      input,
    })
    const useCase = new GetGroupMembersUseCase(this.sessionManager)
    const result = await useCase.execute({
      handleId: input.handleId,
      groupId: input.groupId,
    })
    const transformer = new GroupMemberTransformer()
    return result.map((member) => transformer.fromEntityToAPI(member))
  }

  async updateGroupMemberRole(
    input: UpdateGroupMemberRoleInput,
  ): Promise<void> {
    this.log.debug(this.updateGroupMemberRole.name, {
      input,
    })
    const groupRoleTransformer = new GroupRoleTransformer()
    const useCase = new UpdateGroupMemberRoleUseCase(this.sessionManager)
    await useCase.execute({
      handleId: input.handleId,
      groupId: input.groupId,
      targetHandleId: input.targetHandleId,
      role: groupRoleTransformer.fromAPIToEntity(input.role),
    })
  }

  async kickHandle(input: KickGroupHandleInput): Promise<void> {
    this.log.debug(this.kickHandle.name, {
      input,
    })
    const useCase = new KickHandleUseCase(this.sessionManager)
    await useCase.execute({
      handleId: input.handleId,
      groupId: input.groupId,
      targetHandleId: input.targetHandleId,
      reason: input.reason,
    })
  }

  async banHandle(input: BanGroupHandleInput): Promise<void> {
    this.log.debug(this.banHandle.name, {
      input,
    })
    const useCase = new BanHandleUseCase(this.sessionManager)
    await useCase.execute({
      handleId: input.handleId,
      groupId: input.groupId,
      targetHandleId: input.targetHandleId,
      reason: input.reason,
    })
  }

  async unbanHandle(input: UnbanGroupHandleInput): Promise<void> {
    this.log.debug(this.unbanHandle.name, {
      input,
    })
    const useCase = new UnbanHandleUseCase(this.sessionManager)
    await useCase.execute({
      handleId: input.handleId,
      groupId: input.groupId,
      targetHandleId: input.targetHandleId,
      reason: input.reason,
    })
  }
}
