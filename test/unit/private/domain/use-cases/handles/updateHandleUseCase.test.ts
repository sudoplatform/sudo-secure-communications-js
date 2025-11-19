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
import { HandleService } from '../../../../../../src/private/domain/entities/handle/handleService'
import { WordValidationService } from '../../../../../../src/private/domain/entities/wordValidation/wordValidationService'
import { UpdateHandleUseCase } from '../../../../../../src/private/domain/use-cases/handles/updateHandleUseCase'
import { HandleId, UnacceptableWordsError } from '../../../../../../src/public'
import { EntityDataFactory } from '../../../../../data-factory/entity'

describe('UpdateHandleUseCase Test Suite', () => {
  const mockHandleService = mock<HandleService>()
  const mockWordValidationService = mock<WordValidationService>()

  let instanceUnderTest: UpdateHandleUseCase

  beforeEach(() => {
    reset(mockHandleService)
    reset(mockWordValidationService)
    instanceUnderTest = new UpdateHandleUseCase(
      instance(mockHandleService),
      instance(mockWordValidationService),
    )
  })

  describe('execute', () => {
    it('Updates the name of a handle successfully', async () => {
      const handleId = new HandleId('testHandleId')
      const name = 'updatedName'
      const words = new Set([name])
      when(mockWordValidationService.checkWordValidity(anything())).thenResolve(
        words,
      )
      when(mockHandleService.update(anything())).thenResolve({
        ...EntityDataFactory.ownedHandle,
        name,
      })

      const result = await instanceUnderTest.execute({
        handleId,
        name,
      })

      expect(result).toStrictEqual({
        ...EntityDataFactory.ownedHandle,
        name,
      })
      const [inputWordArgs] = capture(
        mockWordValidationService.checkWordValidity,
      ).first()
      expect(inputWordArgs).toStrictEqual<typeof inputWordArgs>(words)
      verify(mockWordValidationService.checkWordValidity(anything())).once()
      const [inputArgs] = capture(mockHandleService.update).first()
      expect(inputArgs).toStrictEqual<typeof inputArgs>({
        handleId: handleId.toString(),
        name,
      })
      verify(mockHandleService.update(anything())).once()
    })

    it('Should throw an UnacceptableWordsError when an invalid word is used when updating a handle', async () => {
      const handleId = new HandleId('testHandleId')
      const name = 'updatedName'
      when(mockWordValidationService.checkWordValidity(anything())).thenResolve(
        new Set([name, 'bar']),
      )

      await expect(
        instanceUnderTest.execute({
          handleId,
          name,
        }),
      ).rejects.toThrow(UnacceptableWordsError)

      const [inputWordArgs] = capture(
        mockWordValidationService.checkWordValidity,
      ).first()
      expect(inputWordArgs).toStrictEqual<typeof inputWordArgs>(new Set([name]))
      verify(mockWordValidationService.checkWordValidity(anything())).once()
      verify(mockHandleService.update(anything())).never()
    })
  })
})
