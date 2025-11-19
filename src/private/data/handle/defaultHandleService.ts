/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { UpdateSecureCommsHandleInput } from '../../../gen/graphqlTypes'
import {
  HandleEntity,
  OwnedHandleEntity,
} from '../../domain/entities/handle/handleEntity'
import {
  HandleService,
  ListHandlesInput,
  ListHandlesOutput,
  UpdateHandleInput,
} from '../../domain/entities/handle/handleService'
import { ApiClient } from '../common/apiClient'
import { HandleTransformer } from './transformer/handleTransformer'

export class DefaultHandleService implements HandleService {
  private readonly handleTransformer: HandleTransformer

  constructor(private readonly appSync: ApiClient) {
    this.handleTransformer = new HandleTransformer()
  }

  async get(name: string): Promise<HandleEntity | undefined> {
    const result = await this.appSync.getSecureCommsHandleByName(name)
    return result
      ? this.handleTransformer.fromGraphQLToEntity(result)
      : undefined
  }

  async update(input: UpdateHandleInput): Promise<OwnedHandleEntity> {
    const updateHandleInput: UpdateSecureCommsHandleInput = {
      id: input.handleId.toString(),
      name: input.name,
    }
    const result = await this.appSync.updateSecureCommsHandle(updateHandleInput)
    return this.handleTransformer.fromGraphQLToOwnedEntity(result)
  }

  async delete(id: string): Promise<OwnedHandleEntity> {
    const result = await this.appSync.deleteSecureCommsHandle(id.toString())
    return this.handleTransformer.fromGraphQLToOwnedEntity(result)
  }

  async list(input: ListHandlesInput): Promise<ListHandlesOutput> {
    const result = await this.appSync.listSecureCommsHandles(
      input.limit,
      input.nextToken,
    )
    const handles: OwnedHandleEntity[] = []
    if (result.items) {
      result.items.map((item) =>
        handles.push(this.handleTransformer.fromGraphQLToOwnedEntity(item)),
      )
    }
    return {
      handles,
      nextToken: result.nextToken ?? undefined,
    }
  }
}
