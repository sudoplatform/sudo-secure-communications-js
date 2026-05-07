/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { DefaultLogger } from '@sudoplatform/sudo-common'
import { SudoUserClient } from '@sudoplatform/sudo-user'
import * as jwt from 'jsonwebtoken'
import * as uuid from 'uuid'
import { v4 } from 'uuid'
import {
  setupSecureCommsClient,
  userOwnerIssuer,
} from './util/secureCommsClientLifecycle'
import { ApiClient } from '../../src/private/data/common/apiClient'
import { DefaultSessionService } from '../../src/private/data/session/defaultSessionService'
import { delay } from '../../src/private/util/delay'
import { HandleId, SecureCommsClient } from '../../src/public'

function deviceIdFromJwt(accessToken: string): string {
  const decoded = jwt.decode(accessToken) as Record<string, unknown> | null
  expect(decoded).toBeTruthy()
  expect(decoded).toHaveProperty('device_id')
  return decoded!.device_id as string
}

describe('SecureCommsClient Syncing Test Suite', () => {
  jest.setTimeout(240000)
  const log = new DefaultLogger('SecureCommsClientIntegrationTests')

  let instanceUnderTest: SecureCommsClient
  let userClient: SudoUserClient
  let apiClient: ApiClient
  let sessionService: DefaultSessionService
  let owner: string | undefined

  beforeEach(async () => {
    const result = await setupSecureCommsClient(log)
    instanceUnderTest = result.secureCommsClient
    userClient = result.userClient
    apiClient = result.apiClient
    sessionService = new DefaultSessionService(apiClient)
    owner = result.subject
  })

  afterEach(async () => {
    await instanceUnderTest.reset()
    await userClient.reset()
  })

  describe('startSyncing and stopSyncing', () => {
    it('creates a handle and performs a rudimentary start and stop sync', async () => {
      const handleName = `test_handle_${v4()}`
      const handle = await instanceUnderTest.handles.provisionHandle({
        name: handleName,
      })
      expect(handle).toMatchObject({
        handleId: expect.any(HandleId),
        name: handleName,
        owner,
        owners: [{ id: owner, issuer: userOwnerIssuer }],
      })

      await instanceUnderTest.startSyncing(handle.handleId)

      // Wait some time for syncing to occur
      await delay(2000)

      await instanceUnderTest.stopSyncing(handle.handleId)
    })

    it('uses a caller-provided deviceId for the session (API session and JWT device_id)', async () => {
      const explicitDeviceId = `integration-device-${v4()}`
      const handleName = `test_handle_${Date.now()}`
      const handle = await instanceUnderTest.handles.provisionHandle({
        name: handleName,
        deviceId: explicitDeviceId,
      })
      expect(handle).toMatchObject({
        handleId: expect.any(HandleId),
        name: handleName,
        owner,
        owners: [{ id: owner, issuer: userOwnerIssuer }],
      })

      await instanceUnderTest.startSyncing(handle.handleId, explicitDeviceId)
      await delay(2000)

      const session = await sessionService.get({
        handleId: handle.handleId.toString(),
        deviceId: explicitDeviceId,
      })
      expect(session.deviceId).toBe(explicitDeviceId)
      expect(deviceIdFromJwt(session.token)).toBe(explicitDeviceId)

      await instanceUnderTest.stopSyncing(handle.handleId)
    })

    it('auto-generates a deviceId when omitted; session token matches that id', async () => {
      const autogenDeviceId = 'aaaaaaaa-bbbb-4aaa-bbbb-aaaaaaaaaaaa'
      const v4Spy = jest
        .spyOn(uuid, 'v4')
        .mockReturnValue(
          autogenDeviceId as unknown as ReturnType<typeof uuid.v4>,
        )
      try {
        const handleName = `test_handle_${Date.now()}`
        const handle = await instanceUnderTest.handles.provisionHandle({
          name: handleName,
        })
        expect(handle).toMatchObject({
          handleId: expect.any(HandleId),
          name: handleName,
          owner,
          owners: [{ id: owner, issuer: userOwnerIssuer }],
        })

        await instanceUnderTest.startSyncing(handle.handleId)
        await delay(2000)

        const session = await sessionService.get({
          handleId: handle.handleId.toString(),
          deviceId: autogenDeviceId,
        })
        expect(session.deviceId).toBe(autogenDeviceId)
        expect(deviceIdFromJwt(session.token)).toBe(autogenDeviceId)

        await instanceUnderTest.stopSyncing(handle.handleId)
      } finally {
        v4Spy.mockRestore()
      }
    })
  })
})
