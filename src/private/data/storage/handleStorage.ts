/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { DefaultLogger, Logger } from '@sudoplatform/sudo-common'
import { IStore } from 'matrix-js-sdk/lib/store'
import { DefaultSecureCommsStore } from './secureCommsStore'
import { HandleStorage, StorageProvider } from '../../../public'
import { SecureCommsStore } from '../../../public'

export class DefaultHandleStorage implements HandleStorage {
  private readonly log: Logger

  private readonly storageProvider: StorageProvider
  private readonly _secureCommsStore: SecureCommsStore

  constructor(storageProvider: StorageProvider) {
    this.log = new DefaultLogger(this.constructor.name)
    this.storageProvider = storageProvider
    this._secureCommsStore = new DefaultSecureCommsStore(storageProvider)
  }

  public get matrixStore(): IStore {
    return this.storageProvider.matrixStore
  }

  public get secureCommsStore(): SecureCommsStore {
    return this._secureCommsStore
  }
}
