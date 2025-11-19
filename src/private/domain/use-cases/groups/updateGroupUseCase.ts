/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { DefaultLogger, Logger } from '@sudoplatform/sudo-common'
import {
  GroupId,
  HandleId,
  Input,
  UnacceptableWordsError,
} from '../../../../public'
import { S3Client } from '../../../data/common/s3Client'
import { GroupTransformer } from '../../../data/groups/transformer/groupTransformer'
import { MatrixMediaService } from '../../../data/media/matrixMediaService'
import { MediaCredentialManager } from '../../../data/media/mediaCredentialManager'
import { MatrixRoomsService } from '../../../data/rooms/matrixRoomsService'
import { SessionManager } from '../../../data/session/sessionManager'
import { delay } from '../../../util/delay'
import { GroupEntity } from '../../entities/groups/groupEntity'
import { PublicMediaType } from '../../entities/media/mediaCredentialEntity'
import { AvatarInput, UpdateRoomInput } from '../../entities/rooms/roomsService'
import { WordValidationService } from '../../entities/wordValidation/wordValidationService'

/**
 * Input for `UpdateGroupUseCase`.
 *
 * @interface UpdateGroupUseCaseInput
 */
interface UpdateGroupUseCaseInput {
  handleId: HandleId
  groupId: GroupId
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
}

/**
 * Application business logic for updating a group.
 */
export class UpdateGroupUseCase {
  private readonly log: Logger

  public constructor(
    private readonly sessionManager: SessionManager,
    private readonly wordValidationService: WordValidationService,
    private readonly mediaCredentialManager: MediaCredentialManager,
  ) {
    this.log = new DefaultLogger(this.constructor.name)
  }

  async execute(input: UpdateGroupUseCaseInput): Promise<GroupEntity> {
    this.log.debug(this.constructor.name, {
      input,
    })
    // Validate words used in the input
    const wordsToValidate = new Set([
      ...(input.name?.value ? [input.name.value] : []),
      ...(input.description?.value ? [input.description.value] : []),
    ])
    const validWords =
      await this.wordValidationService.checkWordValidity(wordsToValidate)
    if (wordsToValidate.size != validWords.size) {
      throw new UnacceptableWordsError()
    }

    let avatarInput: Input<AvatarInput | undefined> | undefined = undefined
    if (input.avatar !== undefined) {
      if (input.avatar.value !== undefined) {
        const mediaCredential =
          await this.mediaCredentialManager.getPublicMediaCredential(
            true,
            PublicMediaType.AVATARS,
          )
        avatarInput = {
          value: { ...input.avatar.value, mediaCredential: mediaCredential },
        }
      }
    }
    const request: UpdateRoomInput = {
      roomId: input.groupId.toString(),
      name: input.name,
      description: input.description,
      avatar: avatarInput,
    }
    const result = await this.updateGroup(input.handleId, request)
    // Delay to allow updated room to be fully returned by matrix
    await delay(3000)
    return result
  }

  private async updateGroup(
    handleId: HandleId,
    input: UpdateRoomInput,
  ): Promise<GroupEntity> {
    {
      const matrixClient = await this.sessionManager.getMatrixClient(handleId)
      let matrixMediaService = undefined
      if (input.avatar !== undefined) {
        if (input.avatar.value !== undefined) {
          const s3Client = new S3Client(input.avatar?.value?.mediaCredential)
          matrixMediaService = new MatrixMediaService(matrixClient, s3Client)
        }
      }
      const matrixRoomsService = new MatrixRoomsService(
        matrixClient,
        matrixMediaService,
      )
      const room = await matrixRoomsService.update(input)
      const transformer = new GroupTransformer()
      return transformer.fromRoomToEntity(room)
    }
  }
}
