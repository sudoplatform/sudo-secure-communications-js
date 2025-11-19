/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { DefaultLogger, Logger } from '@sudoplatform/sudo-common'
import { v4 } from 'uuid'
import { HandleId, UnacceptableWordsError } from '../../../../public'
import { SessionManager } from '../../../data/session/sessionManager'
import { OwnedHandleEntity } from '../../entities/handle/handleEntity'
import { SessionService } from '../../entities/session/sessionService'
import { WordValidationService } from '../../entities/wordValidation/wordValidationService'

/**
 * Input for `ProvisionHandleUseCase`.
 *
 * @interface ProvisionHandleUseCaseInput
 */
interface ProvisionHandleUseCaseInput {
  name: string
  storePassphrase?: string
}

/**
 * Application business logic for provisioning a handle.
 */
export class ProvisionHandleUseCase {
  private readonly log: Logger

  public constructor(
    private readonly sessionService: SessionService,
    private readonly wordValidationService: WordValidationService,
    private readonly sessionManager: SessionManager,
  ) {
    this.log = new DefaultLogger(this.constructor.name)
  }

  async execute(
    input: ProvisionHandleUseCaseInput,
  ): Promise<OwnedHandleEntity> {
    this.log.debug(this.constructor.name, {
      input,
    })
    const wordsToValidate = new Set([input.name])
    const validWords =
      await this.wordValidationService.checkWordValidity(wordsToValidate)
    if (wordsToValidate.size !== validWords.size) {
      throw new UnacceptableWordsError()
    }
    // Use a new device ID for every new handle to avoid any correlation between handles.
    const deviceId = v4()
    const session = await this.sessionService.create({
      name: input.name,
      deviceId,
    })

    const handleId = new HandleId(session.handleId)

    // Initialize matrix client and configure storage
    await this.sessionManager.ensureValidSession(
      handleId,
      input.storePassphrase,
    )
    const result: OwnedHandleEntity = {
      handleId: new HandleId(session.handleId),
      name: session.handleName,
      owner: session.owner,
      owners: session.owners,
    }
    return result
  }
}
