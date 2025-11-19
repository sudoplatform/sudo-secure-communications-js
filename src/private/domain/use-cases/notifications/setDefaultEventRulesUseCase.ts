/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { DefaultLogger, Logger } from '@sudoplatform/sudo-common'
import { EventNotificationRules, HandleId } from '../../../../public'
import { DefaultNotificationService } from '../../../data/notification/defaultNotificationService'
import { MatrixRoomsService } from '../../../data/rooms/matrixRoomsService'
import { SessionManager } from '../../../data/session/sessionManager'

/**
 * Input for `SetDefaultEventRulesUseCase`.
 *
 * @interface SetDefaultEventRulesUseCaseInput
 */
interface SetDefaultEventRulesUseCaseInput {
  handleId: HandleId
  eventRules: EventNotificationRules
}

/**
 * Use case for setting default event rules.
 */
export class SetDefaultEventRulesUseCase {
  private readonly log: Logger

  constructor(private readonly sessionManager: SessionManager) {
    this.log = new DefaultLogger(this.constructor.name)
  }

  async execute(input: SetDefaultEventRulesUseCaseInput): Promise<void> {
    this.log.debug(this.constructor.name, { input })

    const matrixClient = await this.sessionManager.getMatrixClient(
      input.handleId,
    )
    const roomsService = new MatrixRoomsService(matrixClient)
    const notificationService = new DefaultNotificationService(
      matrixClient,
      roomsService,
    )

    return notificationService.setDefaultEventRules(input)
  }
}
