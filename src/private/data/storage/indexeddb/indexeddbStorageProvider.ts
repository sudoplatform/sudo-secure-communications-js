/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { DefaultLogger, Logger } from '@sudoplatform/sudo-common'
import { IDBPDatabase, openDB as openIndexedDB } from 'idb'
import { IndexedDBStore } from 'matrix-js-sdk/lib/matrix'
import { StorageProvider } from '../../../../public'

export class IndexedDBStorageProvider implements StorageProvider {
  private readonly log: Logger
  private readonly dbName: string
  private readonly _matrixStore: IndexedDBStore

  private db?: IDBPDatabase

  private static readonly migrations: ((db: IDBPDatabase) => void)[] = [
    (db) => {
      db.createObjectStore('session')
    },
    // Add migrations here.
    // DO NOT change existing migration.
  ]

  constructor(handleId: string) {
    // initialize the matrix-js-sdk indexeddb store
    this._matrixStore = new IndexedDBStore({
      dbName: handleId,
      indexedDB,
      localStorage,
    })
    this._matrixStore.startup()
    // initialize the secure-comms indexeddb store
    this.dbName = 'secure-comms:' + handleId
    this.log = new DefaultLogger(this.constructor.name)
  }

  get matrixStore(): IndexedDBStore {
    return this._matrixStore
  }

  async openDB(): Promise<void> {
    // create a new database if not exist and migrate to latest version
    this.db = await openIndexedDB(
      this.dbName,
      IndexedDBStorageProvider.migrations.length,
      {
        upgrade: (db: IDBPDatabase, oldVersion: number) => {
          IndexedDBStorageProvider.migrations.forEach((migration, index) => {
            if (oldVersion <= index) migration(db)
          })
        },
      },
    )
  }

  async closeDB(): Promise<void> {
    if (this.db) {
      this.db.close()
      this.db = undefined
    }
  }

  async destroyDB(): Promise<void> {
    this.closeDB()
    indexedDB.deleteDatabase(this.dbName)
  }

  private ensureDbOpen(): void {
    if (!this.db) {
      const err = new Error('database not open')
      this.log.error(err.message)
      throw err
    }
  }

  async createItem(store: string, key: string, value: any): Promise<void> {
    this.ensureDbOpen()
    await this.db!.put(store, value, key)
  }

  async getItem<T>(store: string, key: string): Promise<T | undefined> {
    this.ensureDbOpen()
    const item = await this.db!.get(store, key)
    if (item === null || item === undefined) {
      return undefined
    }
    return item as T
  }

  async getItems<T>(
    store: string,
    key: string,
    limit?: number,
    offset?: number,
  ): Promise<T[]> {
    this.ensureDbOpen()
    let items = await this.db!.get(store, key)
    if (items === null || items === undefined) {
      return []
    }
    if (items instanceof Array) {
      if (offset !== null) {
        items = items.slice(offset)
      }
      if (limit !== null) {
        items = items.slice(0, limit)
      }
      return items as T[]
    }
    return [items as T]
  }

  async updateItem(store: string, key: string, value: any): Promise<void> {
    this.ensureDbOpen()
    await this.db!.put(store, value, key)
  }

  async deleteItem(store: string, key: string): Promise<void> {
    this.ensureDbOpen()
    await this.db!.delete(store, key)
  }
}
