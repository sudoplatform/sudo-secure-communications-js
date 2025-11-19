/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { instance, mock, reset, verify, when } from 'ts-mockito'
import { DefaultSecureCommsStore } from '../../../../../src/private/data/storage/secureCommsStore'
import { StorageProvider } from '../../../../../src/public/modules/storageModule'

describe('DefaultSecureCommsStore Test Suite', () => {
  let storageProvider: StorageProvider
  let secureCommsStore: DefaultSecureCommsStore

  beforeEach(() => {
    storageProvider = mock<StorageProvider>()
    secureCommsStore = new DefaultSecureCommsStore(instance(storageProvider))
  })

  afterEach(() => {
    reset(storageProvider)
  })

  it('should call storageProvider.closeDB() when closeStorage is called', async () => {
    await secureCommsStore.closeStorage()
    verify(storageProvider.closeDB()).once()
  })

  it('should call storageProvider.destroyDB() when destroyStorage is called', async () => {
    await secureCommsStore.destroyStorage()
    verify(storageProvider.destroyDB()).once()
  })

  it('should call storageProvider.getItem with correct parameters when getSession is called', async () => {
    const mockAccessToken = 'test-token'

    when(storageProvider.getItem('session', 'accessToken')).thenResolve(
      mockAccessToken,
    )

    const result = await secureCommsStore.sessionAPIs.getAccessToken()

    expect(result).toBe(mockAccessToken)
    verify(storageProvider.getItem('session', 'accessToken')).once()
  })

  it('should call storageProvider.updateItem with correct parameters when saveSession is called', async () => {
    const mockAccessToken = 'test-token'

    await secureCommsStore.sessionAPIs.saveAccessToken(mockAccessToken)

    verify(
      storageProvider.updateItem('session', 'accessToken', mockAccessToken),
    ).once()
  })

  it('should call storageProvider.deleteItem with correct parameters when deleteSession is called', async () => {
    await secureCommsStore.sessionAPIs.deleteAccessToken()

    verify(storageProvider.deleteItem('session', 'accessToken')).once()
  })
})
