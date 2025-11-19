/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { DefaultLogger } from '@sudoplatform/sudo-common'
import { SudoUserClient } from '@sudoplatform/sudo-user'
import { v4 } from 'uuid'
import {
  setupSecureCommsClient,
  userOwnerIssuer,
} from './util/secureCommsClientLifecycle'
import { delay } from '../../src/private/util/delay'
import { HandleId, SecureCommsClient } from '../../src/public'

describe('SecureCommsClient Syncing Test Suite', () => {
  jest.setTimeout(240000)
  const log = new DefaultLogger('SecureCommsClientIntegrationTests')

  let instanceUnderTest: SecureCommsClient
  let userClient: SudoUserClient
  let owner: string | undefined

  beforeEach(async () => {
    const result = await setupSecureCommsClient(log)
    instanceUnderTest = result.secureCommsClient
    userClient = result.userClient
    owner = result.subject
  })

  afterEach(async () => {
    await instanceUnderTest.reset()
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
  })
})
