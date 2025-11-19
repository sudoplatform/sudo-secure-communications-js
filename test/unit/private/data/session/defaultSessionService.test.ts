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
import { DefaultSessionService } from '../../../../../src/private/data/session/defaultSessionService'
import {
  CreateSessionInput,
  GetSessionInput,
} from '../../../../../src/private/domain/entities/session/sessionService'
import { EntityDataFactory } from '../../../../data-factory/entity'
import { GraphQLDataFactory } from '../../../../data-factory/graphQL'

describe('DefaultSessionService Test Suite', () => {
  const mockAppSync = mock<ApiClient>()
  let instanceUnderTest: DefaultSessionService

  beforeEach(() => {
    reset(mockAppSync)
    instanceUnderTest = new DefaultSessionService(instance(mockAppSync))
  })

  describe('create', () => {
    it('calls appSync and returns result correctly', async () => {
      when(mockAppSync.createSecureCommsHandle(anything())).thenResolve(
        GraphQLDataFactory.secureCommsSession,
      )
      const input: CreateSessionInput = {
        name: 'fooName',
        deviceId: 'barDeviceId',
      }
      const result = await instanceUnderTest.create(input)

      expect(result).toStrictEqual(EntityDataFactory.secureCommsSession)
      const [inputArgs] = capture(mockAppSync.createSecureCommsHandle).first()
      expect(inputArgs).toStrictEqual<typeof inputArgs>({
        name: 'fooName',
        deviceId: 'barDeviceId',
      })
      verify(mockAppSync.createSecureCommsHandle(anything())).once()
    })
  })

  describe('get', () => {
    it('calls appSync and returns the result correctly', async () => {
      when(mockAppSync.getSecureCommsSession(anything())).thenResolve(
        GraphQLDataFactory.secureCommsSession,
      )
      const input: GetSessionInput = {
        handleId: 'fooHandleId',
        deviceId: 'barDeviceId',
      }
      const result = await instanceUnderTest.get(input)

      expect(result).toStrictEqual(EntityDataFactory.secureCommsSession)
      const [inputArgs] = capture(mockAppSync.getSecureCommsSession).first()
      expect(inputArgs).toStrictEqual<typeof inputArgs>({
        handleId: 'fooHandleId',
        deviceId: 'barDeviceId',
      })
      verify(mockAppSync.getSecureCommsSession(anything())).once()
    })
  })
})
