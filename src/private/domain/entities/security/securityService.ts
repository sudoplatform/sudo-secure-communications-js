/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { VerificationRequest } from 'matrix-js-sdk/lib/crypto-api'
import { HandleId } from '../../../..'
import { BackupState } from '../../../../public'

/**
 * Input for `SecurityService.recover` method.
 *
 * @interface RecoverInput
 * @property {string} backupKey The backup key.
 */
export interface RecoverInput {
  backupKey: string
}

/**
 * Input for `SecurityService.acceptVerificationRequest` method.
 *
 * @interface AcceptVerificationRequestInput
 * @property {HandleId} senderId The handle ID of the sender.
 * @property {string} flowId The verification flow ID.
 */
export interface AcceptVerificationRequestInput {
  senderId: HandleId
  flowId: string
}

export interface SecurityService {
  /**
   * Get the verification state.
   *
   * @returns {Promise<boolean>} The verification state.
   */
  isVerified(): Promise<boolean>

  /**
   * Register a handler for session verification changed events.
   *
   * @param {Function} handler - The handler to be called when a session verification changes.
   */
  onSessionVerificationChanged(handler: (state: boolean) => void): void

  /**
   * Get the recovery key backup state.
   *
   * @returns {Promise<BackupState>} The backup state.
   */
  getBackupState(): Promise<BackupState>

  /**
   * Create a recovery key backup.
   *
   * @returns {Promise<string>} The backup key.
   */
  createBackup(): Promise<string>

  /**
   * Recover the recovery key backup.
   *
   * @param {RecoverInput} input Parameters used to recover the recovery key backup.
   */
  recover(input: RecoverInput): Promise<void>

  /**
   * Rotate the recovery key.
   *
   * @returns {Promise<string>} The backup key.
   */
  rotateBackupKey(): Promise<string>

  /**
   * Reset the recovery key backup key.
   *
   * @returns {Promise<string>} The backup key.
   */
  resetBackupKey(): Promise<string>

  /**
   * Register a handler for verification request received events.
   *
   * @param {Function} handler - The handler to be called when a verification request is received.
   */
  onVerificationRequestReceived(
    handler: (verificationRequest: VerificationRequest) => void,
  ): void

  /**
   * Request verification.
   */
  requestVerification(): Promise<void>

  /**
   * Accept a verification request.
   *
   * @param {AcceptVerificationRequestInput} input Parameters used to accept a verification request.
   */
  acceptVerificationRequest(
    input: AcceptVerificationRequestInput,
  ): Promise<void>

  /**
   * Start verification.
   */
  startVerification(): Promise<void>

  /**
   * Approve verification.
   */
  approveVerification(): Promise<void>

  /**
   * Decline verification.
   */
  declineVerification(): Promise<void>

  /**
   * Cancel verification.
   */
  cancelVerification(): Promise<void>
}
