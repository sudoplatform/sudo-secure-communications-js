/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { Owner } from '@sudoplatform/sudo-common'

/**
 * The Sudo Platform SDK representation of a Secure Comms Session.
 * 
 * @interface SecureCommsSession
 * @property {string} handleId Identifier associated with the Secure Comms handle.
 * @property {string} handleName Name associated with the Secure Comms handle.
 * @property {string} deviceId Identifier associated with the device that initiated the session.
 * @property {string} owner Identifier of the user that owns the Secure Comms user.
 * @property {Owner[]} owners List of identifiers of auxiliary owners for the Secure Comms user.
 * @property {string} token Authentication token required to sign into Secure Comms server.
 * @property {Date} createdAt Date for when the session was created.
 * @property {Date} expiresAt Date for when the session will expire.
 */
export interface SecureCommsSession {
  handleId: string,
  handleName: string,
  deviceId: string,
  owner: string,
  owners: Owner[]
  token: string,
  createdAt: Date
  expiresAt: Date
}
