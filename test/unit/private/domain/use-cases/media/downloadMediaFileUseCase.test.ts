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
import { MatrixMediaService } from '../../../../../../src/private/data/media/matrixMediaService'
import { MediaCredentialManager } from '../../../../../../src/private/data/media/mediaCredentialManager'
import { SessionManager } from '../../../../../../src/private/data/session/sessionManager'
import { PublicMediaType } from '../../../../../../src/private/domain/entities/media/mediaCredentialEntity'
import { DownloadMediaFileUseCase } from '../../../../../../src/private/domain/use-cases/media/downloadMediaFileUseCase'
import { HandleId } from '../../../../../../src/public'
import { EntityDataFactory } from '../../../../../data-factory/entity'

jest.mock('../../../../../../src/private/data/media/matrixMediaService')

describe('DownloadMediaFileUseCase Test Suite', () => {
  const mockSessionManager = mock<SessionManager>()
  const mockMediaCredentialManager = mock<MediaCredentialManager>()
  const mockConfiguration = EntityDataFactory.secureCommsConfig

  let instanceUnderTest: DownloadMediaFileUseCase

  beforeEach(() => {
    reset(mockSessionManager)
    reset(mockMediaCredentialManager)

    instanceUnderTest = new DownloadMediaFileUseCase(
      instance(mockSessionManager),
      instance(mockMediaCredentialManager),
      mockConfiguration,
    )
  })

  describe('execute', () => {
    it('Downloads room media file successfully', async () => {
      const mediaArrayBuffer = new ArrayBuffer(0)
      const mediaCredential = EntityDataFactory.mediaCredential
      when(
        mockMediaCredentialManager.getRoomMediaCredential(
          anything(),
          anything(),
          anything(),
        ),
      ).thenResolve(mediaCredential)
      const mockMatrixMediaService = {
        downloadMediaFile: jest.fn().mockResolvedValue(mediaArrayBuffer),
      }
      ;(MatrixMediaService as unknown as jest.Mock).mockReturnValue(
        mockMatrixMediaService,
      )

      const handleId = new HandleId('handleId')
      const uri = `mxc://${mockConfiguration.roomMediaBucket}/media_123456`
      const result = await instanceUnderTest.execute({
        handleId,
        uri,
      })

      expect(result).toStrictEqual(mediaArrayBuffer)
      const [handleIdArg, forWriteArg, roomIdArg] = capture(
        mockMediaCredentialManager.getRoomMediaCredential,
      ).first()
      expect(handleIdArg).toStrictEqual<typeof handleIdArg>(handleId)
      expect(forWriteArg).toStrictEqual<typeof forWriteArg>(false)
      expect(roomIdArg).toStrictEqual<typeof roomIdArg>(
        `!media:${mockConfiguration.homeServer}`,
      )
      verify(
        mockMediaCredentialManager.getRoomMediaCredential(
          anything(),
          anything(),
          anything(),
        ),
      ).once()
      expect(mockMatrixMediaService.downloadMediaFile).toHaveBeenCalledWith({
        uri,
        mediaCredential,
      })
    })

    it('Downloads public media file successfully', async () => {
      const mediaArrayBuffer = new ArrayBuffer(0)
      const mediaCredential = EntityDataFactory.mediaCredential
      when(
        mockMediaCredentialManager.getPublicMediaCredential(
          anything(),
          anything(),
        ),
      ).thenResolve(mediaCredential)
      const mockMatrixMediaService = {
        downloadMediaFile: jest.fn().mockResolvedValue(mediaArrayBuffer),
      }
      ;(MatrixMediaService as unknown as jest.Mock).mockReturnValue(
        mockMatrixMediaService,
      )

      const handleId = new HandleId('handleId')
      const uri = `mxc://${mockConfiguration.publicMediaBucket}/media_123456`
      const result = await instanceUnderTest.execute({
        handleId,
        uri,
      })

      const [forWriteArg, mediaTypeArg] = capture(
        mockMediaCredentialManager.getPublicMediaCredential,
      ).first()
      expect(forWriteArg).toStrictEqual<typeof forWriteArg>(false)
      expect(mediaTypeArg).toStrictEqual<typeof mediaTypeArg>(
        PublicMediaType.MEDIA,
      )
      verify(
        mockMediaCredentialManager.getPublicMediaCredential(
          anything(),
          anything(),
        ),
      ).once()
      expect(result).toStrictEqual(mediaArrayBuffer)
      expect(mockMatrixMediaService.downloadMediaFile).toHaveBeenCalledWith({
        uri,
        mediaCredential,
      })
    })

    it('Downloads public avatar file successfully', async () => {
      const mediaArrayBuffer = new ArrayBuffer(0)
      const mediaCredential = EntityDataFactory.mediaCredential
      when(
        mockMediaCredentialManager.getPublicMediaCredential(
          anything(),
          anything(),
        ),
      ).thenResolve(mediaCredential)
      const mockMatrixMediaService = {
        downloadMediaFile: jest.fn().mockResolvedValue(mediaArrayBuffer),
      }
      ;(MatrixMediaService as unknown as jest.Mock).mockReturnValue(
        mockMatrixMediaService,
      )

      const handleId = new HandleId('handleId')
      const uri = `mxc://${mockConfiguration.publicMediaBucket}/avatars_123456`
      const result = await instanceUnderTest.execute({
        handleId,
        uri,
      })

      const [forWriteArg, mediaTypeArg] = capture(
        mockMediaCredentialManager.getPublicMediaCredential,
      ).first()
      expect(forWriteArg).toStrictEqual<typeof forWriteArg>(false)
      expect(mediaTypeArg).toStrictEqual<typeof mediaTypeArg>(
        PublicMediaType.AVATARS,
      )
      verify(
        mockMediaCredentialManager.getPublicMediaCredential(
          anything(),
          anything(),
        ),
      ).once()
      expect(result).toStrictEqual(mediaArrayBuffer)
      expect(mockMatrixMediaService.downloadMediaFile).toHaveBeenCalledWith({
        uri,
        mediaCredential,
      })
    })

    it('Downloads media thumbnail with encryption info successfully', async () => {
      const mediaArrayBuffer = new ArrayBuffer(0)
      const mediaCredential = EntityDataFactory.mediaCredential
      when(
        mockMediaCredentialManager.getPublicMediaCredential(
          anything(),
          anything(),
        ),
      ).thenResolve(mediaCredential)
      const mockMatrixMediaService = {
        downloadMediaFile: jest.fn().mockResolvedValue(mediaArrayBuffer),
      }
      ;(MatrixMediaService as unknown as jest.Mock).mockReturnValue(
        mockMatrixMediaService,
      )

      const handleId = new HandleId('handleId')
      const uri = `mxc://${mockConfiguration.publicMediaBucket}/media_123456`
      const encryptionInfo = EntityDataFactory.fileEncryptionInfo
      const result = await instanceUnderTest.execute({
        handleId,
        uri,
        encryptionInfo,
      })
      expect(result).toStrictEqual(mediaArrayBuffer)

      const [forWriteArg, mediaTypeArg] = capture(
        mockMediaCredentialManager.getPublicMediaCredential,
      ).first()
      expect(forWriteArg).toStrictEqual<typeof forWriteArg>(false)
      expect(mediaTypeArg).toStrictEqual<typeof mediaTypeArg>(
        PublicMediaType.MEDIA,
      )
      verify(
        mockMediaCredentialManager.getPublicMediaCredential(
          anything(),
          anything(),
        ),
      ).once()
      expect(mockMatrixMediaService.downloadMediaFile).toHaveBeenCalledWith({
        uri,
        mediaCredential,
        encryptionInfo,
      })
    })
  })
})
