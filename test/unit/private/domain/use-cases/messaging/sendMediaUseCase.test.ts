/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  anything,
  capture,
  instance,
  mock,
  reset,
  verify,
  when,
} from 'ts-mockito'
import { MediaCredentialManager } from '../../../../../../src/private/data/media/mediaCredentialManager'
import { MatrixMessagingService } from '../../../../../../src/private/data/messaging/matrixMessagingService'
import { SessionManager } from '../../../../../../src/private/data/session/sessionManager'
import { SendMediaUseCase } from '../../../../../../src/private/domain/use-cases/messaging/sendMediaUseCase'
import { HandleId } from '../../../../../../src/public'
import { EntityDataFactory } from '../../../../../data-factory/entity'

jest.mock('../../../../../../src/private/data/messaging/matrixMessagingService')

describe('SendMediaUseCase Test Suite', () => {
  const mockSessionManager = mock<SessionManager>()
  const mockMediaCredentialManager = mock<MediaCredentialManager>()

  let instanceUnderTest: SendMediaUseCase

  beforeEach(() => {
    reset(mockSessionManager)

    instanceUnderTest = new SendMediaUseCase(
      instance(mockSessionManager),
      instance(mockMediaCredentialManager),
    )
  })

  describe('execute', () => {
    it('Sends a media successfully', async () => {
      const handleId = new HandleId('handleId')
      const recipient = new HandleId('testRecipientHandleId')
      const mediaCredential = EntityDataFactory.mediaCredential
      when(
        mockMediaCredentialManager.getRoomMediaCredential(
          anything(),
          anything(),
          anything(),
        ),
      ).thenResolve(mediaCredential)
      const mockMatrixMessagingService = {
        sendMedia: jest.fn().mockResolvedValue(undefined),
      }
      ;(MatrixMessagingService as unknown as jest.Mock).mockReturnValue(
        mockMatrixMessagingService,
      )

      await expect(
        instanceUnderTest.execute({
          handleId,
          recipient,
          file: new ArrayBuffer(10),
          fileName: 'testFileName.jpg',
          fileType: 'image/jpeg',
          fileSize: 10,
        }),
      ).resolves.not.toThrow()

      const [handleIdArg, forWriteArg, roomIdArg] = capture(
        mockMediaCredentialManager.getRoomMediaCredential,
      ).first()
      expect(handleIdArg).toStrictEqual<typeof handleIdArg>(handleId)
      expect(forWriteArg).toStrictEqual<typeof forWriteArg>(true)
      expect(roomIdArg).toStrictEqual<typeof roomIdArg>(recipient.toString())
      verify(
        mockMediaCredentialManager.getRoomMediaCredential(
          anything(),
          anything(),
          anything(),
        ),
      ).once()
      expect(mockMatrixMessagingService.sendMedia).toHaveBeenCalledWith({
        recipient,
        file: new ArrayBuffer(10),
        fileName: 'testFileName.jpg',
        fileType: 'image/jpeg',
        fileSize: 10,
        mediaCredential,
      })
    })
  })
})
