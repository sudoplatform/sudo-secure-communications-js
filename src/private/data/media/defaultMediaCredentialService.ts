/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  GetMediaBucketCredentialInput,
  MediaBucketOperation,
} from '../../../gen/graphqlTypes'
import { RoomMediaCredentialEntity } from '../../domain/entities/media/mediaCredentialEntity'
import {
  GetMediaCredentialInput,
  MediaCredentialService,
} from '../../domain/entities/media/mediaCredentialService'
import { ApiClient } from '../common/apiClient'
import { RoomMediaCredentialTransformer } from './transformer/roomMediaCredentialTransformer'

export class DefaultMediaCredentialService implements MediaCredentialService {
  private readonly roomMediaCredentialTransformer: RoomMediaCredentialTransformer

  constructor(private readonly appSync: ApiClient) {
    this.roomMediaCredentialTransformer = new RoomMediaCredentialTransformer()
  }

  async get(
    input: GetMediaCredentialInput,
  ): Promise<RoomMediaCredentialEntity> {
    const GetMediaCredentialInput: GetMediaBucketCredentialInput = {
      handleId: input.handleId,
      operation: input.forWrite
        ? MediaBucketOperation.ReadWrite
        : MediaBucketOperation.Read,
      roomId: input.roomId,
    }
    const result = await this.appSync.getMediaBucketCredential(
      GetMediaCredentialInput,
    )
    return this.roomMediaCredentialTransformer.fromGraphQLToEntity(result)
  }
}
