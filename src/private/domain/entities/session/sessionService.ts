/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { SecureCommsSessionEntity } from './secureCommsSessionEntity'

/**
 * Input for `SessionService.create` method.
 *
 * @interface CreateSessionInput
 * @property {string} id Optional handle ID.
 * @property {string} name Name of the Secure Comms handle.
 * @property {string} deviceId Identifier of the device that initiated this session.
 */
export interface CreateSessionInput {
  id?: string
  name: string
  deviceId: string
}

/**
 * Input for `SessionService.get` method.
 *
 * @interface GetSessionInput
 * @property {string} handleId Identifier of the Secure Comms handle.
 * @property {string} deviceId Identifier of the device that initiated this session.
 */
export interface GetSessionInput {
  handleId: string
  deviceId: string
}

/**
 * Core entity representation of a session service used in business logic. Used to perform CRUD operations for sessions.
 *
 * @interface SessionService
 */
export interface SessionService {
  /**
   * Create a session.
   *
   * @param {CreateSessionInput} input Parameters used to create a session.
   * @returns {SecureCommsSessionEntity} The session that was created.
   */
  create(input: CreateSessionInput): Promise<SecureCommsSessionEntity>

  /**
   * Retrieve a session.
   *
   * @param {GetSessionInput} input Parameters used to retrieve session information.
   * @returns {SecureCommsSessionEntity} The retrieved session.
   */
  get(input: GetSessionInput): Promise<SecureCommsSessionEntity>
}
