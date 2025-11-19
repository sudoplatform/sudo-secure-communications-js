/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { DefaultLogger, Logger } from '@sudoplatform/sudo-common'
import { ChatNotificationRules, HandleId } from '../../../../public'
import { DefaultNotificationService } from '../../../data/notification/defaultNotificationService'
import { MatrixRoomsService } from '../../../data/rooms/matrixRoomsService'
import { SessionManager } from '../../../data/session/sessionManager'

/**
 * Input for `SetDefaultChatRulesUseCase`.
 *
 * @interface SetDefaultChatRulesUseCaseInput
 */
interface SetDefaultChatRulesUseCaseInput {
  handleId: HandleId
  chatRules: ChatNotificationRules
}

/**
 * Use case for setting default chat rules.
 */
export class SetDefaultChatRulesUseCase {
  private readonly log: Logger

  constructor(private readonly sessionManager: SessionManager) {
    this.log = new DefaultLogger(this.constructor.name)
  }

  async execute(input: SetDefaultChatRulesUseCaseInput): Promise<void> {
    this.log.debug(this.constructor.name, { input })

    const matrixClient = await this.sessionManager.getMatrixClient(
      input.handleId,
    )
    const roomsService = new MatrixRoomsService(matrixClient)
    const notificationService = new DefaultNotificationService(
      matrixClient,
      roomsService,
    )

    return notificationService.setDefaultChatRules(input)
  }
}
