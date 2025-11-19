/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { HandleId } from './handle'
import { ChannelId } from './recipient'

/**
 * The Sudo Platform SDK representation of a Channel Invitation Request. This represents an invitation
 * request sent to a channel.
 *
 * @interface ChannelInvitationRequest
 * @property {ChannelId} channelId The identifier of the channel the invitation request was sent to.
 * @property {HandleId} handleId The identifier of the handle that sent this invitation request.
 * @property {string} reason The reason for the invitation request, or undefined if not provided.
 * @property {Date} createdAt Date for when the invitation request was sent, or undefined if not available.
 */
export interface ChannelInvitationRequest {
  channelId: ChannelId
  handleId: HandleId
  reason?: string
  createdAt?: Date
}
