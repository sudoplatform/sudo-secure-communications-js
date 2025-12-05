/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  CreateSecureCommsHandleInput,
  GetSecureCommsSessionInput,
} from '../../../gen/graphqlTypes'
import { SecureCommsSessionEntity } from '../../domain/entities/session/secureCommsSessionEntity'
import {
  CreateSessionInput,
  GetSessionInput,
  SessionService,
} from '../../domain/entities/session/sessionService'
import { ApiClient } from '../common/apiClient'
import { SessionTransformer } from './transformer/sessionTransformer'

export class DefaultSessionService implements SessionService {
  private readonly sessionTransformer: SessionTransformer

  constructor(private readonly appSync: ApiClient) {
    this.sessionTransformer = new SessionTransformer()
  }

  async create(input: CreateSessionInput): Promise<SecureCommsSessionEntity> {
    const createHandleInput: CreateSecureCommsHandleInput = {
      id: input.id,
      name: input.name,
      deviceId: input.deviceId,
    }
    const result = await this.appSync.createSecureCommsHandle(createHandleInput)
    return this.sessionTransformer.fromGraphQLToEntity(result)
  }

  async get(input: GetSessionInput): Promise<SecureCommsSessionEntity> {
    const getSessionInput: GetSecureCommsSessionInput = {
      handleId: input.handleId,
      deviceId: input.deviceId,
    }
    const result = await this.appSync.getSecureCommsSession(getSessionInput)
    return this.sessionTransformer.fromGraphQLToEntity(result)
  }
}
