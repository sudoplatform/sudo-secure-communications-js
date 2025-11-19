/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { DefaultLogger, Logger } from '@sudoplatform/sudo-common'
import {
  ChannelId,
  HandleId,
  Input,
  UnacceptableWordsError,
} from '../../../../public'
import { ChannelPowerLevelsTransformer } from '../../../data/channels/transformer/channelPowerLevelsTransformer'
import { S3Client } from '../../../data/common/s3Client'
import { MatrixMediaService } from '../../../data/media/matrixMediaService'
import { MediaCredentialManager } from '../../../data/media/mediaCredentialManager'
import { MatrixRoomsService } from '../../../data/rooms/matrixRoomsService'
import { SessionManager } from '../../../data/session/sessionManager'
import { toMatrixUserId } from '../../../util/id'
import {
  ChannelEntity,
  ChannelJoinRuleEntity,
  ChannelPermissionsEntity,
  ChannelPermissionsInputEntity,
  ChannelRoleEntity,
  isChannelVisible,
} from '../../entities/channels/channelEntity'
import {
  ChannelsService,
  UpdateChannelInput,
} from '../../entities/channels/channelsService'
import { PublicMediaType } from '../../entities/media/mediaCredentialEntity'
import { RoomPowerLevelsEntity } from '../../entities/rooms/roomPowerLevelsEntity'
import { WordValidationService } from '../../entities/wordValidation/wordValidationService'

/**
 * Input for `UpdateChannelUseCase`.
 *
 * @interface UpdateChannelUseCaseInput
 */
interface UpdateChannelUseCaseInput {
  handleId: HandleId
  channelId: ChannelId
  name?: Input<string | undefined>
  description?: Input<string | undefined>
  avatar?: Input<
    | {
        file: ArrayBuffer
        fileName: string
        fileType: string
      }
    | undefined
  >
  joinRule?: Input<ChannelJoinRuleEntity>
  tags?: Input<string[]>
  permissions?: Input<ChannelPermissionsInputEntity | undefined>
  defaultMemberRole?: Input<ChannelRoleEntity>
}

/**
 * Application business logic for updating a channel.
 */
export class UpdateChannelUseCase {
  private readonly log: Logger

  public constructor(
    private readonly channelsService: ChannelsService,
    private readonly wordValidationService: WordValidationService,
    private readonly sessionManager: SessionManager,
    private readonly mediaCredentialManager: MediaCredentialManager,
  ) {
    this.log = new DefaultLogger(this.constructor.name)
  }

  async execute(input: UpdateChannelUseCaseInput): Promise<ChannelEntity> {
    this.log.debug(this.constructor.name, {
      input,
    })
    // Validate words used in the input
    const wordsToValidate = new Set([
      ...(input.tags?.value ?? []),
      ...(input.name?.value ? [input.name.value] : []),
    ])
    const validWords =
      await this.wordValidationService.checkWordValidity(wordsToValidate)
    if (wordsToValidate.size !== validWords.size) {
      throw new UnacceptableWordsError()
    }

    // Update the avatar
    let avatarUrl: Input<string | undefined> | undefined = undefined
    if (input.avatar !== undefined) {
      if (input.avatar.value !== undefined) {
        const { file, fileName, fileType } = input.avatar.value
        const joinRule =
          input.joinRule?.value ??
          (await this.channelsService.get(input.channelId.toString()))
            ?.joinRule ??
          ChannelJoinRuleEntity.PRIVATE
        const isVisible = isChannelVisible(joinRule)
        const avatarMxcUrl = await this.uploadAvatar(
          input.handleId,
          input.channelId,
          file,
          fileName,
          fileType,
          isVisible,
        )
        avatarUrl = { value: avatarMxcUrl }
      } else {
        avatarUrl = { value: undefined }
      }
    }

    // Update channel at SCS
    const request: UpdateChannelInput = {
      selfHandleId: input.handleId.toString(),
      channelId: input.channelId.toString(),
      name: input.name,
      description: input.description,
      tags: input.tags,
      joinRule: input.joinRule,
      avatarUrl,
    }
    const result = await this.channelsService.update(request)

    // Update permissions and default member roles at matrix
    if (input.defaultMemberRole || input.permissions) {
      await this.updateRoomPowerLevels(
        input.handleId,
        input.channelId,
        input.permissions,
        input.defaultMemberRole,
      )
    }
    return result
  }

  private async uploadAvatar(
    handleId: HandleId,
    id: ChannelId,
    file: ArrayBuffer,
    fileName: string,
    fileType: string,
    isVisible: boolean,
  ): Promise<string | undefined> {
    {
      const matrixClient = await this.sessionManager.getMatrixClient(handleId)
      const mediaCredential =
        await this.mediaCredentialManager.getPublicMediaCredential(
          true,
          PublicMediaType.AVATARS,
        )
      const s3Client = new S3Client(mediaCredential)
      const matrixMediaService = new MatrixMediaService(matrixClient, s3Client)
      const matrixRoomsService = new MatrixRoomsService(
        matrixClient,
        matrixMediaService,
      )
      const updatedRoom = await matrixRoomsService.update({
        roomId: id.toString(),
        avatar: { value: { file, fileName, fileType, mediaCredential } },
        isVisible: { value: isVisible },
      })
      return updatedRoom.avatarUrl
    }
  }

  private async updateRoomPowerLevels(
    handleId: HandleId,
    channelId: ChannelId,
    permissions?: Input<ChannelPermissionsInputEntity | undefined>,
    defaultMemberRole?: Input<ChannelRoleEntity>,
  ): Promise<void> {
    const matrixClient = await this.sessionManager.getMatrixClient(handleId)
    const matrixRoomsService = new MatrixRoomsService(matrixClient)
    const room = await matrixRoomsService.get(channelId.toString())
    const currentRoomPowerLevels = room?.powerLevels

    const powerLevelsTransformer = new ChannelPowerLevelsTransformer()
    const users: Record<string, number> = {
      ...(currentRoomPowerLevels?.users ?? {}),
    }
    const newDefaultLevel = powerLevelsTransformer.fromEntityToPowerLevel(
      defaultMemberRole?.value ?? ChannelRoleEntity.PARTICIPANT,
    )
    if (newDefaultLevel === currentRoomPowerLevels?.users_default) {
      return
    }

    const members = await matrixRoomsService.getMembers(channelId.toString())
    for (const member of members ?? []) {
      const userId = toMatrixUserId(
        member.handle.handleId.toString(),
        matrixClient.homeServer,
      )
      const currentLevel =
        currentRoomPowerLevels?.users?.[userId] ??
        currentRoomPowerLevels?.users_default
      // Keep custom power levels that differ from the new default and are not already in `users`
      if (
        currentLevel !== undefined &&
        currentLevel !== newDefaultLevel &&
        !(userId in users)
      ) {
        users[userId] = currentLevel
      }
    }

    // Update room power levels at matrix
    const defaultPermissions = ChannelPermissionsEntity.default
    const roomPowerLevels: RoomPowerLevelsEntity = {
      ban: powerLevelsTransformer.fromEntityToPowerLevel(
        permissions?.value?.banHandles ?? defaultPermissions.banHandles,
      ),
      events_default: powerLevelsTransformer.fromEntityToPowerLevel(
        permissions?.value?.sendMessages ?? defaultPermissions.sendMessages,
      ),
      invite: powerLevelsTransformer.fromEntityToPowerLevel(
        permissions?.value?.inviteHandles ?? defaultPermissions.inviteHandles,
      ),
      kick: powerLevelsTransformer.fromEntityToPowerLevel(
        permissions?.value?.kickHandles ?? defaultPermissions.kickHandles,
      ),
      redact: powerLevelsTransformer.fromEntityToPowerLevel(
        permissions?.value?.deleteOthersMessages ??
          defaultPermissions.deleteOthersMessages,
      ),
      events: {
        'm.room.name': powerLevelsTransformer.fromEntityToPowerLevel(
          permissions?.value?.changeChannelName ??
            defaultPermissions.changeChannelName,
        ),
        'm.room.topic': powerLevelsTransformer.fromEntityToPowerLevel(
          permissions?.value?.changeChannelDescription ??
            defaultPermissions.changeChannelDescription,
        ),
        'm.room.avatar': powerLevelsTransformer.fromEntityToPowerLevel(
          permissions?.value?.changeChannelAvatar ??
            defaultPermissions.changeChannelAvatar,
        ),
      },
      users_default: powerLevelsTransformer.fromEntityToPowerLevel(
        defaultMemberRole?.value ?? ChannelRoleEntity.PARTICIPANT,
      ),
      users,
    }
    await matrixRoomsService.update({
      roomId: channelId.toString(),
      powerLevels: { value: roomPowerLevels },
    })
  }
}
