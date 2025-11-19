/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { DefaultLogger, Logger } from '@sudoplatform/sudo-common'
import { VerificationRequest } from 'matrix-js-sdk/lib/crypto-api'
import { SessionManager } from '../../private/data/session/sessionManager'
import { AcceptVerificationUseCase } from '../../private/domain/use-cases/security/acceptVerificationUseCase'
import { ApproveVerificationUseCase } from '../../private/domain/use-cases/security/approveVerificationUseCase'
import { CancelVerificationUseCase } from '../../private/domain/use-cases/security/cancelVerificationUseCase'
import { CreateBackupUseCase } from '../../private/domain/use-cases/security/createBackupUseCase'
import { DeclineVerificationUseCase } from '../../private/domain/use-cases/security/declineVerificationUseCase'
import { GetBackupStateUseCase } from '../../private/domain/use-cases/security/getBackupStateUseCase'
import { IsVerifiedUseCase } from '../../private/domain/use-cases/security/isVerifiedUseCase'
import { OnSessionVerificationChangedUseCase } from '../../private/domain/use-cases/security/onSessionVerificationChangedUseCase'
import { OnVerificationRequestReceivedUseCase } from '../../private/domain/use-cases/security/onVerificationRequestReceivedUseCase'
import { RecoverUseCase } from '../../private/domain/use-cases/security/recoverUseCase'
import { RequestVerificationUseCase } from '../../private/domain/use-cases/security/requestVerificationUseCase'
import { ResetBackupKeyUseCase } from '../../private/domain/use-cases/security/resetBackupKeyUseCase'
import { RotateBackupKeyUseCase } from '../../private/domain/use-cases/security/rotateBackupKeyUseCase'
import { StartVerificationUseCase } from '../../private/domain/use-cases/security/startVerificationUseCase'
import { HandleId } from '../typings'

/**
 * The state of the encrypted server backup of client keys.
 *
 * @property noBackup there is no backup currently stored on the server
 * @property backupOnServer there is a backup stored on the server
 */

export enum BackupState {
  noBackup,
  backupOnServer,
}

/**
 * Input for `SecurityModule.isVerified` method.
 *
 * @interface IsVerifiedInput
 * @property {HandleId} handleId the handle ID owned by this client
 */
export interface IsVerifiedInput {
  handleId: HandleId
}

/**
 * Input for `SecurityModule.onSessionVerificationChanged` method.
 *
 * @interface OnSessionVerificationChangedInput
 * @property {HandleId} handleId the handle ID owned by this client
 * @property {function} handler the handler to call when the session verification status changes
 */
export interface OnSessionVerificationChangedInput {
  handleId: HandleId
  handler: (status: boolean) => void
}

/**
 * Input for `SecurityModule.getBackupState` method.
 *
 * @interface GetBackupStateInput
 * @property {HandleId} handleId the handle ID owned by this client
 */
export interface GetBackupStateInput {
  handleId: HandleId
}

/**
 * Input for `SecurityModule.createBackup` method.
 *
 * @interface CreateBackupInput
 * @property {HandleId} handleId the handle ID owned by this client
 */
export interface CreateBackupInput {
  handleId: HandleId
}

/**
 * Input for `SecurityModule.recover` method.
 *
 * @interface RecoverInput
 * @property {HandleId} handleId the handle ID owned by this client
 * @property {string} backupKey the backup key to decrypt the server backup
 */
export interface RecoverInput {
  handleId: HandleId
  backupKey: string
}

/**
 * Input for `SecurityModule.rotateBackupKey` method.
 *
 * @interface RotateBackupKeyInput
 * @property {HandleId} handleId the handle ID owned by this client
 */
export interface RotateBackupKeyInput {
  handleId: HandleId
}

/**
 * Input for `SecurityModule.resetBackup` method.
 *
 * @interface ResetBackupInput
 * @property {HandleId} handleId the handle ID owned by this client
 */
export interface ResetBackupKeyInput {
  handleId: HandleId
}

/**
 * Input for `SecurityModule.onVerificationRequestReceived` method.
 *
 * @interface OnVerificationRequestReceivedInput
 * @property {HandleId} handleId the handle ID owned by this client
 * @property {function} handler the handler to call when a verification request is received
 */
export interface OnVerificationRequestReceivedInput {
  handleId: HandleId
  handler: (verificationRequest: VerificationRequest) => void
}

/**
 * Input for `SecurityModule.requestVerification` method.
 *
 * @interface RequestVerificationInput
 * @property {HandleId} handleId the handle ID owned by this client
 */
export interface RequestVerificationInput {
  handleId: HandleId
}

/**
 * Input for `SecurityModule.acceptVerificationRequest` method.
 *
 * @interface AcceptVerificationRequestInput
 * @property {HandleId} handleId the handle ID owned by this client
 * @property {HandleId} senderId the handle ID of the sender
 * @property {string} flowId the flow ID of the verification request
 */
export interface AcceptVerificationRequestInput {
  handleId: HandleId
  senderId: HandleId
  flowId: string
}

/**
 * Input for `SecurityModule.startSasVerification` method.
 *
 * @interface StartSasVerificationInput
 * @property {HandleId} handleId the handle ID owned by this client
 */
export interface StartVerificationInput {
  handleId: HandleId
}

/**
 * Input for `SecurityModule.approveVerification` method.
 *
 * @interface ApproveVerificationInput
 * @property {HandleId} handleId the handle ID owned by this client
 */
export interface ApproveVerificationInput {
  handleId: HandleId
}

/**
 * Input for `SecurityModule.declineVerification` method.
 *
 * @interface DeclineVerificationInput
 * @property {HandleId} handleId the handle ID owned by this client
 */
export interface DeclineVerificationInput {
  handleId: HandleId
}

/**
 * Input for `SecurityModule.cancelVerification` method.
 *
 * @interface CancelVerificationInput
 * @property {HandleId} handleId the handle ID owned by this client
 */
export interface CancelVerificationInput {
  handleId: HandleId
}

/**
 * Key backup, restore and interactive device verification services.
 *
 * In the secure communications offering, each device stores their own keys.
 * To seamlessly continue conversations across multiple devices,
 * the keys must be replicated across those devices.
 * Verified devices automatically remain in sync with each others keys, so it's
 * important to design apps that encourage users to keep their devices verified.
 *
 * Client can verify devices with two mechanisms:
 *
 * 1) Key backup and restore. In this method, client keys are encrypted with a
 *  "backup key" and uploaded to the server. The keys can later be "recovered"
 *  on other devices using the same backup key. This backup gives the device
 *  access to other previous session keys.
 *
 * 2) Interactive verification. In this method, two devices can verify their keys
 *  out of band using emoji matching. In the case tha verification is happening between
 *  the same handle of two different devices, the unverified device becomes verified
 *  and will then gain access to session keys from their other devices.
 */
export interface SecurityModule {
  /**
   * Convenience method to check if the current session is verified.
   *
   * @param {IsVerifiedInput} input the input for the isVerified method
   * @return {Promise<boolean>} true if the current session is verified, false otherwise
   */
  isVerified(input: IsVerifiedInput): Promise<boolean>

  /**
   * Get notified when the state of the session verification changes.
   *
   * @param {OnSessionVerificationChangedInput} input the input for the onSessionVerificationChanged method
   */
  onSessionVerificationChanged(input: OnSessionVerificationChangedInput): void

  // MARK: Backup & Restore

  /**
   * Get the current state of the encrypted server backup.
   *
   * @param {GetBackupStateInput} input the input for the get backup state method
   * @return {Promise<BackupState>} the current backup state
   */
  getBackupState(input: GetBackupStateInput): Promise<BackupState>

  /**
   * Create a server-side, encrypted backup of client keys for the user.
   * After creation, keys are automatically uploaded to the backup so this
   * only has to be called once.
   *
   * @param {CreateBackupInput} input the input for the create backup method
   * @return {Promise<string>} a backup key, to be used with the [recover] method to recover keys from the server backup.
   */
  createBackup(input: CreateBackupInput): Promise<string>

  /**
   * Recover client keys from a server-side backup.
   *
   * @param {RecoverInput} input the input for the recover method
   */
  recover(input: RecoverInput): Promise<void>

  /**
   * Rotate backup keys. The previous backup key is invalidated and replaced with a new one.
   * Only verified sessions can execute this command.
   *
   * @param {RotateBackupKeyInput} input the input for the rotate backup key method
   * @return {string} a new backup key, to be used with the [recover] method to recover
   *  keys from the server backup.
   */
  rotateBackupKey(input: RotateBackupKeyInput): Promise<string>

  /**
   * Resets the backup. This replaces the server side backup with current keys known to
   * this device. This will result in data loss of previous messages encrypted with keys
   * from the previous backup not known to this device. All other devices associated
   * with this user will become unverified.
   *
   * @param {ResetBackupKeyInput} input the input for the reset backup method
   * @return {string} a new backup key, to be used with the [recover] method to recover
   *  keys from the server backup.
   */
  resetBackupKey(input: ResetBackupKeyInput): Promise<string>

  // MARK: Verification

  /**
   * Register a callback to be notified when a verification request is received.
   *
   * @param {OnVerificationRequestReceivedInput} input the input for the on verification request received method
   */
  onVerificationRequestReceived(input: OnVerificationRequestReceivedInput): void

  /**
   * Begin an interactive verification flow by requesting verification to
   * another verified, online device.
   *
   * @param {RequestVerificationInput} input the input for the request verification method
   */
  requestVerification(input: RequestVerificationInput): Promise<void>

  /**
   * Accept a verification request from another device.
   *
   * @param {AcceptVerificationRequestInput} input the input for the accept verification request method
   */
  acceptVerificationRequest(
    input: AcceptVerificationRequestInput,
  ): Promise<void>

  /**
   * Start interactive verification. This can only occur after the other device
   * has accepted the verification request. Either device can start the verification.
   *
   * @param {StartVerificationInput} input the input for the start verification method
   */
  startVerification(input: StartVerificationInput): Promise<void>

  /**
   * Cancel the current verification at any time.
   *
   * @param {CancelVerificationInput} input the input for the cancel verification method
   */
  cancelVerification(input: CancelVerificationInput): Promise<void>

  /**
   * Approve a verification request. Users must check the contents of the [InteractiveVerificationState.ReceivedVerificationData]
   * to ensure the emojis match before approving.
   *
   * @param {ApproveVerificationInput} input the input for the approve verification method
   */
  approveVerification(input: ApproveVerificationInput): Promise<void>

  /**
   * Decline a verification request.
   *
   * @param {DeclineVerificationInput} input the input for the decline verification method
   */
  declineVerification(input: DeclineVerificationInput): Promise<void>
}

export class DefaultSecurityModule implements SecurityModule {
  private readonly log: Logger

  constructor(private readonly sessionManager: SessionManager) {
    this.log = new DefaultLogger(this.constructor.name)
  }

  public async isVerified(input: IsVerifiedInput): Promise<boolean> {
    this.log.debug(this.isVerified.name, { input })

    const useCase = new IsVerifiedUseCase(this.sessionManager)
    return useCase.execute(input)
  }

  public async onSessionVerificationChanged(
    input: OnSessionVerificationChangedInput,
  ): Promise<void> {
    this.log.debug(this.onSessionVerificationChanged.name, { input })

    const useCase = new OnSessionVerificationChangedUseCase(this.sessionManager)

    await useCase.execute(input)
  }

  // MARK: Backup & Restore

  public async getBackupState(
    input: GetBackupStateInput,
  ): Promise<BackupState> {
    this.log.debug(this.getBackupState.name, { input })

    const useCase = new GetBackupStateUseCase(this.sessionManager)
    return useCase.execute(input)
  }

  public async createBackup(input: CreateBackupInput): Promise<string> {
    this.log.debug(this.createBackup.name, { input })

    const useCase = new CreateBackupUseCase(this.sessionManager)
    return useCase.execute(input)
  }

  public async recover(input: RecoverInput): Promise<void> {
    this.log.debug(this.recover.name, { input })

    const useCase = new RecoverUseCase(this.sessionManager)
    await useCase.execute(input)
  }

  public async rotateBackupKey(input: RotateBackupKeyInput): Promise<string> {
    this.log.debug(this.rotateBackupKey.name, { input })

    const useCase = new RotateBackupKeyUseCase(this.sessionManager)
    return useCase.execute(input)
  }

  public async resetBackupKey(input: ResetBackupKeyInput): Promise<string> {
    this.log.debug(this.resetBackupKey.name, { input })

    const useCase = new ResetBackupKeyUseCase(this.sessionManager)
    return useCase.execute(input)
  }

  // MARK: Verification

  public async onVerificationRequestReceived(
    input: OnVerificationRequestReceivedInput,
  ): Promise<void> {
    this.log.debug(this.onVerificationRequestReceived.name, { input })

    const useCase = new OnVerificationRequestReceivedUseCase(
      this.sessionManager,
    )
    await useCase.execute(input)
  }

  public async requestVerification(
    input: RequestVerificationInput,
  ): Promise<void> {
    this.log.debug(this.requestVerification.name, { input })

    const useCase = new RequestVerificationUseCase(this.sessionManager)
    await useCase.execute(input)
  }

  public async acceptVerificationRequest(
    input: AcceptVerificationRequestInput,
  ): Promise<void> {
    this.log.debug(this.acceptVerificationRequest.name, { input })

    const useCase = new AcceptVerificationUseCase(this.sessionManager)
    await useCase.execute(input)
  }

  public async startVerification(input: StartVerificationInput): Promise<void> {
    this.log.debug(this.startVerification.name, { input })

    const useCase = new StartVerificationUseCase(this.sessionManager)
    await useCase.execute(input)
  }

  public async approveVerification(
    input: ApproveVerificationInput,
  ): Promise<void> {
    this.log.debug(this.approveVerification.name, { input })

    const useCase = new ApproveVerificationUseCase(this.sessionManager)
    await useCase.execute(input)
  }

  public async declineVerification(
    input: DeclineVerificationInput,
  ): Promise<void> {
    this.log.debug(this.declineVerification.name, { input })

    const useCase = new DeclineVerificationUseCase(this.sessionManager)
    await useCase.execute(input)
  }

  public async cancelVerification(
    input: CancelVerificationInput,
  ): Promise<void> {
    this.log.debug(this.cancelVerification.name, { input })

    const useCase = new CancelVerificationUseCase(this.sessionManager)
    await useCase.execute(input)
  }
}
