/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { OwnerEntity } from '../common/ownerEntity'

/**
 * Core entity representation of a Secure Comms session business rule.
 *
 * @interface SecureCommsSessionEntity
 * @property {string} handleId Identifier associated with the Secure Comms handle.
 * @property {string} handleName Name associated with the Secure Comms handle.
 * @property {string} deviceId Identifier associated with the device that initiated the session.
 * @property {string} owner Identifier of the user that owns the Secure Comms user.
 * @property {OwnerEntity[]} owners List of identifers of auxiliary owners for the Secure Comms user.
 * @property {string} token Authentication token required to sign into Secure Comms server.
 * @property {Date} createdAt Date for when the session was created.
 * @property {Date} expiresAt Date for when the session will expire.
 */
export interface SecureCommsSessionEntity {
  handleId: string
  handleName: string
  deviceId: string
  owner: string
  owners: OwnerEntity[]
  token: string
  createdAt: Date
  expiresAt: Date
}
