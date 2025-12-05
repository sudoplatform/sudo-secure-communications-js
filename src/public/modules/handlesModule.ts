/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { DefaultLogger, ListOutput, Logger } from '@sudoplatform/sudo-common'
import { ApiClient } from '../../private/data/common/apiClient'
import { DefaultHandleService } from '../../private/data/handle/defaultHandleService'
import { HandleTransformer } from '../../private/data/handle/transformer/handleTransformer'
import { DefaultSessionService } from '../../private/data/session/defaultSessionService'
import { SessionManager } from '../../private/data/session/sessionManager'
import { DefaultWordValidationService } from '../../private/data/wordValidation/defaultWordValidationService'
import { DeprovisionHandleUseCase } from '../../private/domain/use-cases/handles/deprovisionHandleUseCase'
import { ListHandlesUseCase } from '../../private/domain/use-cases/handles/listHandlesUseCase'
import { ProvisionHandleUseCase } from '../../private/domain/use-cases/handles/provisionHandleUseCase'
import { UpdateHandleUseCase } from '../../private/domain/use-cases/handles/updateHandleUseCase'
import { Pagination } from '../secureCommsClient'
import { HandleId, OwnedHandle } from '../typings'

/**
 * Properties required to provision a handle.
 *
 * @interface ProvisionHandleInput
 * @property {string} id Optional handle ID.
 * @property {string} name The name of the handle that will be publicly visible to other users.
 * @property {string} storePassphrase (Optional) The passphrase to use for the handle's storage.
 *  If not provided, the local storage will not be encrypted.
 */
export interface ProvisionHandleInput {
  id?: string
  name: string
  storePassphrase?: string
}

/**
 * Properties required when updating existing handles.
 *
 * @interface UpdateHandleInput
 * @property {HandleId} handleId Identifier of the existing handle to update.
 * @property {string} name The new name of the handle.
 */
export interface UpdateHandleInput {
  handleId: HandleId
  name: string
}

/**
 * Properties required to list provisioned handles owned by this client.
 *
 * @interface ListHandlesInput
 */
export interface ListHandlesInput extends Pagination {}

/**
 * Management of this client's owned handles in the Secure Communications Service.
 */
export interface HandlesModule {
  /**
   * Provisions a new handle.
   *
   * @param {ProvisionHandleInput} input Parameters used to provision a handle.
   * @returns {OwnedHandle} A new handle.
   */
  provisionHandle(input: ProvisionHandleInput): Promise<OwnedHandle>

  /**
   * Deletes an existing handle owned by this client.
   *
   * @param {HandleId} handleId The identifier associated with the handle to deprovision.
   */
  deprovisionHandle(handleId: HandleId): Promise<void>

  /**
   * Updates an existing handle owned by this client.
   *
   * @param {UpdateHandleInput} input Parameters used to update the handle.
   * @returns {OwnedHandle} The updated handle.
   */
  updateHandle(input: UpdateHandleInput): Promise<OwnedHandle>

  /**
   * List all handles owned by this client.
   *
   * @returns {ListOutput<OwnedHandle>} A list of all handles matching the search criteria.
   */
  listHandles(input: ListHandlesInput): Promise<ListOutput<OwnedHandle>>
}

export class DefaultHandlesModule implements HandlesModule {
  private readonly log: Logger
  private readonly handleService: DefaultHandleService
  private readonly sessionService: DefaultSessionService
  private readonly wordValidationService: DefaultWordValidationService

  public constructor(
    private readonly apiClient: ApiClient,
    private readonly sessionManager: SessionManager,
  ) {
    this.log = new DefaultLogger(this.constructor.name)
    this.handleService = new DefaultHandleService(this.apiClient)
    this.sessionService = new DefaultSessionService(this.apiClient)
    this.wordValidationService = new DefaultWordValidationService(
      this.apiClient,
    )
  }

  async provisionHandle(input: ProvisionHandleInput): Promise<OwnedHandle> {
    this.log.debug(this.provisionHandle.name, {
      input,
    })
    const useCase = new ProvisionHandleUseCase(
      this.sessionService,
      this.wordValidationService,
      this.sessionManager,
    )
    const result = await useCase.execute({
      id: input.id,
      name: input.name,
      storePassphrase: input.storePassphrase,
    })
    const transformer = new HandleTransformer()
    return transformer.fromEntityToAPI(result)
  }

  public async deprovisionHandle(id: HandleId): Promise<void> {
    this.log.debug(this.deprovisionHandle.name, {
      id,
    })
    const useCase = new DeprovisionHandleUseCase(
      this.handleService,
      this.sessionManager,
    )
    await useCase.execute(id)
  }

  public async updateHandle(input: UpdateHandleInput): Promise<OwnedHandle> {
    this.log.debug(this.updateHandle.name, {
      input,
    })
    const useCase = new UpdateHandleUseCase(
      this.handleService,
      this.wordValidationService,
    )
    const result = await useCase.execute({
      handleId: input.handleId,
      name: input.name,
    })
    const transformer = new HandleTransformer()
    return transformer.fromEntityToAPI(result)
  }

  async listHandles(input: ListHandlesInput): Promise<ListOutput<OwnedHandle>> {
    this.log.debug(this.listHandles.name, {
      input,
    })
    const useCase = new ListHandlesUseCase(this.handleService)
    const { handles, nextToken: resultNextToken } = await useCase.execute({
      limit: input.limit,
      nextToken: input.nextToken,
    })
    const transformer = new HandleTransformer()
    const transformedHandles = handles.map((handle) =>
      transformer.fromEntityToAPI(handle),
    )
    return { items: transformedHandles, nextToken: resultNextToken }
  }
}
