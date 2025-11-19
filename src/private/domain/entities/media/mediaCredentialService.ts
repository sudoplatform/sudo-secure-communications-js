/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { RoomMediaCredentialEntity } from './mediaCredentialEntity'

/**
 * Input for `MediaCredentialService.get` method.
 *
 * @interface GetMediaCredentialInput
 * @property {string} handleId The identifier of the handle to get the token for.
 * @property {boolean} forWrite Flag determining whether to write to the S3 bucket.
 * @property {string} roomId The identifier of the room to get the token for.
 */
export interface GetMediaCredentialInput {
  handleId: string
  forWrite: boolean
  roomId: string
}

/**
 * Core entity representation of a media credential service used in business logic to
 * retrieve media credentials for a handle and room.
 *
 * @interface MediaCredentialService
 */
export interface MediaCredentialService {
  /**
   * Retrieve the AWS S3 media credential for a handle and room.
   *
   * @param {GetMediaCredentialInput} input Parameters used to retrieve a media credential.
   * @returns {RoomMediaCredentialEntity} The media credential for the handle.
   */
  get(input: GetMediaCredentialInput): Promise<RoomMediaCredentialEntity>
}
