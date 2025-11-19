/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { IDBPDatabase } from 'idb'
import { IndexedDBStorageProvider } from '../../../../../../src/private/data/storage/indexeddb/indexeddbStorageProvider'

const mockIndexedDB = {
  deleteDatabase: jest.fn(),
  open: jest.fn(),
}

const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}

global.indexedDB = mockIndexedDB as any
global.localStorage = mockLocalStorage as any

const mockOpenDB = jest.fn().mockResolvedValue(undefined)
const mockProvider = {
  openDB: mockOpenDB,
}

jest.mock('matrix-js-sdk/lib/matrix', () => ({
  IndexedDBStore: jest.fn().mockImplementation((opt: { dbName: string }) => ({
    dbName: opt.dbName,
    startup: jest.fn(),
  })),
}))

jest.mock('idb', () => ({
  openDB: jest.fn().mockResolvedValue({
    put: jest.fn().mockResolvedValue(undefined),
    get: jest.fn().mockResolvedValue(null),
    delete: jest.fn().mockResolvedValue(undefined),
    close: jest.fn(),
  }),
}))

describe('IndexedDBStorageProvider Test Suite', () => {
  const testHandleId = 'test-handle-id'
  const testStore = 'test-store'
  const testKey = 'test-key'
  const testValue = { test: 'value' }

  let provider: IndexedDBStorageProvider
  let mockDb: IDBPDatabase

  beforeEach(async () => {
    jest.clearAllMocks()
    provider = new IndexedDBStorageProvider(testHandleId)
    await provider.openDB()
    mockDb = provider['db'] as IDBPDatabase
  })

  it('constructor should call IndexedDBStore with correct dbName and set this.dbName correctly', () => {
    expect((provider['_matrixStore'] as any)['dbName']).toBe(testHandleId)
    expect(provider['dbName']).toBe('secure-comms:' + testHandleId)
  })

  it('constructor should call startup on the matrix store', () => {
    expect((provider['_matrixStore'] as any)['startup']).toHaveBeenCalled()
  })

  it('should call openIndexedDB with correct parameters', async () => {
    const { openDB } = require('idb')
    await provider.openDB()
    expect(openDB).toHaveBeenCalledWith(
      'secure-comms:' + testHandleId,
      expect.any(Number),
      expect.objectContaining({
        upgrade: expect.any(Function),
      }),
    )
  })

  it('should call close on the db and unset this.db when closeDB is called', async () => {
    const closeSpy = jest.spyOn(mockDb, 'close')
    await provider.closeDB()
    expect(closeSpy).toHaveBeenCalled()
    expect(provider['db']).toBeUndefined()
  })

  it('should call closeDB and deleteDatabase with correct dbName when destroyDB is called', async () => {
    const closeDBSpy = jest.spyOn(provider, 'closeDB')
    await provider.destroyDB()
    expect(closeDBSpy).toHaveBeenCalled()
    expect(mockIndexedDB.deleteDatabase).toHaveBeenCalledWith(
      'secure-comms:' + testHandleId,
    )
  })

  it('should throw error when ensureDbOpen is called and db is undefined', () => {
    provider['db'] = undefined
    expect(() => provider['ensureDbOpen']()).toThrow('database not open')
  })

  it('should not throw error when ensureDbOpen is called and db is defined', () => {
    expect(() => provider['ensureDbOpen']()).not.toThrow()
  })

  it('should call db.put with correct parameters when createItem is called', async () => {
    const putSpy = jest.spyOn(mockDb, 'put')
    await provider.createItem(testStore, testKey, testValue)
    expect(putSpy).toHaveBeenCalledWith(testStore, testValue, testKey)
  })

  it('should call db.get with correct parameters when getItem is called', async () => {
    const getSpy = jest.spyOn(mockDb, 'get').mockResolvedValue(testValue)
    const result = await provider.getItem(testStore, testKey)
    expect(getSpy).toHaveBeenCalledWith(testStore, testKey)
    expect(result).toBe(testValue)
  })

  it('should return undefined when getItem is called and item does not exist', async () => {
    const getSpy = jest.spyOn(mockDb, 'get').mockResolvedValue(undefined)
    const result = await provider.getItem(testStore, testKey)
    expect(getSpy).toHaveBeenCalledWith(testStore, testKey)
    expect(result).toBeUndefined()
  })

  it('should return array with single item when getItems is called and item is not an array', async () => {
    const getSpy = jest.spyOn(mockDb, 'get').mockResolvedValue(testValue)
    const result = await provider.getItems(testStore, testKey)
    expect(getSpy).toHaveBeenCalledWith(testStore, testKey)
    expect(result).toEqual([testValue])
  })

  it('should return array of items when getItems is called and item is an array', async () => {
    const testValues = [{ test: 'value1' }, { test: 'value2' }]
    const getSpy = jest.spyOn(mockDb, 'get').mockResolvedValue(testValues)
    const result = await provider.getItems(testStore, testKey)
    expect(getSpy).toHaveBeenCalledWith(testStore, testKey)
    expect(result).toEqual(testValues)
  })

  it('should return empty array when getItems is called and item does not exist', async () => {
    const getSpy = jest.spyOn(mockDb, 'get').mockResolvedValue(undefined)
    const result = await provider.getItems(testStore, testKey)
    expect(getSpy).toHaveBeenCalledWith(testStore, testKey)
    expect(result).toEqual([])
  })

  it('should call db.put with correct parameters when updateItem is called', async () => {
    const putSpy = jest.spyOn(mockDb, 'put')
    await provider.updateItem(testStore, testKey, testValue)
    expect(putSpy).toHaveBeenCalledWith(testStore, testValue, testKey)
  })

  it('should call db.delete with correct parameters when deleteItem is called', async () => {
    const deleteSpy = jest.spyOn(mockDb, 'delete')
    await provider.deleteItem(testStore, testKey)
    expect(deleteSpy).toHaveBeenCalledWith(testStore, testKey)
  })
})
