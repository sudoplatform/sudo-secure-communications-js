/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { DefaultLogger, Logger } from '@sudoplatform/sudo-common'
import { ChannelId, HandleId } from '../../../../public'
import { ChannelsService } from '../../entities/channels/channelsService'

/**
 * Input for `DeleteChannelUseCase`.
 *
 * @interface DeleteChannelUseCaseInput
 */
interface DeleteChannelUseCaseInput {
  handleId: HandleId
  channelId: ChannelId
}

/**
 * Application business logic for deleting a channel.
 */
export class DeleteChannelUseCase {
  private readonly log: Logger

  public constructor(private readonly channelsService: ChannelsService) {
    this.log = new DefaultLogger(this.constructor.name)
  }

  async execute(input: DeleteChannelUseCaseInput): Promise<void> {
    this.log.debug(this.constructor.name, {
      input,
    })
    await this.channelsService.delete({
      selfHandleId: input.handleId.toString(),
      channelId: input.channelId.toString(),
    })
  }
}
