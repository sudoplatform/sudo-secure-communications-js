/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EventType,
  ICreateRoomOpts,
  Preset,
  Visibility,
} from 'matrix-js-sdk/lib/matrix'
import { KnownMembership } from 'matrix-js-sdk/lib/types'
import {
  ChannelId,
  PermissionDeniedError,
  RoomNotFoundError,
  SecureCommsError,
} from '../../../public'
import { ChannelInvitationRequestEntity } from '../../domain/entities/channels/channelInvitationRequestEntity'
import {
  MembershipStateEntity,
  RoomMemberEntity,
} from '../../domain/entities/common/memberEntity'
import {
  CustomRoomType,
  RoomEntity,
} from '../../domain/entities/rooms/roomEntity'
import {
  BanHandleInput,
  CreateRoomInput,
  GetMembershipStateInput,
  KickHandleInput,
  KnockRoomInput,
  RoomsService,
  SendInvitationsInput,
  UnbanHandleInput,
  UpdateRoomInput,
  UpdateRoomMemberPowerLevelInput,
} from '../../domain/entities/rooms/roomsService'
import { toHandleId, toMatrixUserId } from '../../util/id'
import {
  CustomMatrixEvents,
  MatrixClientManager,
} from '../common/matrixClientManager'
import { MembershipStateTransformer } from '../common/transformer/membershipStateTransformer'
import { MatrixMediaService } from '../media/matrixMediaService'
import { RoomPowerLevelsTransformer } from './transformer/roomPowerLevelsTransformer'

export class MatrixRoomsService implements RoomsService {
  private readonly membershipStateTransformer: MembershipStateTransformer

  constructor(
    private readonly matrixClient: MatrixClientManager,
    private readonly matrixMediaService?: MatrixMediaService,
  ) {
    this.membershipStateTransformer = new MembershipStateTransformer()
  }

  async create(input: CreateRoomInput): Promise<RoomEntity> {
    const matrixUserIds = input.invitedHandleIds.map((id) =>
      toMatrixUserId(id, this.matrixClient.homeServer),
    )
    const powerLevelsTransformer = new RoomPowerLevelsTransformer()
    const initialState = [
      {
        type: 'm.room.encryption',
        content: {
          // Currently this is the only supported algorithm.
          //
          // See:  https://spec.matrix.org/v1.13/client-server-api/#mroomencryption
          algorithm: 'm.megolm.v1.aes-sha2',
        },
      },
      {
        type: CustomMatrixEvents.TYPE,
        content: {
          type: CustomRoomType.GROUP,
        },
      },
    ]
    const createRoomInput: ICreateRoomOpts = {
      name: input.name,
      topic: input.description,
      is_direct: false,
      visibility: Visibility.Private,
      preset: Preset.PrivateChat,
      invite: matrixUserIds.length > 0 ? matrixUserIds : undefined,
      power_level_content_override: input.powerLevels
        ? powerLevelsTransformer.fromEntityPowerLevelToRoomPowerLevel(
            input.powerLevels,
          )
        : undefined,
      initial_state: initialState,
    }
    const roomId = await this.matrixClient.createRoom(createRoomInput)
    return {
      roomId,
      name: input.name,
      description: input.description,
      avatarUrl: input.avatarUrl,
      powerLevels: input.powerLevels
        ? powerLevelsTransformer.fromEntityPowerLevelToRoomPowerLevel(
            input.powerLevels,
          )
        : undefined,
      memberCount: 1,
    }
  }

  async get(roomId: string): Promise<RoomEntity | undefined> {
    const room = await this.matrixClient.getRoom(roomId)
    if (!room) {
      return undefined
    }
    const description = await this.matrixClient.getRoomTopic(roomId)
    const avatarUrl = await this.matrixClient.getRoomAvatarUrl(roomId)
    const memberCount = room?.getJoinedMemberCount()
    const powerLevels = await this.matrixClient.getRoomPowerLevels(roomId)
    const roomType = await this.matrixClient.getRoomType(roomId)
    const roomTags = await this.matrixClient.getRoomTags(roomId)
    return {
      roomId: room.roomId,
      type: roomType,
      name: room.name,
      description,
      tags: roomTags,
      avatarUrl,
      powerLevels,
      memberCount: memberCount ?? 0,
    }
  }

  async update(input: UpdateRoomInput): Promise<RoomEntity> {
    const room = await this.get(input.roomId)
    if (!room) {
      throw new RoomNotFoundError()
    }
    if (input.name) {
      await this.matrixClient.setRoomName(room.roomId, input.name.value ?? '')
    }
    if (input.description) {
      await this.matrixClient.setRoomTopic(
        room.roomId,
        input.description.value ?? '',
      )
    }
    let avatarMxcUrl: string | undefined = undefined
    if (input.avatar) {
      if (input.avatar?.value) {
        if (!this.matrixMediaService) {
          throw new SecureCommsError('Media service is not available')
        }
        avatarMxcUrl = await this.matrixMediaService.uploadMediaFile({
          file: input.avatar.value.file,
          fileName: input.avatar.value.fileName,
          fileType: input.avatar.value.fileType,
          mediaCredential: input.avatar.value.mediaCredential,
        })
        await this.matrixClient.setRoomAvatar(room.roomId, avatarMxcUrl)
      } else {
        await this.matrixClient.setRoomAvatar(room.roomId, undefined)
      }
    }
    if (input.powerLevels) {
      if (input.powerLevels.value) {
        await this.matrixClient.setRoomPowerLevels(
          room.roomId,
          input.powerLevels.value,
        )
      }
    }
    return {
      roomId: room.roomId,
      name: input.name?.value ?? room.name,
      description: input.description?.value ?? room.description,
      avatarUrl: avatarMxcUrl ?? room.avatarUrl,
      powerLevels: input.powerLevels?.value ?? room.powerLevels,
      memberCount: room.memberCount,
    }
  }

  async list(roomIds: string[]): Promise<RoomEntity[]> {
    const rooms = await Promise.all(roomIds.map((id) => this.get(id)))
    const result: RoomEntity[] = rooms
      .filter((room): room is RoomEntity => !!room)
      .map((room) => {
        return room
      })
    return result
  }

  async getMembers(roomId: string): Promise<RoomMemberEntity[]> {
    const members = await this.matrixClient.getMembers(roomId)
    if (!members) {
      throw new RoomNotFoundError()
    }
    const powerLevels = await this.matrixClient.getRoomPowerLevels(roomId)
    if (!powerLevels) {
      throw new RoomNotFoundError()
    }
    return members.map((member) => {
      return {
        handle: {
          handleId: toHandleId(member.userId!),
          name: member.displayName ?? '',
        },
        membership: member.membership
          ? this.membershipStateTransformer.fromMatrixToEntity(
              member.membership,
            )
          : MembershipStateEntity.JOINED,
        powerLevel:
          powerLevels.users?.[member.userId!] ?? powerLevels.users_default ?? 0,
      }
    })
  }

  async join(roomId: string): Promise<void> {
    await this.matrixClient.joinRoom(roomId)
  }

  async leave(roomId: string): Promise<void> {
    await this.matrixClient.leaveRoom(roomId)
  }

  async sendInvitations(input: SendInvitationsInput): Promise<void> {
    const room = await this.matrixClient.getRoom(input.roomId)
    if (!room) {
      throw new RoomNotFoundError()
    }
    const alreadyJoined =
      room
        .getMembers()
        ?.filter(
          (member) =>
            member.membership !== undefined &&
            [
              KnownMembership.Join.toString(),
              KnownMembership.Invite.toString(),
              KnownMembership.Ban.toString(),
            ].includes(member.membership),
        )
        .map((member) => toHandleId(member.userId).toString()) || []

    // Invite the members without invites concurrently
    const toInvite = new Set(
      [...input.targetHandleIds].filter(
        (handleId) => !alreadyJoined.includes(handleId),
      ),
    )
    await Promise.all(
      Array.from(toInvite).map(async (handleId) => {
        const matrixUserId = toMatrixUserId(
          handleId,
          this.matrixClient.homeServer,
        )
        await this.matrixClient.invite(input.roomId, matrixUserId)
      }),
    )
  }

  async knockRoom(input: KnockRoomInput): Promise<void> {
    await this.matrixClient.knockRoom(input.roomId, input.reason)
  }

  async listInvitedRooms(): Promise<RoomEntity[]> {
    const rooms = await this.matrixClient.listRooms()
    return rooms
      .filter((room) => room.getMyMembership() === KnownMembership.Invite)
      .map((room) => ({
        roomId: room.roomId,
        name: room.name,
        memberCount: room.getJoinedMemberCount(),
      }))
  }

  async listJoinedRoomIds(): Promise<string[]> {
    return await this.matrixClient.listJoinedRooms()
  }

  async listKnockedRooms(): Promise<RoomEntity[]> {
    const rooms = await this.matrixClient.listRooms()
    return rooms
      .filter((room) => room.getMyMembership() === KnownMembership.Knock)
      .map((room) => ({
        roomId: room.roomId,
        name: room.name,
        memberCount: room.getJoinedMemberCount(),
      }))
  }

  async listKnockRequests(
    roomId: string,
  ): Promise<ChannelInvitationRequestEntity[]> {
    const room = await this.matrixClient.getRoom(roomId)
    if (!room) {
      throw new RoomNotFoundError()
    }
    const knockRequests = room
      .getMembers()
      ?.filter(
        (member) => member.membership === KnownMembership.Knock.toString(),
      )
    return knockRequests.map((knockRequest) => {
      return {
        channelId: new ChannelId(knockRequest.roomId),
        handleId: toHandleId(knockRequest.userId),
      } as ChannelInvitationRequestEntity
    })
  }

  async getMembershipState(
    input: GetMembershipStateInput,
  ): Promise<MembershipStateEntity | undefined> {
    const userId = toMatrixUserId(input.handleId, this.matrixClient.homeServer)
    const membershipState = await this.matrixClient.getMembershipState(
      input.roomId,
      userId,
    )
    return membershipState
      ? this.membershipStateTransformer.fromMatrixToEntity(membershipState)
      : undefined
  }

  async updateRoomMemberPowerLevel(
    input: UpdateRoomMemberPowerLevelInput,
  ): Promise<void> {
    const userId = await this.matrixClient.getUserId()
    const room = await this.matrixClient.getRoom(input.roomId)
    if (!room) {
      throw new RoomNotFoundError()
    }
    const matrixTargetUserId = toMatrixUserId(
      input.targetHandleId,
      this.matrixClient.homeServer,
    )

    const powerLevels = room.currentState
      .getStateEvents(EventType.RoomPowerLevels, '')
      ?.getContent()
    const currentPowerLevel =
      powerLevels?.users?.[userId] ?? powerLevels?.users_default ?? 0
    const memberToUpdatePowerLevel =
      powerLevels?.users?.[matrixTargetUserId] ??
      powerLevels?.users_default ??
      0

    if (
      userId === matrixTargetUserId ||
      currentPowerLevel > memberToUpdatePowerLevel
    ) {
      await this.matrixClient.setRoomMemberPowerLevel(
        room.roomId,
        matrixTargetUserId,
        input.powerLevel,
      )
    } else {
      throw new PermissionDeniedError(
        'You are not permitted to update this members role',
      )
    }
  }

  async kickHandle(input: KickHandleInput): Promise<void> {
    const userId = await this.matrixClient.getUserId()
    const room = await this.matrixClient.getRoom(input.roomId)
    if (!room) {
      throw new RoomNotFoundError()
    }
    const matrixTargetUserId = toMatrixUserId(
      input.targetHandleId,
      this.matrixClient.homeServer,
    )

    const powerLevels = room.currentState
      .getStateEvents(EventType.RoomPowerLevels, '')
      ?.getContent()
    const currentPowerLevel =
      powerLevels?.users?.[userId] ?? powerLevels?.users_default ?? 0
    const memberToKickPowerLevel =
      powerLevels?.users?.[matrixTargetUserId] ??
      powerLevels?.users_default ??
      0

    if (
      userId === matrixTargetUserId ||
      currentPowerLevel > memberToKickPowerLevel
    ) {
      await this.matrixClient.kickHandle(
        room.roomId,
        matrixTargetUserId,
        input.reason,
      )
    } else {
      throw new PermissionDeniedError('You are not permitted to kick')
    }
  }

  async banHandle(input: BanHandleInput): Promise<void> {
    const userId = await this.matrixClient.getUserId()
    const room = await this.matrixClient.getRoom(input.roomId)
    if (!room) {
      throw new RoomNotFoundError()
    }
    const matrixTargetUserId = toMatrixUserId(
      input.targetHandleId,
      this.matrixClient.homeServer,
    )

    const powerLevels = room.currentState
      .getStateEvents(EventType.RoomPowerLevels, '')
      ?.getContent()
    const currentPowerLevel =
      powerLevels?.users?.[userId] ?? powerLevels?.users_default ?? 0
    const memberToBanPowerLevel =
      powerLevels?.users?.[matrixTargetUserId] ??
      powerLevels?.users_default ??
      0

    if (currentPowerLevel > memberToBanPowerLevel) {
      await this.matrixClient.banHandle(
        room.roomId,
        matrixTargetUserId,
        input.reason,
      )
    } else {
      throw new PermissionDeniedError('You are not permitted to ban')
    }
  }

  async unbanHandle(input: UnbanHandleInput): Promise<void> {
    const userId = await this.matrixClient.getUserId()
    const room = await this.matrixClient.getRoom(input.roomId)
    if (!room) {
      throw new RoomNotFoundError()
    }
    const matrixTargetUserId = toMatrixUserId(
      input.targetHandleId,
      this.matrixClient.homeServer,
    )

    const powerLevels = room.currentState
      .getStateEvents(EventType.RoomPowerLevels, '')
      ?.getContent()
    const currentPowerLevel =
      powerLevels?.users?.[userId] ?? powerLevels?.users_default ?? 0
    const memberToUnbanPowerLevel =
      powerLevels?.users?.[matrixTargetUserId] ??
      powerLevels?.users_default ??
      0

    if (currentPowerLevel > memberToUnbanPowerLevel) {
      await this.matrixClient.unbanHandle(room.roomId, matrixTargetUserId)
    } else {
      throw new PermissionDeniedError('You are not permitted to unban')
    }
  }
}
