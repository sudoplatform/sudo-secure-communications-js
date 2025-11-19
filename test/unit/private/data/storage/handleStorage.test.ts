/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { IStore } from 'matrix-js-sdk/lib/store'
import { instance, mock, reset, verify, when } from 'ts-mockito'
import { DefaultHandleStorage } from '../../../../../src/private/data/storage/handleStorage'
import { DefaultSecureCommsStore } from '../../../../../src/private/data/storage/secureCommsStore'
import { StorageProvider } from '../../../../../src/public/modules/storageModule'

describe('DefaultHandleStorage Test Suite', () => {
  let storageProvider: StorageProvider
  let handleStorage: DefaultHandleStorage

  beforeEach(() => {
    storageProvider = mock<StorageProvider>()
    handleStorage = new DefaultHandleStorage(instance(storageProvider))
  })

  afterEach(() => {
    reset(storageProvider)
  })

  it('should create DefaultSecureCommsStore with correct parameters', () => {
    const secureCommsStore = handleStorage.secureCommsStore
    expect(secureCommsStore).toBeInstanceOf(DefaultSecureCommsStore)
  })

  it('should return correct matrixStore from storageProvider.matrixStore', () => {
    const mockMatrixStore = mock<IStore>()
    when(storageProvider.matrixStore).thenReturn(instance(mockMatrixStore))
    const result = handleStorage.matrixStore
    expect(result).toBe(instance(mockMatrixStore))
    verify(storageProvider.matrixStore).once()
  })

  it('should return correct secureCommsStore created by constructor', () => {
    const result = handleStorage.secureCommsStore
    expect(result).toBeInstanceOf(DefaultSecureCommsStore)
  })
})
