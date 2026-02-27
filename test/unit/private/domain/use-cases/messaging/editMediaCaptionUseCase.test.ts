/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { instance, mock, reset } from 'ts-mockito'
import { MediaCredentialManager } from '../../../../../../src/private/data/media/mediaCredentialManager'
import { MatrixMessagingService } from '../../../../../../src/private/data/messaging/matrixMessagingService'
import { SessionManager } from '../../../../../../src/private/data/session/sessionManager'
import { EditMediaCaptionUseCase } from '../../../../../../src/private/domain/use-cases/messaging/editMediaCaptionUseCase'
import { HandleId } from '../../../../../../src/public'

jest.mock('../../../../../../src/private/data/messaging/matrixMessagingService')

describe('EditMediaCaptionUseCase Test Suite', () => {
  const mockSessionManager = mock<SessionManager>()
  const mockMediaCredentialManager = mock<MediaCredentialManager>()

  let instanceUnderTest: EditMediaCaptionUseCase

  beforeEach(() => {
    reset(mockSessionManager)

    instanceUnderTest = new EditMediaCaptionUseCase(
      instance(mockSessionManager),
      instance(mockMediaCredentialManager),
    )
  })

  describe('execute', () => {
    it('Edits a caption for a media attachment successfully', async () => {
      const mockMatrixMessagingService = {
        editMediaCaption: jest.fn().mockResolvedValue(undefined),
      }
      ;(MatrixMessagingService as unknown as jest.Mock).mockReturnValue(
        mockMatrixMessagingService,
      )

      const handleId = new HandleId('handleId')
      const recipient = new HandleId('testRecipientHandleId')
      const messageId = 'messageId'
      const caption = 'Edit a caption'
      await expect(
        instanceUnderTest.execute({
          handleId,
          recipient,
          messageId,
          caption,
        }),
      ).resolves.not.toThrow()

      expect(mockMatrixMessagingService.editMediaCaption).toHaveBeenCalledWith({
        recipient,
        messageId,
        message: caption,
        mentions: [],
      })
    })
  })
})
