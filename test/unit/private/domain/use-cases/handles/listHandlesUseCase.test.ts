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
import { ListHandlesUseCase } from '../../../../../../src/private/domain/use-cases/handles/listHandlesUseCase'
import { EntityDataFactory } from '../../../../../data-factory/entity'

describe('ListHandlesUseCase Test Suite', () => {
  const mockHandleService = mock<HandleService>()

  let instanceUnderTest: ListHandlesUseCase

  beforeEach(() => {
    reset(mockHandleService)
    instanceUnderTest = new ListHandlesUseCase(instance(mockHandleService))
  })

  describe('execute', () => {
    it('Lists handles successfully', async () => {
      when(mockHandleService.list(anything())).thenResolve({
        handles: [EntityDataFactory.ownedHandle],
      })

      const result = await instanceUnderTest.execute({})

      expect(result).toStrictEqual({ handles: [EntityDataFactory.ownedHandle] })
      const [inputArgs] = capture(mockHandleService.list).first()
      expect(inputArgs).toStrictEqual<typeof inputArgs>({
        limit: undefined,
        nextToken: undefined,
      })
      verify(mockHandleService.list(anything())).once()
    })

    it('Lists handles successfully with empty result items', async () => {
      when(mockHandleService.list(anything())).thenResolve({
        handles: [],
      })
      const result = await instanceUnderTest.execute({})

      expect(result).toStrictEqual({ handles: [] })
      const [inputArgs] = capture(mockHandleService.list).first()
      expect(inputArgs).toStrictEqual<typeof inputArgs>({
        limit: undefined,
        nextToken: undefined,
      })
      verify(mockHandleService.list(anything())).once()
    })
  })
})
