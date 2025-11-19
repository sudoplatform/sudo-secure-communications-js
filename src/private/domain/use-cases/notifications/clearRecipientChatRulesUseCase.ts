/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { DefaultLogger, Logger } from '@sudoplatform/sudo-common'
import { HandleId, Recipient } from '../../../../public'
import { DefaultNotificationService } from '../../../data/notification/defaultNotificationService'
import { MatrixRoomsService } from '../../../data/rooms/matrixRoomsService'
import { SessionManager } from '../../../data/session/sessionManager'

/**
 * Input for `ClearRecipientChatRulesUseCase`.
 *
 * @interface ClearRecipientChatRulesUseCaseInput
 */
interface ClearRecipientChatRulesUseCaseInput {
  handleId: HandleId
  recipient: Recipient
}

/**
 * Use case for clearing recipient chat rules.
 */
export class ClearRecipientChatRulesUseCase {
  private readonly log: Logger

  constructor(private readonly sessionManager: SessionManager) {
    this.log = new DefaultLogger(this.constructor.name)
  }

  async execute(input: ClearRecipientChatRulesUseCaseInput): Promise<void> {
    this.log.debug(this.constructor.name, { input })

    const matrixClient = await this.sessionManager.getMatrixClient(
      input.handleId,
    )
    const roomsService = new MatrixRoomsService(matrixClient)
    const notificationService = new DefaultNotificationService(
      matrixClient,
      roomsService,
    )

    return notificationService.clearRecipientChatRules({
      recipient: input.recipient,
    })
  }
}
