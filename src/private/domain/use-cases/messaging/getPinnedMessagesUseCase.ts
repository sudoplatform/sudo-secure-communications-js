/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { DefaultLogger, Logger } from '@sudoplatform/sudo-common'
import { HandleId, Recipient } from '../../../../public'
import { MatrixMessagingService } from '../../../data/messaging/matrixMessagingService'
import { SessionManager } from '../../../data/session/sessionManager'
import { MessageEntity } from '../../entities/messaging/messageEntity'

/**
 * Input for `GetPinnedMessagesUseCase`.
 *
 * @interface GetPinnedMessagesUseCaseInput
 */
interface GetPinnedMessagesUseCaseInput {
  handleId: HandleId
  recipient: Recipient
}

/**
 * Application business logic for retrieving a list of pinned messages for a recipient.
 */
export class GetPinnedMessagesUseCase {
  private readonly log: Logger

  public constructor(private readonly sessionManager: SessionManager) {
    this.log = new DefaultLogger(this.constructor.name)
  }

  async execute(
    input: GetPinnedMessagesUseCaseInput,
  ): Promise<MessageEntity[]> {
    this.log.debug(this.constructor.name, {
      input,
    })
    return await this.getPinnedMessages(input)
  }

  async getPinnedMessages(
    input: GetPinnedMessagesUseCaseInput,
  ): Promise<MessageEntity[]> {
    const matrixClient = await this.sessionManager.getMatrixClient(
      input.handleId,
    )
    const matrixMessagingService = new MatrixMessagingService(matrixClient)
    return await matrixMessagingService.getPinnedMessages({
      recipient: input.recipient,
    })
  }
}
