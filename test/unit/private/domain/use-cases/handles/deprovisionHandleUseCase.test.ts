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
import { SessionManager } from '../../../../../../src/private/data/session/sessionManager'
import { HandleService } from '../../../../../../src/private/domain/entities/handle/handleService'
import { DeprovisionHandleUseCase } from '../../../../../../src/private/domain/use-cases/handles/deprovisionHandleUseCase'
import { HandleId } from '../../../../../../src/public'
import { EntityDataFactory } from '../../../../../data-factory/entity'

describe('DeprovisionHandleUseCase Test Suite', () => {
  const mockHandleService = mock<HandleService>()
  const mockSessionManager = mock<SessionManager>()
  let instanceUnderTest: DeprovisionHandleUseCase

  beforeEach(() => {
    reset(mockHandleService)
    instanceUnderTest = new DeprovisionHandleUseCase(
      instance(mockHandleService),
      instance(mockSessionManager),
    )
  })

  describe('execute', () => {
    it('Deprovision a handle successfully', async () => {
      when(mockHandleService.delete(anything())).thenResolve(
        EntityDataFactory.ownedHandle,
      )

      const id = new HandleId('handleId')
      const result = await instanceUnderTest.execute(id)

      expect(result).toStrictEqual(EntityDataFactory.ownedHandle)
      const [inputArgs] = capture(mockHandleService.delete).first()
      expect(inputArgs).toStrictEqual<typeof inputArgs>(id.toString())
      verify(mockHandleService.delete(anything())).once()
      verify(mockSessionManager.deleteSession(anything(), anything())).once()
    })
  })
})
