/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { MediaBucketCredential } from '../../../../gen/graphqlTypes'
import { RoomMediaCredentialEntity } from '../../../domain/entities/media/mediaCredentialEntity'

export class RoomMediaCredentialTransformer {
  fromGraphQLToEntity(data: MediaBucketCredential): RoomMediaCredentialEntity {
    return {
      keyPrefix: data.keyPrefix,
      accessKeyId: data.accessKeyId,
      secretAccessKey: data.secretAccessKey,
      sessionToken: data.sessionToken,
      expiry: data.expiration,
    }
  }
}
