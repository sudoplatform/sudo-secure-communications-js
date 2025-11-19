/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { DefaultLogger, ListOutput, Logger } from '@sudoplatform/sudo-common'
import { DefaultChannelsService } from '../../private/data/channels/defaultChannelsService'
import { ChannelInvitationRequestTransformer } from '../../private/data/channels/transformer/channelInvitationRequestTransformer'
import { ChannelJoinRuleTransformer } from '../../private/data/channels/transformer/channelJoinRuleTransformer'
import { ChannelMemberTransformer } from '../../private/data/channels/transformer/channelMemberTransformer'
import { ChannelPermissionsTransformer } from '../../private/data/channels/transformer/channelPermissionsTransformer'
import { ChannelRoleTransformer } from '../../private/data/channels/transformer/channelRoleTransformer'
import { ChannelSortOrderTransformer } from '../../private/data/channels/transformer/channelSortOrderTransformer'
import { ChannelTransformer } from '../../private/data/channels/transformer/channelTransformer'
import { PublicChannelJoinRuleTransformer } from '../../private/data/channels/transformer/publicChannelJoinRuleTransformer'
import { PublicChannelSearchResultTransformer } from '../../private/data/channels/transformer/publicChannelSearchResultTransformer'
import { ApiClient } from '../../private/data/common/apiClient'
import { SecureCommsServiceConfig } from '../../private/data/common/config'
import { MembershipStateTransformer } from '../../private/data/common/transformer/membershipStateTransformer'
import { MediaCredentialManager } from '../../private/data/media/mediaCredentialManager'
import { SessionManager } from '../../private/data/session/sessionManager'
import { DefaultWordValidationService } from '../../private/data/wordValidation/defaultWordValidationService'
import { AcceptInvitationUseCase } from '../../private/domain/use-cases/channels/acceptInvitationUseCase'
import { BanHandleUseCase } from '../../private/domain/use-cases/channels/banHandleUseCase'
import { CreateChannelUseCase } from '../../private/domain/use-cases/channels/createChannelUseCase'
import { DeclineInvitationUseCase } from '../../private/domain/use-cases/channels/declineInvitationUseCase'
import { DeleteChannelUseCase } from '../../private/domain/use-cases/channels/deleteChannelUseCase'
import { GetChannelMembersUseCase } from '../../private/domain/use-cases/channels/getChannelMembersUseCase'
import { GetChannelMembershipUseCase } from '../../private/domain/use-cases/channels/getChannelMembershipUseCase'
import { GetChannelUseCase } from '../../private/domain/use-cases/channels/getChannelUseCase'
import { GetChannelsUseCase } from '../../private/domain/use-cases/channels/getChannelsUseCase'
import { JoinChannelUseCase } from '../../private/domain/use-cases/channels/joinChannelUseCase'
import { KickHandleUseCase } from '../../private/domain/use-cases/channels/kickHandleUseCase'
import { LeaveChannelUseCase } from '../../private/domain/use-cases/channels/leaveChannelUseCase'
import { ListInvitationsUseCase } from '../../private/domain/use-cases/channels/listInvitationsUseCase'
import { ListJoinedChannelsUseCase } from '../../private/domain/use-cases/channels/listJoinedChannelsUseCase'
import { ListReceivedInvitationRequestsUseCase } from '../../private/domain/use-cases/channels/listReceivedInvitationRequestsUseCase'
import { ListSentInvitationRequestsUseCase } from '../../private/domain/use-cases/channels/listSentInvitationRequestsUseCase'
import { SearchPublicChannelsUseCase } from '../../private/domain/use-cases/channels/searchPublicChannelsUseCase'
import { SendInvitationRequestUseCase } from '../../private/domain/use-cases/channels/sendInvitationRequestUseCase'
import { SendInvitationsUseCase } from '../../private/domain/use-cases/channels/sendInvitationsUseCase'
import { UnbanHandleUseCase } from '../../private/domain/use-cases/channels/unbanHandleUseCase'
import { UpdateChannelMemberRoleUseCase } from '../../private/domain/use-cases/channels/updateChannelMemberRoleUseCase'
import { UpdateChannelUseCase } from '../../private/domain/use-cases/channels/updateChannelUseCase'
import { WithdrawInvitationUseCase } from '../../private/domain/use-cases/channels/withdrawInvitationUseCase'
import { AvatarInput, Input, Pagination } from '../secureCommsClient'
import { ChannelId, ChannelMember, HandleId, MembershipState } from '../typings'
import {
  Channel,
  ChannelJoinRule,
  ChannelPermissionsInput,
  ChannelRole,
  ChannelSortOrder,
  PublicChannelJoinRule,
  PublicChannelSearchResult,
} from '../typings/channel'
import { ChannelInvitationRequest } from '../typings/channelInvitationRequest'

/**
 * Properties required or optional when creating a new channel.
 *
 * @interface CreateChannelInput
 * @property {HandleId} handleId Identifier of the handle owned by this client.
 * @property {string} name Optional display name for the channel.
 * @property {string} description Optional explanation about what the channel is about.
 * @property {AvatarInput} avatar Optional file to use as the channel's avatar.
 * @property {ChannelJoinRule} joinRule The rule for joining and whether the channel is searchable.
 * @property {string[]} tags A list of words to help searchability.
 * @property {HandleId[]} invitedHandleIds The identifiers of the handles to invite immediately when the channel is created.
 * @property {ChannelPermissionsInput} permissions Change which actions a member of a certain role can take.
 * @property {ChannelRole} defaultMemberRole The default role members inherit when joining the channel.
 */
export interface CreateChannelInput {
  handleId: HandleId
  name?: string
  description?: string
  avatar?: AvatarInput
  joinRule: ChannelJoinRule
  tags: string[]
  invitedHandleIds: HandleId[]
  permissions: ChannelPermissionsInput
  defaultMemberRole: ChannelRole
}

/**
 * Updatable fields when making an update to a channel. If a field's {@link Input} is undefined,
 * that setting is not modified. If the value inside the {@link Input} is undefined, that
 * setting is unset.
 *
 * @interface UpdateChannelInput
 * @property {HandleId} handleId Identifier of the handle owned by this client.
 * @property {ChannelId} channelId The identifier of the channel to update.
 * @property {Input<string | undefined>} name The display name for the channel.
 * @property {Input<string | undefined>} description An explanation about what the channel is about.
 * @property {Input<AvatarInput | undefined>} avatar File to upload to use as the channel's avatar.
 * @property {Input<ChannelJoinRule>} joinRule The rule for joining and whether the channel is searchable.
 * @property {Input<string[]>} tags A list of words to help searchability.
 * @property {Input<ChannelPermissionsInput | undefined>} permissions Change which actions a member of a
 *  certain role can take. If the value is undefined, the channel permissions are reset back to the defaults.
 * @property {Input<ChannelRole>} defaultMemberRole The default role members inherit when joining the channel.
 *  Updating this field will change the role for all members who have not had their role explicitly set.
 */
export interface UpdateChannelInput {
  handleId: HandleId
  channelId: ChannelId
  name?: Input<string | undefined>
  description?: Input<string | undefined>
  avatar?: Input<AvatarInput | undefined>
  joinRule?: Input<ChannelJoinRule>
  tags?: Input<string[]>
  permissions?: Input<ChannelPermissionsInput | undefined>
  defaultMemberRole?: Input<ChannelRole>
}

/**
 * Properties required to delete an existing channel.
 *
 * @interface DeleteChannelInput
 * @property {HandleId} handleId Identifier of the handle owned by this client.
 * @property {ChannelId} id The identifier of the channel to delete.
 */
export interface DeleteChannelInput {
  handleId: HandleId
  channelId: ChannelId
}

/**
 * Properties required to retrieve a channel.
 *
 * @interface GetChannelInput
 * @property {HandleId} handleId Identifier of the handle owned by this client.
 * @property {ChannelId} channelId The identifier of the channel to retrieve.
 */
export interface GetChannelInput {
  handleId: HandleId
  channelId: ChannelId
}

/**
 * Properties required to retrieve a list of channels.
 *
 * @interface GetChannelsInput
 * @property {HandleId} handleId Identifier of the handle owned by this client.
 * @property {ChannelId[]} channelIds A list of channel identifiers for the desired channels.
 */
export interface GetChannelsInput {
  handleId: HandleId
  channelIds: ChannelId[]
}

/**
 * Properties required to search for existing public channels that have fields matching inputs.
 *
 * @interface PublicChannelSearchInput
 * @property {HandleId} handleId Identifier of the handle owned by this client.
 * @property {ChannelSortOrder} order Specifies the ordering that should be applied to the
 *  channels returned by the search.
 * @property {string} searchTerm Optional string to search metadata such as name, description, alias etc.
 *  or undefined if a search term should not be applied to the search.
 * @property {PublicChannelJoinRule} joinRule Optional filter by PUBLIC_WITH_INVITE or PUBLIC or undefined
 *  if join rule should not be applied to the search.
 * @property {boolean} isJoined Optional flag to only return joined channels when true or not yet joined
 *  channels when false. If undefined, the flag is not applied to the search.
 * @property {string[]} tags Optional array of tags to match or undefined if the tags should not be applied
 *  to the search. At least one match is required for a result to be returned.
 */
export interface PublicChannelSearchInput extends Pagination {
  handleId: HandleId
  order: ChannelSortOrder
  searchTerm?: string
  joinRule?: PublicChannelJoinRule
  isJoined?: boolean
  tags?: string[]
}

/**
 * Properties required when adding a handle to an existing channel.
 *
 * @interface JoinChannelInput
 * @property {HandleId} handleId Identifier of the handle owned by this client.
 * @property {ChannelId} channelId The identifier of the desired channel to join.
 */
export interface JoinChannelInput {
  handleId: HandleId
  channelId: ChannelId
}

/**
 * Properties required when removing a handle from an existing channel.
 *
 * @interface LeaveChannelInput
 * @property {HandleId} handleId Identifier of the handle owned by this client.
 * @property {ChannelId} channelId The identifier of the desired channel to leave.
 */
export interface LeaveChannelInput {
  handleId: HandleId
  channelId: ChannelId
}

/**
 * Properties required to invite handles to join an existing channel.
 *
 * @interface SendChannelInvitationsInput
 * @property {HandleId} handleId Identifier of the handle owned by this client.
 * @property {ChannelId} channelId The identifier of the channel to invite handles to.
 * @property {HandleId[]} targetHandleIds A list of handle identifiers to invite.
 */
export interface SendChannelInvitationsInput {
  handleId: HandleId
  channelId: ChannelId
  targetHandleIds: HandleId[]
}

/**
 * Properties required to withdraw a previously sent channel invitation.
 *
 * @interface WithdrawChannelInvitationInput
 * @property {HandleId} handleId Identifier of the handle owned by this client.
 * @property {ChannelId} channelId The identifier of the channel in which an invitation was sent.
 * @property {HandleId} targetHandleId A handle identifier for the handle that is
 *  intended to have their invitation withdrawn.
 */
export interface WithdrawChannelInvitationInput {
  handleId: HandleId
  channelId: ChannelId
  targetHandleId: HandleId
}

/**
 * Properties required to accept an invitation to join a channel.
 *
 * @interface AcceptChannelInvitationInput
 * @property {HandleId} handleId Identifier of the handle owned by this client.
 * @property {ChannelId} channelId The identifier of the channel in which the invitation
 *  to join is to be accepted.
 */
export interface AcceptChannelInvitationInput {
  handleId: HandleId
  channelId: ChannelId
}

/**
 * Properties required to decline an invitation to join a channel.
 *
 * @interface DeclineChannelInvitationInput
 * @property {HandleId} handleId Identifier of the handle owned by this client.
 * @property {ChannelId} channelId The identifier of the channel in which the invitation
 *  to join is to be declined.
 */
export interface DeclineChannelInvitationInput {
  handleId: HandleId
  channelId: ChannelId
}

/**
 * Properties required to send an invitation request to a channel.
 *
 * @interface SendInvitationRequestInput
 * @property {HandleId} handleId Identifier of the handle owned by this client.
 * @property {ChannelId} channelId The identifier of the channel to send an invitation request for.
 * @property {string} reason Optional reason for the invitation request.
 */
export interface SendInvitationRequestInput {
  handleId: HandleId
  channelId: ChannelId
  reason?: string
}

/**
 * Properties required to withdraw a previously sent channel invitation request.
 *
 * @interface WithdrawInvitationRequestInput
 * @property {HandleId} handleId Identifier of the handle owned by this client.
 * @property {ChannelId} channelId The identifier of the channel that an invitation was sent to.
 */
export interface WithdrawInvitationRequestInput {
  handleId: HandleId
  channelId: ChannelId
}

/**
 * Properties required to accept an invitation request to join a channel.
 *
 * @interface AcceptInvitationRequestInput
 * @property {HandleId} handleId Identifier of the handle owned by this client.
 * @property {ChannelId} channelId The identifier of the channel to accept an invitation request for.
 * @property {HandleId} targetHandleId The identifier of the handle to accept the invitation request from.
 */
export interface AcceptInvitationRequestInput {
  handleId: HandleId
  channelId: ChannelId
  targetHandleId: HandleId
}

/**
 * Properties required to decline an invitation request to join a channel.
 *
 * @interface DeclineInvitationRequestInput
 * @property {HandleId} handleId Identifier of the handle owned by this client.
 * @property {ChannelId} channelId The identifier of the channel to decline an invitation request for.
 * @property {HandleId} targetHandleId The identifier of the handle to decline the invitation request from.
 * @property {string} reason Optional reason for declining the invitation request.
 */
export interface DeclineInvitationRequestInput {
  handleId: HandleId
  channelId: ChannelId
  targetHandleId: HandleId
  reason?: string
}

/**
 * Properties required to retrieve all channel invitation requests received by
 * a specific channel.
 *
 * @interface ListReceivedInvitationRequestsInput
 * @property {HandleId} handleId Identifier of the handle owned by this client.
 * @property {ChannelId} channelId The identifier of the channel to query for received invitation requests.
 */
export interface ListReceivedInvitationRequestsInput {
  handleId: HandleId
  channelId: ChannelId
}

/**
 * Properties required to retrieve a list of all channel members of a channel.
 *
 * @interface GetChannelMembersInput
 * @property {HandleId} handleId Identifier of the handle owned by this client.
 * @property {ChannelId} channelId The identifier associated with the channel to query.
 */
export interface GetChannelMembersInput {
  handleId: HandleId
  channelId: ChannelId
}

/**
 * Properties required to query for the membership state of the current handle in the channel.
 *
 * @interface GetChannelMembershipInput
 * @property {HandleId} handleId Identifier of the handle owned by this client.
 * @property {ChannelId} channelId The identifier of the channel to query.
 */
export interface GetChannelMembershipInput {
  handleId: HandleId
  channelId: ChannelId
}

/**
 * Properties required to update the channel role for a specific member of a channel.
 *
 * @interface UpdateChannelMemberRoleInput
 * @property {HandleId} handleId Identifier of the handle owned by this client.
 * @property {ChannelId} channelId Identifier of the channel.
 * @property {HandleId} targetHandleId Identifier of the handle associated with the
 *  channel member to update.
 * @property {ChannelRole} role The updated channel role for this handle.
 */
export interface UpdateChannelMemberRoleInput {
  handleId: HandleId
  channelId: ChannelId
  targetHandleId: HandleId
  role: ChannelRole
}

/**
 * Properties required to kick a handle from a channel.
 *
 * @interface KickChannelHandleInput
 * @property {HandleId} handleId Identifier of the handle owned by this client.
 * @property {ChannelId} channelId The identifier of the channel.
 * @property {HandleId} targetHandleId Identifier of the handle associated with the
 *  handle you intend to kick.
 * @property {string} reason Optional reason associated with the action.
 */
export interface KickChannelHandleInput {
  handleId: HandleId
  channelId: ChannelId
  targetHandleId: HandleId
  reason?: string
}

/**
 * Properties required to ban a handle from a channel.
 *
 * @interface BanChannelHandleInput
 * @property {HandleId} handleId Identifier of the handle owned by this client.
 * @property {ChannelId} id The identifier of the channel.
 * @property {HandleId} targetHandleId Identifier of the handle associated with the
 *  handle you intend to ban.
 * @property {string} reason Optional reason associated with the action.
 */
export interface BanChannelHandleInput {
  handleId: HandleId
  channelId: ChannelId
  targetHandleId: HandleId
  reason?: string
}

/**
 * Properties required to unban a handle from a channel.
 *
 * @interface UnbanChannelHandleInput
 * @property {HandleId} handleId Identifier of the handle owned by this client.
 * @property {ChannelId} id The identifier of the channel.
 * @property {HandleId} targetHandleId Identifier of the handle associated with the
 *  handle you intend to unban.
 * @property {string} reason Optional reason associated with the action.
 */
export interface UnbanChannelHandleInput {
  handleId: HandleId
  channelId: ChannelId
  targetHandleId: HandleId
  reason?: string
}

/**
 * Channel management for the Secure Communications Service.
 */
export interface ChannelsModule {
  /**
   * Create a new channel.
   *
   * Invites handles to the newly created channel if a list of handle identifiers are supplied in the input.
   *
   * @param {CreateChannelInput} input Parameters with the initial fields state for the new channel.
   * @returns {Channel} The newly created channel.
   */
  createChannel(input: CreateChannelInput): Promise<Channel>

  /**
   * Update the editable fields of a channel.
   *
   * @param {UpdateGroupInput} input Parameters defining the changed settings of a channel.
   * @returns {Channel} The updated channel.
   */
  updateChannel(input: UpdateChannelInput): Promise<Channel>

  /**
   * Delete an existing channel.
   *
   * **Note:** The channel needs to be private before deleting due to technical constraints.
   *
   * **Note:** The handle has to have a higher power level than everyone else in the channel in order to delete
   * it for others. This usually means that only the host of a channel can delete it.
   *
   * @param {DeleteChannelInput} input Parameters used to delete an existing channel.
   */
  deleteChannel(input: DeleteChannelInput): Promise<void>

  /**
   * Retrieve an individual channel by the channel's identifier.
   *
   * @param {GetChannelInput} input Parameters used to retrieve a channel.
   * @returns {Channel} The channel matching the input identifier, or undefined if not found.
   */
  getChannel(input: GetChannelInput): Promise<Channel | undefined>

  /**
   * Batch retrieve channels with a list of channel identifiers.
   *
   * @param {GetChannelsInput} input Parameters used to retrieve a list of channels.
   * @returns {Channel[]} List of channels matching the supplied identifiers, less any identifiers
   *  that did not correspond to a channel.
   */
  getChannels(input: GetChannelsInput): Promise<Channel[]>

  /**
   * Search existing channels that have fields matching the supplied inputs. Only public channels are searchable.
   *
   * @param {PublicChannelSearchInput} input Parameters used to search for public channels.
   * @returns {ListOutput<PublicChannelSearchResult>} A list of all public channel search results matching the
   *  search criteria.
   */
  searchPublicChannels(
    input: PublicChannelSearchInput,
  ): Promise<ListOutput<PublicChannelSearchResult>>

  /**
   * Add this handle to an existing channel by identifier. Only public channels can be joined without
   * an invitation.
   *
   * @param {JoinChannelInput} input Parameters used to add a handle to a channel.
   */
  joinChannel(input: JoinChannelInput): Promise<void>

  /**
   * Remove this handle from a specified channel by identifier.
   *
   * @param {LeaveChannelInput} input Parameters used to remove a handle from a channel.
   */
  leaveChannel(input: LeaveChannelInput): Promise<void>

  /**
   * Retrieve a list of all channels the handle is included in as a member.
   *
   * @param {HandleId} handleId Identifier of the handle owned by this client.
   * @returns {Channel[]} A list of channels containing all of the handle's joined channels.
   */
  listJoined(handleId: HandleId): Promise<Channel[]>

  /**
   * Invite handles to join an existing channel.
   *
   * @param {SendChannelInvitationsInput} input Parameters used to invite handles to join a channel.
   */
  sendInvitations(input: SendChannelInvitationsInput): Promise<void>

  /**
   * Withdraw a previously sent channel invitation. Must have a higher role than the target handle
   * to perform this action.
   *
   * @param {WithdrawChannelInvitationInput} input Parameters used to withdraw a channel invitation.
   */
  withdrawInvitation(input: WithdrawChannelInvitationInput): Promise<void>

  /**
   * Accepts an invitation to join a channel.
   *
   * @param {AcceptChannelInvitationInput} input Parameters used to accept an invitation to join a channel.
   */
  acceptInvitation(input: AcceptChannelInvitationInput): Promise<void>

  /**
   * Decline an invitation to join a channel.
   *
   * @param {DeclineChannelInvitationInput} input Parameters used to decline an invitation to join a channel.
   */
  declineInvitation(input: DeclineChannelInvitationInput): Promise<void>

  /**
   * Retrieve a list of all channels the handle has an active invitation for.
   *
   * @param {HandleId} handleId Identifier of the handle owned by this client.
   * @returns {Channel[]} A list of channels this handle has been invited to.
   */
  listInvitations(handleId: HandleId): Promise<Channel[]>

  /**
   * Send an invitation request to join a channel.
   *
   * @param {SendInvitationRequestInput} input Parameters used to send an invitation request to join a channel.
   */
  sendInvitationRequest(input: SendInvitationRequestInput): Promise<void>

  /**
   * Withdraw a previously sent channel invitation request.
   *
   * @param {WithdrawInvitationRequestInput} input Parameters used to withdraw an invitation request to join a channel.
   */
  withdrawInvitationRequest(
    input: WithdrawInvitationRequestInput,
  ): Promise<void>

  /**
   * Accept an invitation request to join a channel.
   *
   * @param {AcceptInvitationRequestInput} input Parameters used to accept an invitation request to join a channel.
   */
  acceptInvitationRequest(input: AcceptInvitationRequestInput): Promise<void>

  /**
   * Decline an invitaton request to join a channel. Must have a higher role than the target handle
   * to perform this action.
   *
   * @param {DeclineInvitationRequestInput} input Parameters used to decline an invitation request to join a channel.
   */
  declineInvitationRequest(input: DeclineInvitationRequestInput): Promise<void>

  /**
   * Retrieve all channels this handle has sent an invitation request for.
   *
   * @param {HandleId} handleId Identifier of the handle owned by this client.
   * @returns {Channel[]} A list of channels the handle has requested an invite to.
   */
  listSentInvitationRequests(handleId: HandleId): Promise<Channel[]>

  /**
   * Retrieve all channel invitation requests received by a specific channel.
   *
   * @param {ListReceivedInvitationRequestsInput} input Parameters used to query for a list of received invitation requests.
   * @returns {ChannelInvitationRequest[]} A list of channel invitation requests for the specified channel.
   */
  listReceivedInvitationRequests(
    input: ListReceivedInvitationRequestsInput,
  ): Promise<ChannelInvitationRequest[]>

  /**
   * Retrieves a list of all members of a channel that the current handle is a member of.
   *
   * @param {GetChannelMembersInput} input Parameters used to retrieve a list of all channel members
   *  of a channel.
   * @returns {ChannelMember[]} The list of channel members in the channel.
   */
  getChannelMembers(input: GetChannelMembersInput): Promise<ChannelMember[]>

  /**
   * Get the state of membership of the current handle in the channel.
   *
   * **Note:** When a handle is not actively in the channel (status is either {@link MembershipState.LEFT} or
   *  {@link MembershipState.BANNED}), they will not receive membership state updates. This means the handle
   *  cannot observe transitions between {@link MembershipState.LEFT} and {@link MembershipState.BANNED} states.
   *  For consistent state management, it's recommended to treat both these states as "not in channel" rather than
   *  distinguishing between them.
   *
   * @param {GetChannelMembershipInput} input Parameters used to retrieve the membership of the current handle
   *  in the channel.
   * @returns {MembershipState | undefined} The membership state of the handle in the channel, or undefined if unknown.
   *  Undefined usually means the handle has never intereacted with the channel which is equivalent to
   *  {@link MembershipState.LEFT}.
   */
  getChannelMembership(
    input: GetChannelMembershipInput,
  ): Promise<MembershipState | undefined>

  /**
   * Updates the channel role for a specific member of a channel. Must have a higher role than the target
   * handle to perform this action. Can downgrade your own role.
   *
   * @param {UpdateChannelMemberRoleInput} input Parameters used to update the channel role of a member
   *  in the channel.
   */
  updateChannelMemberRole(input: UpdateChannelMemberRoleInput): Promise<void>

  /**
   * Kicks a handle from a channel. Must have a higher role than the target handle to perform this
   * action. Can kick yourself.
   *
   * @param {KickChannelHandleInput} input Parameters used to kick a handle from a channel.
   */
  kickHandle(input: KickChannelHandleInput): Promise<void>

  /**
   * Bans a handle from a channel. Must have a higher role than the target handle to perform this
   * action.
   *
   * @param {BanChannelHandleInput} input Parameters used to ban a handle from a channel.
   */
  banHandle(input: BanChannelHandleInput): Promise<void>

  /**
   * Unbans a handle from a channel. Must have a higher role than the target handle to perform this
   * action.
   *
   * @param {UnbanChannelHandleInput} input Parameters used to unban a handle from a channel.
   */
  unbanHandle(input: UnbanChannelHandleInput): Promise<void>
}

export class DefaultChannelsModule implements ChannelsModule {
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

  async createChannel(input: CreateChannelInput): Promise<Channel> {
    this.log.debug(this.createChannel.name, {
      input,
    })
    const channelJoinRuleTransformer = new ChannelJoinRuleTransformer()
    const channelPermissionsTransformer = new ChannelPermissionsTransformer()
    const channelRoleTransformer = new ChannelRoleTransformer()
    const useCase = new CreateChannelUseCase(
      this.channelsService,
      this.wordValidationService,
    )
    const createdChannel = await useCase.execute({
      handleId: input.handleId,
      name: input.name,
      description: input.description,
      joinRule: channelJoinRuleTransformer.fromAPIToEntity(input.joinRule),
      tags: input.tags,
      invitedHandleIds: input.invitedHandleIds,
      permissions: channelPermissionsTransformer.fromInputAPIToEntity(
        input.permissions,
      ),
      defaultMemberRole: channelRoleTransformer.fromAPIToEntity(
        input.defaultMemberRole,
      ),
    })

    // Set the avatar after the channel is created so that the channel id
    // can be used to scope the media access
    let result = createdChannel
    if (input.avatar) {
      const updateChannelUseCase = new UpdateChannelUseCase(
        this.channelsService,
        this.wordValidationService,
        this.sessionManager,
        this.mediaCredentialManager,
      )
      try {
        const updatedChannel = await updateChannelUseCase.execute({
          handleId: input.handleId,
          channelId: createdChannel.channelId,
          avatar: { value: input.avatar },
        })
        if (updatedChannel?.avatarUrl) {
          result = { ...createdChannel, avatarUrl: updatedChannel.avatarUrl }
        }
      } catch (err) {
        // Log avatar upload error but do not fail creation
        this.log.error('Failed to upload the avatar', { err })
      }
    }
    const transformer = new ChannelTransformer()
    return transformer.fromEntityToAPI(result)
  }

  async updateChannel(input: UpdateChannelInput): Promise<Channel> {
    this.log.debug(this.updateChannel.name, {
      input,
    })
    const channelJoinRuleTransformer = new ChannelJoinRuleTransformer()
    const channelPermissionsTransformer = new ChannelPermissionsTransformer()
    const channelRoleTransformer = new ChannelRoleTransformer()
    const useCase = new UpdateChannelUseCase(
      this.channelsService,
      this.wordValidationService,
      this.sessionManager,
      this.mediaCredentialManager,
    )
    const result = await useCase.execute({
      handleId: input.handleId,
      channelId: input.channelId,
      name: input.name,
      description: input.description,
      joinRule: input.joinRule
        ? {
            value: channelJoinRuleTransformer.fromAPIToEntity(
              input.joinRule.value,
            ),
          }
        : undefined,
      avatar: input.avatar,
      tags: input.tags,
      permissions: input.permissions?.value
        ? {
            value: channelPermissionsTransformer.fromInputAPIToEntity(
              input.permissions?.value,
            ),
          }
        : undefined,
      defaultMemberRole: input.defaultMemberRole
        ? {
            value: channelRoleTransformer.fromAPIToEntity(
              input.defaultMemberRole.value,
            ),
          }
        : undefined,
    })
    const transformer = new ChannelTransformer()
    return transformer.fromEntityToAPI(result)
  }

  async deleteChannel(input: DeleteChannelInput): Promise<void> {
    this.log.debug(this.deleteChannel.name, {
      input,
    })
    const useCase = new DeleteChannelUseCase(this.channelsService)
    await useCase.execute({
      handleId: input.handleId,
      channelId: input.channelId,
    })
  }

  async getChannel(input: GetChannelInput): Promise<Channel | undefined> {
    this.log.debug(this.getChannel.name, {
      input,
    })
    const useCase = new GetChannelUseCase(
      this.channelsService,
      this.sessionManager,
    )
    const result = await useCase.execute({
      handleId: input.handleId,
      channelId: input.channelId,
    })
    const transformer = new ChannelTransformer()
    return result ? transformer.fromEntityToAPI(result) : undefined
  }

  async getChannels(input: GetChannelsInput): Promise<Channel[]> {
    this.log.debug(this.getChannels.name, {
      input,
    })
    const useCase = new GetChannelsUseCase(
      this.channelsService,
      this.sessionManager,
    )
    const result = await useCase.execute({
      handleId: input.handleId,
      channelIds: input.channelIds,
    })
    const transformer = new ChannelTransformer()
    return result.map((channel) => transformer.fromEntityToAPI(channel))
  }

  async searchPublicChannels(
    input: PublicChannelSearchInput,
  ): Promise<ListOutput<PublicChannelSearchResult>> {
    this.log.debug(this.searchPublicChannels.name, {
      input,
    })
    const channelSortOrderTransformer = new ChannelSortOrderTransformer()
    const publicChannelJoinRuleTransformer =
      new PublicChannelJoinRuleTransformer()
    const useCase = new SearchPublicChannelsUseCase(this.channelsService)
    const { channels, nextToken: resultNextToken } = await useCase.execute({
      handleId: input.handleId,
      order: channelSortOrderTransformer.fromAPIToEntity(input.order),
      searchTerm: input.searchTerm,
      joinRule: input.joinRule
        ? publicChannelJoinRuleTransformer.fromAPIToEntity(input.joinRule)
        : undefined,
      isJoined: input.isJoined,
      tags: input.tags,
      limit: input.limit,
      nextToken: input.nextToken,
    })
    const transformer = new PublicChannelSearchResultTransformer()
    const channelSearchResult = channels.map((channel) =>
      transformer.fromEntityToAPI(channel),
    )
    return { items: channelSearchResult, nextToken: resultNextToken }
  }

  async joinChannel(input: JoinChannelInput): Promise<void> {
    this.log.debug(this.joinChannel.name, {
      input,
    })
    const useCase = new JoinChannelUseCase(this.sessionManager)
    await useCase.execute({
      handleId: input.handleId,
      channelId: input.channelId,
    })
  }

  async leaveChannel(input: LeaveChannelInput): Promise<void> {
    this.log.debug(this.leaveChannel.name, {
      input,
    })
    const useCase = new LeaveChannelUseCase(this.sessionManager)
    await useCase.execute({
      handleId: input.handleId,
      channelId: input.channelId,
    })
  }

  async listJoined(handleId: HandleId): Promise<Channel[]> {
    this.log.debug(this.listJoined.name, {
      handleId,
    })
    const useCase = new ListJoinedChannelsUseCase(
      this.channelsService,
      this.sessionManager,
    )
    const result = await useCase.execute(handleId)
    const transformer = new ChannelTransformer()
    return result.map((channel) => transformer.fromEntityToAPI(channel))
  }

  async sendInvitations(input: SendChannelInvitationsInput): Promise<void> {
    this.log.debug(this.sendInvitations.name, {
      input,
    })
    const useCase = new SendInvitationsUseCase(this.sessionManager)
    await useCase.execute({
      handleId: input.handleId,
      channelId: input.channelId,
      targetHandleIds: input.targetHandleIds,
    })
  }

  async withdrawInvitation(
    input: WithdrawChannelInvitationInput,
  ): Promise<void> {
    this.log.debug(this.withdrawInvitation.name, {
      input,
    })
    const useCase = new WithdrawInvitationUseCase(this.sessionManager)
    await useCase.execute({
      handleId: input.handleId,
      channelId: input.channelId,
      targetHandleId: input.targetHandleId,
    })
  }

  async acceptInvitation(input: AcceptChannelInvitationInput): Promise<void> {
    this.log.debug(this.acceptInvitation.name, {
      input,
    })
    const useCase = new AcceptInvitationUseCase(this.sessionManager)
    await useCase.execute({
      handleId: input.handleId,
      channelId: input.channelId,
    })
  }

  async declineInvitation(input: DeclineChannelInvitationInput): Promise<void> {
    this.log.debug(this.declineInvitation.name, {
      input,
    })
    const useCase = new DeclineInvitationUseCase(this.sessionManager)
    await useCase.execute({
      handleId: input.handleId,
      channelId: input.channelId,
    })
  }

  async listInvitations(handleId: HandleId): Promise<Channel[]> {
    this.log.debug(this.listInvitations.name, {
      handleId,
    })
    const useCase = new ListInvitationsUseCase(
      this.channelsService,
      this.sessionManager,
    )
    const result = await useCase.execute(handleId)
    const transformer = new ChannelTransformer()
    return result.map((channel) => transformer.fromEntityToAPI(channel))
  }

  async sendInvitationRequest(
    input: SendInvitationRequestInput,
  ): Promise<void> {
    this.log.debug(this.sendInvitationRequest.name, {
      input,
    })
    const useCase = new SendInvitationRequestUseCase(this.sessionManager)
    await useCase.execute({
      handleId: input.handleId,
      channelId: input.channelId,
      reason: input.reason,
    })
  }

  async withdrawInvitationRequest(
    input: WithdrawInvitationRequestInput,
  ): Promise<void> {
    this.log.debug(this.withdrawInvitationRequest.name, {
      input,
    })
    await this.leaveChannel({
      handleId: input.handleId,
      channelId: input.channelId,
    })
  }

  async acceptInvitationRequest(
    input: AcceptInvitationRequestInput,
  ): Promise<void> {
    this.log.debug(this.acceptInvitationRequest.name, {
      input,
    })
    await this.sendInvitations({
      handleId: input.handleId,
      channelId: input.channelId,
      targetHandleIds: [input.targetHandleId],
    })
  }

  async declineInvitationRequest(
    input: DeclineInvitationRequestInput,
  ): Promise<void> {
    this.log.debug(this.declineInvitationRequest.name, {
      input,
    })
    await this.kickHandle({
      handleId: input.handleId,
      channelId: input.channelId,
      targetHandleId: input.targetHandleId,
      reason: input.reason,
    })
  }

  async listSentInvitationRequests(handleId: HandleId): Promise<Channel[]> {
    this.log.debug(this.listSentInvitationRequests.name, {
      handleId,
    })
    const useCase = new ListSentInvitationRequestsUseCase(
      this.channelsService,
      this.sessionManager,
    )
    const result = await useCase.execute(handleId)
    const transformer = new ChannelTransformer()
    return result.map((channel) => transformer.fromEntityToAPI(channel))
  }

  async listReceivedInvitationRequests(
    input: ListReceivedInvitationRequestsInput,
  ): Promise<ChannelInvitationRequest[]> {
    this.log.debug(this.listReceivedInvitationRequests.name, {
      input,
    })
    const useCase = new ListReceivedInvitationRequestsUseCase(
      this.sessionManager,
    )
    const result = await useCase.execute({
      handleId: input.handleId,
      channelId: input.channelId,
    })
    const transformer = new ChannelInvitationRequestTransformer()
    return result.map((invitationRequest) =>
      transformer.fromEntityToAPI(invitationRequest),
    )
  }

  async getChannelMembers(
    input: GetChannelMembersInput,
  ): Promise<ChannelMember[]> {
    this.log.debug(this.getChannelMembers.name, {
      input,
    })
    const useCase = new GetChannelMembersUseCase(this.sessionManager)
    const result = await useCase.execute({
      handleId: input.handleId,
      channelId: input.channelId,
    })
    const transformer = new ChannelMemberTransformer()
    return result.map((member) => transformer.fromEntityToAPI(member))
  }

  async getChannelMembership(
    input: GetChannelMembershipInput,
  ): Promise<MembershipState | undefined> {
    this.log.debug(this.getChannelMembership.name, {
      input,
    })
    const useCase = new GetChannelMembershipUseCase(this.sessionManager)
    const result = await useCase.execute({
      handleId: input.handleId,
      channelId: input.channelId,
    })
    const transformer = new MembershipStateTransformer()
    return result ? transformer.fromEntityToAPI(result) : undefined
  }

  async updateChannelMemberRole(
    input: UpdateChannelMemberRoleInput,
  ): Promise<void> {
    this.log.debug(this.updateChannelMemberRole.name, {
      input,
    })
    const channelRoleTransformer = new ChannelRoleTransformer()
    const useCase = new UpdateChannelMemberRoleUseCase(this.sessionManager)
    await useCase.execute({
      handleId: input.handleId,
      channelId: input.channelId,
      targetHandleId: input.targetHandleId,
      role: channelRoleTransformer.fromAPIToEntity(input.role),
    })
  }

  async kickHandle(input: KickChannelHandleInput): Promise<void> {
    this.log.debug(this.kickHandle.name, {
      input,
    })
    const useCase = new KickHandleUseCase(this.sessionManager)
    await useCase.execute({
      handleId: input.handleId,
      channelId: input.channelId,
      targetHandleId: input.targetHandleId,
      reason: input.reason,
    })
  }

  async banHandle(input: BanChannelHandleInput): Promise<void> {
    this.log.debug(this.banHandle.name, {
      input,
    })
    const useCase = new BanHandleUseCase(this.sessionManager)
    await useCase.execute({
      handleId: input.handleId,
      channelId: input.channelId,
      targetHandleId: input.targetHandleId,
      reason: input.reason,
    })
  }

  async unbanHandle(input: UnbanChannelHandleInput): Promise<void> {
    this.log.debug(this.unbanHandle.name, {
      input,
    })
    const useCase = new UnbanHandleUseCase(this.sessionManager)
    await useCase.execute({
      handleId: input.handleId,
      channelId: input.channelId,
      targetHandleId: input.targetHandleId,
    })
  }
}
