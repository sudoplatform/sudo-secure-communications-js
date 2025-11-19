/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { DefaultLogger, Logger } from '@sudoplatform/sudo-common'
import { OwnedHandleEntity } from '../../entities/handle/handleEntity'
import { HandleService } from '../../entities/handle/handleService'

/**
 * Input for `ListHandlesUseCase`.
 *
 * @interface ListHandlesUseCaseInput
 */
interface ListHandlesUseCaseInput {
  limit?: number | undefined
  nextToken?: string | undefined
}

/**
 * Output for `ListHandlesUseCase`.
 *
 * @interface ListHandlesUseCaseOutput
 */
interface ListHandlesUseCaseOutput {
  handles: OwnedHandleEntity[]
  nextToken?: string
}

/**
 * Application business logic for listing all handles for this client.
 */
export class ListHandlesUseCase {
  private readonly log: Logger

  public constructor(private readonly handleService: HandleService) {
    this.log = new DefaultLogger(this.constructor.name)
  }

  async execute(
    input: ListHandlesUseCaseInput,
  ): Promise<ListHandlesUseCaseOutput> {
    this.log.debug(this.constructor.name, {
      input,
    })
    return await this.handleService.list({
      limit: input.limit,
      nextToken: input.nextToken,
    })
  }
}
