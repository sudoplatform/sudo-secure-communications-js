/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { DefaultLogger, Logger } from '@sudoplatform/sudo-common'
import { HandleId, NotificationInfo } from '../../../../public'
import { DefaultNotificationService } from '../../../data/notification/defaultNotificationService'
import { MatrixRoomsService } from '../../../data/rooms/matrixRoomsService'
import { SessionManager } from '../../../data/session/sessionManager'

/**
 * Input for `GetDecodedInfoUseCase`.
 *
 * @interface GetDecodedInfoUseCaseInput
 */
interface GetDecodedInfoUseCaseInput {
  handleId: HandleId
  eventId: string
  roomId: string
}

/**
 * Use case for decoding a notification content.
 */
export class GetDecodedInfoUseCase {
  private readonly log: Logger

  constructor(private readonly sessionManager: SessionManager) {
    this.log = new DefaultLogger(this.constructor.name)
  }

  async execute(input: GetDecodedInfoUseCaseInput): Promise<NotificationInfo> {
    this.log.debug(this.constructor.name, { input })

    const matrixClient = await this.sessionManager.getMatrixClient(
      input.handleId,
    )
    const roomsService = new MatrixRoomsService(matrixClient)
    const notificationService = new DefaultNotificationService(
      matrixClient,
      roomsService,
    )

    return await notificationService.getDecodedInfo(input)
  }
}
