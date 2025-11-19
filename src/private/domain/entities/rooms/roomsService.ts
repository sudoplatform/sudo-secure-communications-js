/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { RoomEntity } from './roomEntity'
import { RoomPowerLevelsEntity } from './roomPowerLevelsEntity'
import { Input } from '../../../../public/secureCommsClient'
import { ChannelInvitationRequestEntity } from '../channels/channelInvitationRequestEntity'
import { MembershipStateEntity, RoomMemberEntity } from '../common/memberEntity'
import { PowerLevelsEntity } from '../common/powerLevelsEntity'
import { MediaCredentialEntity } from '../media/mediaCredentialEntity'

/**
 * Input containing properties required to upload an avatar.
 *
 * @interface AvatarInput
 * @property {ArrayBuffer} file The file to use as the avatar.
 * @property {string} fileName The name of the file.
 * @property {string} fileType The MIME type of the file.
 */
export interface AvatarInput {
  file: ArrayBuffer
  fileName: string
  fileType: string
  mediaCredential: MediaCredentialEntity
}

/**
 * Input for `RoomsService.create` method.
 *
 * @interface CreateRoomInput
 * @property {string} name Optional display name for the room.
 * @property {string} description Optional description of the room.
 * @property {InvitedHandleIds[]} invitedHandleIds The handles that should be invited to the room after it is created.
 * @property {PowerLevelsEntity} powerLevels The minimum levels required to perform each action and the default level of handles in the room.
 * @property {string} avatarUrl Optional avatar image URL.
 */
export interface CreateRoomInput {
  name?: string
  description?: string
  invitedHandleIds: string[]
  powerLevels?: PowerLevelsEntity
  avatarUrl?: string
}

/**
 * Input for `RoomsService.update` method.
 *
 * @interface UpdateRoomInput
 * @property {string} roomId Identifier of the room to update.
 * @property {Input<string | undefined>} name The display name for the room.
 * @property {Input<string | undefined>} description The description of the room.
 * @property {Input<AvatarInput | undefined>} avatar The avatar of the room.
 * @property {Input<boolean | undefined>} isVisible Whether the room is findable in search.
 * @property {Input<RoomPowerLevelsEntity | undefined>} powerLevels The power levels indicating
 *  what roles can perform certain actions within the room.
 */
export interface UpdateRoomInput {
  roomId: string
  name?: Input<string | undefined>
  description?: Input<string | undefined>
  avatar?: Input<AvatarInput | undefined>
  isVisible?: Input<boolean | undefined>
  powerLevels?: Input<RoomPowerLevelsEntity | undefined>
}

/**
 * Input for `RoomsService.sendInvitations` method.
 *
 * @interface SendInvitationsInput
 * @property {string} roomId The identifier associated with the room.
 * @property {string[]} targetHandleIds The list of handle identifiers to invite.
 */
export interface SendInvitationsInput {
  roomId: string
  targetHandleIds: string[]
}

/**
 * Input for `RoomService.knock` method.
 *
 * @interface KnockRoomInput
 * @property {string} roomId The identifier associated with the room.
 * @property {string} reason Optional reason for the knock.
 */
export interface KnockRoomInput {
  roomId: string
  reason?: string
}

/**
 * Input for `RoomsService.getMembershipState` method.
 *
 * @interface GetMembershipStateInput
 * @property {string} roomId The identifier associated with the room.
 * @property {string} handleId The identifier associated with the handle.
 */
export interface GetMembershipStateInput {
  roomId: string
  handleId: string
}

/**
 * Input for `RoomsService.updateRoomMemberPowerLevel` method.
 *
 * @interface UpdateRoomMemberPowerLevelInput
 */
export interface UpdateRoomMemberPowerLevelInput {
  roomId: string
  targetHandleId: string
  powerLevel: number
}

/**
 * Input for `RoomsService.kickHandle` method.
 *
 * @interface KickHandleInput
 * @property {string} roomId The identifier associated with the room.
 * @property {string} targetHandleId The identifier of the handle intended to be kicked.
 * @property {string} reason Optional reason associated with the action.
 */
export interface KickHandleInput {
  roomId: string
  targetHandleId: string
  reason?: string
}

/**
 * Input for `RoomsService.banHandle` method.
 *
 * @interface BanHandleInput
 * @property {string} roomId The identifier associated with the room.
 * @property {string} targetHandleId The identifier of the handle intended to be banned.
 * @property {string} reason Optional reason associated with the action.
 */
export interface BanHandleInput {
  roomId: string
  targetHandleId: string
  reason?: string
}

/**
 * Input for `RoomsService.unbanHandle` method.
 *
 * @interface UnbanHandleInput
 * @property {string} roomId The identifier associated with the room.
 * @property {string} targetHandleId The identifier of the handle intended to be unbanned.
 * @property {string} reason Optional reason associated with the action.
 */
export interface UnbanHandleInput {
  roomId: string
  targetHandleId: string
  reason?: string
}

/**
 * Core entity representation of a room service used in business logic. Used to perform CRUD operations for rooms.
 *
 * @interface RoomsService
 */
export interface RoomsService {
  /**
   * Create a room.
   *
   * @param {CreateChannelInput} input Parameters used to create a room.
   * @returns {RoomEntity} The room that was created.
   */
  create(input: CreateRoomInput): Promise<RoomEntity>

  /**
   * Retrieve a room.
   *
   * @param {string} roomId The identifier used to retrieve the desired room.
   * @returns {RoomEntity | undefined} The retrieved room, or undefined if not found.
   */
  get(roomId: string): Promise<RoomEntity | undefined>

  /**
   * Update a room.
   *
   * @param {UpdateRoomInput} input Parameters used to update a room.
   * @returns {RoomEntity} The room that was updated.
   */
  update(input: UpdateRoomInput): Promise<RoomEntity>

  /**
   * Retrieve a list of rooms.
   *
   * @param {string[]} roomIds A list of identifers used to retrieve the desired rooms.
   * @returns {RoomEntity[]} A list of rooms matching the supplied identifiers, less
   *  any identifiers that did not correspond to a room.
   */
  list(roomIds: string[]): Promise<RoomEntity[]>

  /**
   * Retrieve a list of all members for a room.
   *
   * @param {string} roomId The identifier associated with the room to query.
   * @returns {RoomMemberEntity[]} The list of room members in the room.
   */
  getMembers(roomId: string): Promise<RoomMemberEntity[]>

  /**
   * Add a handle to a room.
   *
   * @param {string} roomId The identifier of the desired room to add the handle to.
   */
  join(roomId: string): Promise<void>

  /**
   * Remove a handle from a room.
   *
   * @param {string} roomId The identifier of the desired room to remove the handle from.
   */
  leave(roomId: string): Promise<void>

  /**
   * Invite handles to join a room.
   *
   * @param {SendInvitationsInput} input Parameters used to invite handles to join a room.
   */
  sendInvitations(input: SendInvitationsInput): Promise<void>

  /**
   * Knock a room.
   *
   * @param {KnockRoomInput} input Parameters used to knock a room.
   */
  knockRoom(input: KnockRoomInput): Promise<void>

  /**
   * Retrieve a list of all rooms the handle has an active invitation for.
   *
   * @returns {RoomEntity[]} The list of rooms that have an active invitation for
   *  the handle.
   */
  listInvitedRooms(): Promise<RoomEntity[]>

  /**
   * Retrieve a list of all identifiers of rooms the handle has joined.
   *
   * @returns {string[]} The list of identifiers of rooms that the handle has joined.
   */
  listJoinedRoomIds(): Promise<string[]>

  /**
   * Retrieve a list of rooms that the handle has requested to join.
   *
   * @returns {RoomEntity[]} The list of rooms that the handle has requested to join.
   */
  listKnockedRooms(): Promise<RoomEntity[]>

  /**
   * Retrieve a list of invitation requests to join a room (knock).
   *
   * @returns {ChannelInvitationRequestEntity[]} The list of invitations that the handle has sent.
   */
  listKnockRequests(roomId: string): Promise<ChannelInvitationRequestEntity[]>

  /**
   * Retrieve the membership state for a specific member of a room.
   *
   * @param {GetMembershipStateInput} input Parameters used to retrieve the membership state for a specific member of a room.
   * @returns {MembershipStateEntity | undefined} The membership state for the user in the room, or undefined if not found.
   */
  getMembershipState(
    input: GetMembershipStateInput,
  ): Promise<MembershipStateEntity | undefined>

  /**
   * Updates the power level for a specific member of a room.
   *
   * @param {UpdateRoomMemberPowerLevelInput} input Parameters used to update the power level for
   *  a specific member of a room.
   */
  updateRoomMemberPowerLevel(
    input: UpdateRoomMemberPowerLevelInput,
  ): Promise<void>

  /**
   * Kick a handle from a room.
   *
   * @param {KickHandleInput} input Parameters used to kick a handle from a room.
   */
  kickHandle(input: KickHandleInput): Promise<void>

  /**
   * Ban a handle from a room.
   *
   * @param {BanHandleInput} input Parameters used to ban a handle from a room.
   */

  banHandle(input: BanHandleInput): Promise<void>

  /**
   * Unban a handle from a room.
   *
   * @param {UnbanHandleInput} input Parameters used to unban a handle from a room.
   */
  unbanHandle(input: UnbanHandleInput): Promise<void>
}
