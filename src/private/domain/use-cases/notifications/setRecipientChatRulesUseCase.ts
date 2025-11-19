/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { DefaultLogger, Logger } from '@sudoplatform/sudo-common'
import { ChatNotificationRules, HandleId, Recipient } from '../../../../public'
import { DefaultNotificationService } from '../../../data/notification/defaultNotificationService'
import { MatrixRoomsService } from '../../../data/rooms/matrixRoomsService'
import { SessionManager } from '../../../data/session/sessionManager'

/**
 * Input for `SetRecipientChatRulesUseCase`.
 *
 * @interface SetRecipientChatRulesUseCaseInput
 */
interface SetRecipientChatRulesUseCaseInput {
  handleId: HandleId
  recipient: Recipient
  chatRules: ChatNotificationRules
}

/**
 * Use case for setting override chat rules.
 */
export class SetRecipientChatRulesUseCase {
  private readonly log: Logger

  constructor(private readonly sessionManager: SessionManager) {
    this.log = new DefaultLogger(this.constructor.name)
  }

  async execute(input: SetRecipientChatRulesUseCaseInput): Promise<void> {
    this.log.debug(this.constructor.name, { input })

    const matrixClient = await this.sessionManager.getMatrixClient(
      input.handleId,
    )
    const roomsService = new MatrixRoomsService(matrixClient)
    const notificationService = new DefaultNotificationService(
      matrixClient,
      roomsService,
    )

    return notificationService.setRecipientChatRules(input)
  }
}
