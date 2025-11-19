/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { fromCognitoIdentityPool } from '@aws-sdk/credential-providers'
import { SudoUserClient } from '@sudoplatform/sudo-user'
import { IdentityServiceConfig } from '@sudoplatform/sudo-user/types/sdk'
import { HandleId } from '../../../public'
import {
  MediaCredentialEntity,
  PublicMediaType,
  RoomMediaCredentialEntity,
} from '../../domain/entities/media/mediaCredentialEntity'
import { MediaCredentialService } from '../../domain/entities/media/mediaCredentialService'
import { SecureCommsServiceConfig } from '../common/config'

interface MediaCredentialCacheKey {
  handleId: HandleId
  forWrite: boolean
  roomId: string
}

export class MediaCredentialManager {
  private cache: Map<MediaCredentialCacheKey, RoomMediaCredentialEntity> =
    new Map()

  constructor(
    private readonly userClient: SudoUserClient,
    private readonly mediaCredentialService: MediaCredentialService,
    private readonly identityServiceConfig: IdentityServiceConfig,
    private readonly secureCommsServiceConfig: SecureCommsServiceConfig,
  ) {}

  /**
   * Retrieves a public media credential. Avatars and general media are allowed here.
   */
  async getPublicMediaCredential(
    forWrite: boolean,
    publicMediaType?: PublicMediaType,
  ): Promise<MediaCredentialEntity> {
    const authToken = await this.userClient.getLatestAuthToken()
    const credentialsProvider = fromCognitoIdentityPool({
      identityPoolId: this.identityServiceConfig.identityPoolId,
      logins: {
        [`cognito-idp.${this.identityServiceConfig.region}.amazonaws.com/${this.identityServiceConfig.poolId}`]:
          authToken,
      },
      clientConfig: { region: this.secureCommsServiceConfig.region },
    })
    const credential = await credentialsProvider()
    const bucket = this.secureCommsServiceConfig.publicMediaBucket
    const region = this.secureCommsServiceConfig.region
    return {
      bucket,
      region,
      keyPrefix: publicMediaType,
      forWrite,
      accessKeyId: credential.accessKeyId,
      secretAccessKey: credential.secretAccessKey,
      sessionToken: credential.sessionToken ?? '',
    }
  }

  /**
   * Retrieves the media credential for a room. Only chat media is allowed here.
   */
  async getRoomMediaCredential(
    handleId: HandleId,
    forWrite: boolean,
    roomId: string,
  ): Promise<MediaCredentialEntity> {
    const cacheKey: MediaCredentialCacheKey = { handleId, forWrite, roomId }
    const cached = this.cache.get(cacheKey)

    let credential: RoomMediaCredentialEntity
    const isValid = cached && cached.expiry > Date.now() + 120_000 // 120 second buffer for eventual consistency
    if (isValid) {
      credential = cached
    } else {
      credential = await this.mediaCredentialService.get({
        handleId: handleId.toString(),
        forWrite,
        roomId,
      })
      this.cache.set(cacheKey, credential)
    }

    const bucket = this.secureCommsServiceConfig.roomMediaBucket
    const region = this.secureCommsServiceConfig.region
    return {
      bucket,
      region,
      keyPrefix: credential.keyPrefix,
      forWrite,
      accessKeyId: credential.accessKeyId,
      secretAccessKey: credential.secretAccessKey,
      sessionToken: credential.sessionToken,
    }
  }
}
