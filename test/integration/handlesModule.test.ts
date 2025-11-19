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
import {
  HandleId,
  HandleNotAvailableError,
  HandleNotFoundError,
  InvalidHandleError,
  SecureCommsClient,
} from '../../src/public'

describe('SecureCommsClient HandlesModule Test Suite', () => {
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
    await userClient.reset()
  })

  describe('handle lifecycle', () => {
    it('provisions, retrieves, updates and deprovisions a handle successfully', async () => {
      // Provision a handle
      const name = v4()
      const provisionedHandle = await instanceUnderTest.handles.provisionHandle(
        {
          name,
        },
      )
      expect(provisionedHandle).toEqual({
        handleId: expect.any(HandleId),
        name: name,
        owner,
        owners: [{ id: owner, issuer: userOwnerIssuer }],
      })

      // List the single provisioned handle
      const listedHandles = await instanceUnderTest.handles.listHandles({})
      expect(listedHandles.items).toHaveLength(1)
      expect(listedHandles.items[0]).toMatchObject({
        handleId: expect.any(HandleId),
        name: name,
        owner,
        owners: [{ id: owner, issuer: userOwnerIssuer }],
      })
      expect(listedHandles.nextToken).toBeFalsy()

      // Update a handle
      const newName = v4()
      const updatedHandle = await instanceUnderTest.handles.updateHandle({
        handleId: provisionedHandle.handleId,
        name: newName,
      })
      expect(updatedHandle).toEqual({
        handleId: provisionedHandle.handleId,
        name: newName,
        owner,
        owners: [{ id: owner, issuer: userOwnerIssuer }],
      })

      // Deprovision the handle
      await expect(
        instanceUnderTest.handles.deprovisionHandle(provisionedHandle.handleId),
      ).resolves.not.toThrow()
    })

    it('retrieves a list of handles respecting limit successfully', async () => {
      const name1 = v4()
      const handle1 = await instanceUnderTest.handles.provisionHandle({
        name: name1,
      })
      expect(handle1).toBeDefined()

      const name2 = v4()
      const handle2 = await instanceUnderTest.handles.provisionHandle({
        name: name2,
      })
      expect(handle2).toBeDefined()

      const result = await instanceUnderTest.handles.listHandles({ limit: 1 })
      expect(result.items).toHaveLength(1)
      expect(result.nextToken).toBeTruthy()
    })

    it('retrieves a list of multiple handles successfully', async () => {
      // Perform an initial list first
      let result = await instanceUnderTest.handles.listHandles({})
      expect(result.items).toHaveLength(0)

      const name = v4()
      const handle = await instanceUnderTest.handles.provisionHandle({
        name,
      })
      expect(handle).toBeDefined()

      result = await instanceUnderTest.handles.listHandles({})
      expect(result.items).toHaveLength(1)
      expect(result.items[0]).toMatchObject({
        handleId: expect.any(HandleId),
        name: name,
        owner,
        owners: [{ id: owner, issuer: userOwnerIssuer }],
      })
      expect(result.nextToken).toBeFalsy()

      // Create a second handle and perform a list again
      const name2 = v4()
      const handle2 = await instanceUnderTest.handles.provisionHandle({
        name: name2,
      })
      expect(handle2).toBeDefined()
      result = await instanceUnderTest.handles.listHandles({})
      expect(result.items).toHaveLength(2)
    })
  })

  describe('handle error handling', () => {
    it('should throw an InvalidHandleError when an invalid handle name is supplied on handle provision', async () => {
      await expect(
        instanceUnderTest.handles.provisionHandle({
          name: 'invalidName',
        }),
      ).rejects.toThrow(InvalidHandleError)
    })

    it('should throw a HandleNotAvailableError when attempting to provision a handle that already exists', async () => {
      const name = v4()
      const handle = await instanceUnderTest.handles.provisionHandle({
        name,
      })
      expect(handle).toBeDefined()

      await expect(
        instanceUnderTest.handles.provisionHandle({
          name,
        }),
      ).rejects.toThrow(HandleNotAvailableError)
    })

    it('should throw a HandleNotFoundError when attempting to update a non-existent handle', async () => {
      await expect(
        instanceUnderTest.handles.updateHandle({
          handleId: new HandleId('nonExistentId'),
          name: v4(),
        }),
      ).rejects.toThrow(HandleNotFoundError)
    })

    it('should throw an InvalidHandleError when attempting to update with an invalid handle name', async () => {
      const name = v4()
      const createdHandle = await instanceUnderTest.handles.provisionHandle({
        name,
      })
      expect(createdHandle).toBeDefined()

      await expect(
        instanceUnderTest.handles.updateHandle({
          handleId: createdHandle.handleId,
          name: 'invalidName',
        }),
      ).rejects.toThrow(InvalidHandleError)
    })

    it('should throw a HandleNotAvailableError when attempting to update with an unavailable handle name', async () => {
      const name = v4()
      const createdHandle = await instanceUnderTest.handles.provisionHandle({
        name,
      })
      expect(createdHandle).toBeDefined()

      await expect(
        instanceUnderTest.handles.updateHandle({
          handleId: createdHandle.handleId,
          name: name,
        }),
      ).rejects.toThrow(HandleNotAvailableError)
    })

    it('should throw a HandleNotFoundError when attempting to delete a non-existent handle', async () => {
      await expect(
        instanceUnderTest.handles.deprovisionHandle(
          new HandleId('nonExistentId'),
        ),
      ).rejects.toThrow(HandleNotFoundError)
    })
  })
})
