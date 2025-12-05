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
import { MatrixClientManager } from '../../../../../../src/private/data/common/matrixClientManager'
import { SessionManager } from '../../../../../../src/private/data/session/sessionManager'
import { SessionService } from '../../../../../../src/private/domain/entities/session/sessionService'
import { WordValidationService } from '../../../../../../src/private/domain/entities/wordValidation/wordValidationService'
import { ProvisionHandleUseCase } from '../../../../../../src/private/domain/use-cases/handles/provisionHandleUseCase'
import { HandleId, UnacceptableWordsError } from '../../../../../../src/public'
import { EntityDataFactory } from '../../../../../data-factory/entity'

describe('ProvisionHandleUseCase Test Suite', () => {
  const mockSessionService = mock<SessionService>()
  const mockWordValidationService = mock<WordValidationService>()
  const mockSessionManager = mock<SessionManager>()

  const mockMatrixManager = {
    signIn: jest.fn(),
  } as Partial<MatrixClientManager> as MatrixClientManager

  let instanceUnderTest: ProvisionHandleUseCase

  beforeEach(() => {
    reset(mockSessionService)
    reset(mockWordValidationService)
    reset(mockSessionManager)

    instanceUnderTest = new ProvisionHandleUseCase(
      instance(mockSessionService),
      instance(mockWordValidationService),
      instance(mockSessionManager),
    )
  })

  describe('execute', () => {
    it('Provisions the handle', async () => {
      const name = 'fooName'
      const words = new Set([name])
      const storePassphrase = 'testStorePassphrase'
      when(mockWordValidationService.checkWordValidity(anything())).thenResolve(
        words,
      )
      when(mockSessionService.create(anything())).thenResolve(
        EntityDataFactory.secureCommsSession,
      )

      const result = await instanceUnderTest.execute({
        name,
        storePassphrase,
      })

      expect(result).toStrictEqual(EntityDataFactory.ownedHandle)
      const [inputWordArgs] = capture(
        mockWordValidationService.checkWordValidity,
      ).first()
      expect(inputWordArgs).toStrictEqual<typeof inputWordArgs>(words)
      verify(mockWordValidationService.checkWordValidity(anything())).once()
      const [inputArgs] = capture(mockSessionService.create).first()
      expect(inputArgs).toStrictEqual<typeof inputArgs>({
        id: undefined,
        name,
        deviceId: expect.any(String),
      })
      verify(mockSessionService.create(anything())).once()
      verify(
        mockSessionManager.ensureValidSession(anything(), anything()),
      ).once()
      const [handleIdArg, storePassphraseArg] = capture(
        mockSessionManager.ensureValidSession,
      ).first()
      expect(handleIdArg).toStrictEqual<typeof handleIdArg>(
        new HandleId(EntityDataFactory.secureCommsSession.handleId),
      )
      expect(storePassphraseArg).toStrictEqual<typeof storePassphraseArg>(
        storePassphrase,
      )
      verify(
        mockSessionManager.ensureValidSession(anything(), anything()),
      ).once()
    })

    it('Provisions the handle with id provided', async () => {
      const id = 'fooId'
      const name = 'fooName'
      const words = new Set([name])
      const storePassphrase = 'testStorePassphrase'
      when(mockWordValidationService.checkWordValidity(anything())).thenResolve(
        words,
      )
      when(mockSessionService.create(anything())).thenResolve({
        ...EntityDataFactory.secureCommsSession,
        handleId: id,
      })

      const result = await instanceUnderTest.execute({
        id,
        name,
        storePassphrase,
      })

      expect(result).toStrictEqual({
        ...EntityDataFactory.ownedHandle,
        handleId: new HandleId(id),
      })
      const [inputWordArgs] = capture(
        mockWordValidationService.checkWordValidity,
      ).first()
      expect(inputWordArgs).toStrictEqual<typeof inputWordArgs>(words)
      verify(mockWordValidationService.checkWordValidity(anything())).once()
      const [inputArgs] = capture(mockSessionService.create).first()
      expect(inputArgs).toStrictEqual<typeof inputArgs>({
        id,
        name,
        deviceId: expect.any(String),
      })
      verify(mockSessionService.create(anything())).once()
      verify(
        mockSessionManager.ensureValidSession(anything(), anything()),
      ).once()
      const [handleIdArg, storePassphraseArg] = capture(
        mockSessionManager.ensureValidSession,
      ).first()
      expect(handleIdArg).toStrictEqual<typeof handleIdArg>(
        new HandleId('fooId'),
      )
      expect(storePassphraseArg).toStrictEqual<typeof storePassphraseArg>(
        storePassphrase,
      )
      verify(
        mockSessionManager.ensureValidSession(anything(), anything()),
      ).once()
    })

    it('Should throw an UnacceptableWordsError when an invalid word is used when provisioning a handle', async () => {
      const name = 'fooName'
      when(mockWordValidationService.checkWordValidity(anything())).thenResolve(
        new Set([name, 'bar']),
      )
      when(mockSessionService.create(anything())).thenResolve(
        EntityDataFactory.secureCommsSession,
      )

      await expect(
        instanceUnderTest.execute({
          name,
        }),
      ).rejects.toThrow(UnacceptableWordsError)

      const [inputWordArgs] = capture(
        mockWordValidationService.checkWordValidity,
      ).first()
      expect(inputWordArgs).toStrictEqual<typeof inputWordArgs>(new Set([name]))
      verify(mockWordValidationService.checkWordValidity(anything())).once()
      verify(mockSessionService.create(anything())).never()
      verify(mockSessionManager.getMatrixClient(anything())).never()
    })
  })
})
