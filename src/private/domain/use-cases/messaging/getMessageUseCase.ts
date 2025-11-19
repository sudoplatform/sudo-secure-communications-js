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
 * Input for `GetMessageUseCase`.
 *
 * @interface GetMessageUseCaseInput
 */
interface GetMessageUseCaseInput {
  handleId: HandleId
  recipient: Recipient
  messageId: string
}

/**
 * Application business logic for retrieving a message for a recipient.
 */
export class GetMessageUseCase {
  private readonly log: Logger

  public constructor(private readonly sessionManager: SessionManager) {
    this.log = new DefaultLogger(this.constructor.name)
  }

  async execute(
    input: GetMessageUseCaseInput,
  ): Promise<MessageEntity | undefined> {
    this.log.debug(this.constructor.name, {
      input,
    })
    return await this.getMessage(input)
  }

  private async getMessage(
    input: GetMessageUseCaseInput,
  ): Promise<MessageEntity | undefined> {
    const matrixClient = await this.sessionManager.getMatrixClient(
      input.handleId,
    )
    const matrixMessagingService = new MatrixMessagingService(matrixClient)
    return await matrixMessagingService.get({
      recipient: input.recipient,
      messageId: input.messageId,
    })
  }
}
