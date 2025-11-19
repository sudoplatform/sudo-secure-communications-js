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
import { ApiClient } from '../../../../../src/private/data/common/apiClient'
import { DefaultHandleService } from '../../../../../src/private/data/handle/defaultHandleService'
import { UpdateHandleInput } from '../../../../../src/private/domain/entities/handle/handleService'
import { EntityDataFactory } from '../../../../data-factory/entity'
import { GraphQLDataFactory } from '../../../../data-factory/graphQL'

describe('DefaultHandleService Test Suite', () => {
  const mockAppSync = mock<ApiClient>()
  let instanceUnderTest: DefaultHandleService

  beforeEach(() => {
    reset(mockAppSync)
    instanceUnderTest = new DefaultHandleService(instance(mockAppSync))
  })

  describe('get', () => {
    it('calls appSync and returns result correctly', async () => {
      when(mockAppSync.getSecureCommsHandleByName(anything())).thenResolve(
        GraphQLDataFactory.publicHandleInfo,
      )
      const name = 'fooName'
      const result = await instanceUnderTest.get(name)

      expect(result).toStrictEqual(EntityDataFactory.handle)
      const [inputArg] = capture(mockAppSync.getSecureCommsHandleByName).first()
      expect(inputArg).toStrictEqual<typeof inputArg>(name)
      verify(mockAppSync.getSecureCommsHandleByName(anything())).once()
    })

    it('calls appSync correctly with undefined result', async () => {
      when(mockAppSync.getSecureCommsHandleByName(anything())).thenResolve(
        undefined,
      )
      const name = 'fooName'
      const result = await instanceUnderTest.get(name)

      expect(result).toStrictEqual(undefined)
      const [inputArg] = capture(mockAppSync.getSecureCommsHandleByName).first()
      expect(inputArg).toStrictEqual<typeof inputArg>(name)
      verify(mockAppSync.getSecureCommsHandleByName(anything())).once()
    })
  })

  describe('update', () => {
    it('calls appSync and returns result correctly', async () => {
      const handleId = 'testHandleId'
      const name = 'updatedName'
      when(mockAppSync.updateSecureCommsHandle(anything())).thenResolve({
        ...GraphQLDataFactory.handle,
        name,
      })
      const input: UpdateHandleInput = {
        handleId,
        name,
      }
      const result = await instanceUnderTest.update(input)

      expect(result).toStrictEqual({
        ...EntityDataFactory.ownedHandle,
        name,
      })
      const [inputArgs] = capture(mockAppSync.updateSecureCommsHandle).first()
      expect(inputArgs).toStrictEqual<typeof inputArgs>({
        id: handleId,
        name,
      })
      verify(mockAppSync.updateSecureCommsHandle(anything())).once()
    })
  })

  describe('delete', () => {
    it('calls appSync and returns result correctly', async () => {
      const id = 'testHandleId'
      when(mockAppSync.deleteSecureCommsHandle(anything())).thenResolve(
        GraphQLDataFactory.handle,
      )
      const result = await instanceUnderTest.delete(id)

      expect(result).toStrictEqual(EntityDataFactory.ownedHandle)
      const [inputArgs] = capture(mockAppSync.deleteSecureCommsHandle).first()
      expect(inputArgs).toStrictEqual<typeof inputArgs>(id)
      verify(mockAppSync.deleteSecureCommsHandle(anything())).once()
    })
  })
})
