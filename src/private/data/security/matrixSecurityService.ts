/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { VerificationRequest } from 'matrix-js-sdk/lib/crypto-api'
import { BackupState, SecureCommsError } from '../../../public'
import {
  AcceptVerificationRequestInput,
  RecoverInput,
  SecurityService,
} from '../../domain/entities/security/securityService'
import { MatrixClientManager } from '../common/matrixClientManager'

export class MatrixSecurityService implements SecurityService {
  constructor(private readonly matrixClient: MatrixClientManager) {}

  async isVerified(): Promise<boolean> {
    return await this.matrixClient.isVerified()
  }

  onSessionVerificationChanged(handler: (state: boolean) => void): void {
    this.matrixClient.onSessionVerificationChanged(handler)
  }

  // MARK: Backup & Restore

  async getBackupState(): Promise<BackupState> {
    const hasBackup = await this.matrixClient.hasKeyBackup()
    return hasBackup ? BackupState.backupOnServer : BackupState.noBackup
  }

  async createBackup(): Promise<string> {
    if ((await this.getBackupState()) === BackupState.backupOnServer) {
      throw new SecureCommsError('Backup already exists')
    }
    const backupKey = await this.matrixClient.createKeyBackup()
    if (!backupKey) {
      throw new SecureCommsError('Failed to create key backup')
    }
    if (!backupKey.encodedPrivateKey) {
      throw new SecureCommsError('Failed to get encoded private key')
    }
    return backupKey.encodedPrivateKey
  }

  async recover(input: RecoverInput): Promise<void> {
    if ((await this.getBackupState()) === BackupState.noBackup) {
      throw new SecureCommsError('No backup found on server')
    }
    await this.matrixClient.recoverFromBackup(input.backupKey)
  }

  async rotateBackupKey(): Promise<string> {
    if ((await this.getBackupState()) === BackupState.noBackup) {
      throw new SecureCommsError('No backup found on server')
    }
    const backupKey = await this.matrixClient.rotateKeyBackup()
    if (!backupKey) {
      throw new SecureCommsError('Failed to rotate key backup')
    }
    if (!backupKey.encodedPrivateKey) {
      throw new SecureCommsError('Failed to get encoded private key')
    }
    return backupKey.encodedPrivateKey
  }

  async resetBackupKey(): Promise<string> {
    const backupKey = await this.matrixClient.resetKeyBackup()
    if (!backupKey) {
      throw new SecureCommsError('Failed to create key backup')
    }
    if (!backupKey.encodedPrivateKey) {
      throw new SecureCommsError('Failed to get encoded private key')
    }
    return backupKey.encodedPrivateKey
  }

  // MARK: Verification

  onVerificationRequestReceived(
    handler: (verificationRequest: VerificationRequest) => void,
  ): void {
    this.matrixClient.onVerificationRequestReceived(handler)
  }

  async requestVerification(): Promise<void> {
    await this.matrixClient.requestVerification(
      await this.matrixClient.getUserId(),
    )
  }

  async acceptVerificationRequest(
    input: AcceptVerificationRequestInput,
  ): Promise<void> {
    await this.matrixClient.acceptVerificationRequest(
      input.senderId.toString(),
      input.flowId,
    )
  }

  async startVerification(): Promise<void> {
    await this.matrixClient.startVerification(
      await this.matrixClient.getUserId(),
    )
  }

  async approveVerification(): Promise<void> {
    await this.matrixClient.approveVerification(
      await this.matrixClient.getUserId(),
    )
  }

  async declineVerification(): Promise<void> {
    await this.matrixClient.declineVerification(
      await this.matrixClient.getUserId(),
    )
  }

  async cancelVerification(): Promise<void> {
    await this.matrixClient.cancelVerification(
      await this.matrixClient.getUserId(),
    )
  }
}
