/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { DefaultLogger, Logger } from '@sudoplatform/sudo-common'
import { HandleId, UnacceptableWordsError } from '../../../../public'
import { OwnedHandleEntity } from '../../entities/handle/handleEntity'
import { HandleService } from '../../entities/handle/handleService'
import { WordValidationService } from '../../entities/wordValidation/wordValidationService'

/**
 * Input for `UpdateHandleUseCase`.
 *
 * @interface UpdateHandleUseCaseInput
 */
interface UpdateHandleUseCaseInput {
  handleId: HandleId
  name: string
}

/**
 * Application business logic for updating a handle.
 */
export class UpdateHandleUseCase {
  private readonly log: Logger

  public constructor(
    private readonly handleService: HandleService,
    private readonly wordValidationService: WordValidationService,
  ) {
    this.log = new DefaultLogger(this.constructor.name)
  }

  async execute(input: UpdateHandleUseCaseInput): Promise<OwnedHandleEntity> {
    this.log.debug(this.constructor.name, {
      input,
    })
    const wordsToValidate = new Set([input.name])
    const validWords =
      await this.wordValidationService.checkWordValidity(wordsToValidate)
    if (wordsToValidate.size !== validWords.size) {
      throw new UnacceptableWordsError()
    }
    return await this.handleService.update({
      handleId: input.handleId.toString(),
      name: input.name,
    })
  }
}
