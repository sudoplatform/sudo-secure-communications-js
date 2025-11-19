/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { DefaultLogger, Logger } from '@sudoplatform/sudo-common'
import { IStore } from 'matrix-js-sdk/lib/store'
import { DefaultHandleStorage } from '../../private/data/storage/handleStorage'
import { IndexedDBStorageProvider } from '../../private/data/storage/indexeddb/indexeddbStorageProvider'

/**
 * SessionAPIs is a collection of APIs for session storage.
 *
 * @interface SessionAPIs - used by secure comms SDK
 */
export interface SessionAPIs {
  getAccessToken(): Promise<string | undefined>
  saveAccessToken(accessToken: string): Promise<void>
  deleteAccessToken(): Promise<void>
}

/**
 * A secure comms store is a collection of stores for a handle.
 *
 * @interface SecureCommsStore
 * @property {SessionAPIs} sessionAPIs - used by secure comms SDK
 */
export interface SecureCommsStore {
  /**
   * Close the storage
   */
  closeStorage(): Promise<void>

  /**
   * Destroy the storage and purge data
   */
  destroyStorage(): Promise<void>

  /**
   * Session APIs
   */
  sessionAPIs: SessionAPIs
}

/**
 * A handle storage is a collection of stores for a given handle.
 *
 * @interface HandleStorage
 * @property {IStore} matrixStore - used by the matrix client
 * @property {SecureCommsStore} secureCommsStore - used by secure comms SDK
 */
export interface HandleStorage {
  /**
   * `matrixStore` should be compatible with `matrix-js-sdk:IStore`
   *   and should be used as `store` for initializing the matrix client
   */
  matrixStore: IStore

  /**
   * `secureCommsStore` can be used for storing other SecureComms SDK data
   */
  secureCommsStore: SecureCommsStore
}

export class IndexedDBStorageProviderFactory implements StorageProviderFactory {
  private readonly log: Logger

  constructor() {
    this.log = new DefaultLogger(this.constructor.name)
  }

  async useStorageProvider(
    handleId: string,
    storePassphrase?: string, // eslint-disable-line @typescript-eslint/no-unused-vars
  ): Promise<StorageProvider> {
    const storageProvider = new IndexedDBStorageProvider(handleId)
    await storageProvider.openDB()
    return storageProvider
  }
}

export interface StorageProviderFactory {
  useStorageProvider(
    handleId: string,
    storePassphrase?: string,
  ): Promise<StorageProvider>
}

export interface StorageProvider {
  /**
   * `matrixStore` should be compatible with `matrix-js-sdk:IStore`
   *   and should be used as `store` for initializing the matrix client
   */
  matrixStore: IStore

  /**
   * Open the database.
   */
  openDB(): Promise<void>

  /**
   * Close the database.
   */
  closeDB(): Promise<void>

  /**
   * Destroy the database.
   */
  destroyDB(): Promise<void>

  /**
   * Create an item in the database.
   * @param store - The store to create the item in.
   * @param key - The key of the item to create.
   * @param value - The value of the item to create.
   */
  createItem(store: string, key: string, value: any): Promise<void>

  /**
   * Get an item from the database.
   *
   * Should be used when the value is expected to be a single item.
   * @param store - The store to get the item from.
   * @param key - The key of the item to get.
   * @returns The item from the database.
   */
  getItem<T>(store: string, key: string): Promise<T | undefined>

  /**
   * Get items from the database.
   *
   * Should be used when the value is expected to be an array.
   * @param store - The store to get the items from.
   * @param key - The key of the item to get.
   * @param limit - (optional) Number of items to get.
   * @param offset - (optional) Start index of the items to get.
   * @returns The items from the database.
   */
  getItems<T>(
    store: string,
    key: string,
    limit?: number,
    offset?: number,
  ): Promise<T[]>

  /**
   * Update an item in the database.
   * @param store - The store to update the item in.
   * @param key - The key of the item to update.
   * @param value - The value of the item to update.
   */
  updateItem(store: string, key: string, value: any): Promise<void>

  /**
   * Delete an item from the database.
   * @param store - The store to delete the item from.
   * @param key - The key of the item to delete.
   */
  deleteItem(store: string, key: string): Promise<void>
}

/**
 * The `StorageModule` is capable of managing multiple user sessions, ensuring data isolation across different handles (sessions).
 *
 * It should be storage-backend-agnostic to allow using the SDK in browser, Node.js or other environments with different storage requirements and capabilities.
 */
export interface StorageModule {
  /**
   * `useHandleStorage` is responsible for opening (creating new storage or constructing object for existing storage), caching and returning HandleStorage objects for each handleId.
   *
   *  Each handle gets their dedicated HandleStorage object, which helps segmenting data from different sessions.
   * @param {string} handleId - The handleId of the handle to get a storage for.
   * @param {string} storePassphrase - (optional) The passphrase to use for the storage.
   * @returns {HandleStorage | undefined} - The HandleStorage object for the handleId. If the storage provider is not available, `undefined` is returned.
   *
   * ---
   *
   * ***⚠️ WARNING ⚠️***
   *
   * If `storePassphrase` is **not** provided when the storage handle is **first created**, the local storage will be **UNENCRYPTED**.
   *
   * To enable encryption, `storePassphrase` **must** be passed on the **very first call** to this function — i.e., the first time this handle is initialized on a device.
   *
   * ⚠️ Once the storage has been initialized **without encryption**, it **CANNOT** be encrypted later by simply providing `storePassphrase`. Doing so will lead to **storage malfunction**. If this happens, you **must delete** the existing storage and **recreate** it with `storePassphrase` provided from the start.
   */
  useHandleStorage(
    handleId: string,
    storePassphrase?: string,
  ): Promise<HandleStorage | undefined>

  /**
   * `closeHandleStorage` when called, the associated HandleStorage object is removed from the cache, but data is not purged from storage.
   *
   * @param {string} handleId - The handleId of the handle to close a storage for.
   */
  closeHandleStorage(handleId: string): Promise<void>

  /**
   * `deleteHandleStorage` when called, the associated HandleStorage object is removed from the cache, and any data is purged from storage.
   *
   *  Used for clearing data from storage when signing out.
   * @param {string} handleId - The handleId of the handle to delete a storage for.
   */
  deleteHandleStorage(handleId: string): Promise<void>
}

// Default SDK Implementations

export class DefaultStorageModule implements StorageModule {
  private readonly log: Logger
  private readonly storageProviderFactory: StorageProviderFactory | undefined

  private handleStorageCache: Map<string, HandleStorage> = new Map()

  constructor(storageProviderFactory: StorageProviderFactory | undefined) {
    this.log = new DefaultLogger(this.constructor.name)
    this.storageProviderFactory = storageProviderFactory
  }

  async useHandleStorage(
    handleId: string,
    storePassphrase?: string,
  ): Promise<HandleStorage | undefined> {
    // use cache if available
    let handleStorage = this.handleStorageCache.get(handleId)
    if (handleStorage == null) {
      try {
        if (!this.storageProviderFactory) {
          return undefined
        }
        // re-create handle storage from existing database
        const storageProvider =
          await this.storageProviderFactory.useStorageProvider(
            handleId,
            storePassphrase,
          )
        handleStorage = new DefaultHandleStorage(storageProvider)
      } catch (e) {
        const err = new Error('failed to use handle storage')
        this.log.error(err.message)
        throw err
      }
    }
    this.handleStorageCache.set(handleId, handleStorage)
    return handleStorage
  }

  async closeHandleStorage(handleId: string): Promise<void> {
    const handleStorage = await this.useHandleStorage(handleId)
    await handleStorage?.matrixStore.destroy()
    await handleStorage?.secureCommsStore.closeStorage()
    this.handleStorageCache.delete(handleId)
  }

  async deleteHandleStorage(handleId: string): Promise<void> {
    const handleStorage = await this.useHandleStorage(handleId)
    await handleStorage?.matrixStore.destroy()
    await handleStorage?.secureCommsStore.closeStorage()
    await handleStorage?.secureCommsStore.destroyStorage()
    this.handleStorageCache.delete(handleId) // Remove from cache after deletion
  }
}
