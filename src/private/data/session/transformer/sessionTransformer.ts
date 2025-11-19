/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { SecureCommsSession as SecureCommsSessionGraphQL } from '../../../../gen/graphqlTypes'
import { SecureCommsSession } from '../../../../public'
import { SecureCommsSessionEntity } from '../../../domain/entities/session/secureCommsSessionEntity'

export class SessionTransformer {
  fromEntityToAPI(entity: SecureCommsSessionEntity): SecureCommsSession {
    return {
      handleId: entity.handleId,
      handleName: entity.handleName,
      deviceId: entity.deviceId,
      owner: entity.owner,
      owners: entity.owners.map(({ id, issuer }) => ({ id, issuer })),
      token: entity.token,
      createdAt: entity.createdAt,
      expiresAt: entity.expiresAt,
    }
  }

  fromGraphQLToEntity(
    data: SecureCommsSessionGraphQL,
  ): SecureCommsSessionEntity {
    return {
      handleId: data.handleId,
      handleName: data.handleName,
      deviceId: data.deviceId,
      owner: data.owner,
      owners: data.owners.map(({ id, issuer }) => ({ id, issuer })),
      token: data.token,
      createdAt: new Date(data.createdAtEpochMs),
      expiresAt: new Date(data.expiresAtEpochMs),
    }
  }
}
