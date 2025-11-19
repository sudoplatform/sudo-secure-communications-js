/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { instance, mock, reset } from 'ts-mockito'
import { MatrixClientManager } from '../../../../../src/private/data/common/matrixClientManager'
import { MatrixSecurityService } from '../../../../../src/private/data/security/matrixSecurityService'
import { BackupState, HandleId } from '../../../../../src/public'

describe('MatrixSecurityService Test Suite', () => {
  const mockMatrixClientManager = mock<MatrixClientManager>()

  let instanceUnderTest: MatrixSecurityService

  beforeEach(() => {
    reset(mockMatrixClientManager)

    instanceUnderTest = new MatrixSecurityService(
      instance(mockMatrixClientManager),
    )
  })

  describe('isVerified', () => {
    it('Returns true if the current session is verified', async () => {
      jest
        .spyOn(MatrixSecurityService.prototype, 'isVerified')
        .mockResolvedValue(true)

      await expect(instanceUnderTest.isVerified()).resolves.toEqual(true)
    })

    it('Returns false if the current session is not verified', async () => {
      jest
        .spyOn(MatrixSecurityService.prototype, 'isVerified')
        .mockResolvedValue(false)

      await expect(instanceUnderTest.isVerified()).resolves.toEqual(false)
    })
  })

  describe('onSessionVerificationChanged', () => {
    it('Registers a handler for session verification changed events', () => {
      const handler = jest.fn()

      jest
        .spyOn(MatrixSecurityService.prototype, 'onSessionVerificationChanged')
        .mockImplementation(() => {})

      instanceUnderTest.onSessionVerificationChanged(handler)

      expect(
        MatrixSecurityService.prototype.onSessionVerificationChanged,
      ).toHaveBeenCalledWith(handler)
    })
  })

  describe('onVerificationRequestReceived', () => {
    it('Registers a handler for verification request received events', () => {
      const handler = jest.fn()

      jest
        .spyOn(MatrixSecurityService.prototype, 'onVerificationRequestReceived')
        .mockImplementation(() => {})

      instanceUnderTest.onVerificationRequestReceived(handler)

      expect(
        MatrixSecurityService.prototype.onVerificationRequestReceived,
      ).toHaveBeenCalledWith(handler)
    })
  })

  describe('acceptVerificationRequest', () => {
    it('Accepts a verification request successfully', async () => {
      const senderId = new HandleId('senderHandleId')
      const flowId = 'verificationFlowId'

      jest
        .spyOn(MatrixSecurityService.prototype, 'acceptVerificationRequest')
        .mockResolvedValue(undefined)

      await expect(
        instanceUnderTest.acceptVerificationRequest({
          senderId,
          flowId,
        }),
      ).resolves.not.toThrow()

      expect(
        MatrixSecurityService.prototype.acceptVerificationRequest,
      ).toHaveBeenCalledWith({ senderId, flowId })
    })
  })

  describe('approveVerification', () => {
    it('Approves a verification successfully', async () => {
      jest
        .spyOn(MatrixSecurityService.prototype, 'approveVerification')
        .mockResolvedValue(undefined)

      await expect(
        instanceUnderTest.approveVerification(),
      ).resolves.not.toThrow()

      expect(
        MatrixSecurityService.prototype.approveVerification,
      ).toHaveBeenCalled()
    })
  })

  describe('cancelVerification', () => {
    it('Cancels a verification successfully', async () => {
      jest
        .spyOn(MatrixSecurityService.prototype, 'cancelVerification')
        .mockResolvedValue(undefined)

      await expect(
        instanceUnderTest.cancelVerification(),
      ).resolves.not.toThrow()

      expect(
        MatrixSecurityService.prototype.cancelVerification,
      ).toHaveBeenCalled()
    })
  })

  describe('createBackup', () => {
    it('Creates a backup successfully', async () => {
      jest
        .spyOn(MatrixSecurityService.prototype, 'createBackup')
        .mockResolvedValue('backupId')

      await expect(instanceUnderTest.createBackup()).resolves.toEqual(
        'backupId',
      )

      expect(MatrixSecurityService.prototype.createBackup).toHaveBeenCalled()
    })
  })

  describe('declineVerification', () => {
    it('Declines a verification successfully', async () => {
      jest
        .spyOn(MatrixSecurityService.prototype, 'declineVerification')
        .mockResolvedValue(undefined)

      await expect(
        instanceUnderTest.declineVerification(),
      ).resolves.not.toThrow()

      expect(
        MatrixSecurityService.prototype.declineVerification,
      ).toHaveBeenCalled()
    })
  })

  describe('getBackupState', () => {
    it('Returns the backup state correctly', async () => {
      const backupState = BackupState.backupOnServer

      jest
        .spyOn(MatrixSecurityService.prototype, 'getBackupState')
        .mockResolvedValue(backupState)

      await expect(instanceUnderTest.getBackupState()).resolves.toEqual(
        backupState,
      )

      expect(MatrixSecurityService.prototype.getBackupState).toHaveBeenCalled()
    })
  })

  describe('recover', () => {
    it('Recovers a backup successfully', async () => {
      const backupKey = 'backupKey'

      jest
        .spyOn(MatrixSecurityService.prototype, 'recover')
        .mockResolvedValue(undefined)

      await expect(
        instanceUnderTest.recover({
          backupKey,
        }),
      ).resolves.not.toThrow()

      expect(MatrixSecurityService.prototype.recover).toHaveBeenCalledWith({
        backupKey,
      })
    })
  })

  describe('requestVerification', () => {
    it('Requests a verification successfully', async () => {
      jest
        .spyOn(MatrixSecurityService.prototype, 'requestVerification')
        .mockResolvedValue(undefined)

      await expect(
        instanceUnderTest.requestVerification(),
      ).resolves.not.toThrow()

      expect(
        MatrixSecurityService.prototype.requestVerification,
      ).toHaveBeenCalled()
    })
  })

  describe('resetBackupKey', () => {
    it('Resets a backup key successfully', async () => {
      jest
        .spyOn(MatrixSecurityService.prototype, 'resetBackupKey')
        .mockResolvedValue('backupId')

      await expect(instanceUnderTest.resetBackupKey()).resolves.toEqual(
        'backupId',
      )

      expect(MatrixSecurityService.prototype.resetBackupKey).toHaveBeenCalled()
    })
  })

  describe('rotateBackupKey', () => {
    it('Rotates a backup key successfully', async () => {
      jest
        .spyOn(MatrixSecurityService.prototype, 'rotateBackupKey')
        .mockResolvedValue('backupKey')

      await expect(instanceUnderTest.rotateBackupKey()).resolves.toEqual(
        'backupKey',
      )

      expect(MatrixSecurityService.prototype.rotateBackupKey).toHaveBeenCalled()
    })
  })

  describe('startVerification', () => {
    it('Starts a verification successfully', async () => {
      jest
        .spyOn(MatrixSecurityService.prototype, 'startVerification')
        .mockResolvedValue(undefined)

      await expect(instanceUnderTest.startVerification()).resolves.not.toThrow()

      expect(
        MatrixSecurityService.prototype.startVerification,
      ).toHaveBeenCalled()
    })
  })
})
