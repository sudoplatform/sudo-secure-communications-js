/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { DefaultLogger, Logger } from '@sudoplatform/sudo-common'
import { StorageProvider } from '../../../public'
import { SecureCommsStore } from '../../../public'

/**
 * SessionAPIs is a collection of APIs for session storage.
 *
 * @interface SessionAPIs - used by secure comms SDK
 * @property {getAccessToken} getAccessToken - get the access token
 * @property {saveAccessToken} saveAccessToken - save the access token
 * @property {deleteAccessToken} deleteAccessToken - delete the access token
 */
export interface SessionAPIs {
  /**
   * Get the access token
   * @returns {Promise<string | undefined>} - the access token
   */
  getAccessToken(): Promise<string | undefined>

  /**
   * Save the access token
   * @param {string} accessToken - the access token
   */
  saveAccessToken(accessToken: string): Promise<void>

  /**
   * Delete the access token
   */
  deleteAccessToken(): Promise<void>
}

export class DefaultSecureCommsStore implements SecureCommsStore {
  private readonly log: Logger
  private readonly storageProvider: StorageProvider

  constructor(storageProvider: StorageProvider) {
    this.log = new DefaultLogger(this.constructor.name)
    this.storageProvider = storageProvider
  }

  async closeStorage(): Promise<void> {
    await this.storageProvider.closeDB()
  }

  async destroyStorage(): Promise<void> {
    await this.storageProvider.destroyDB()
  }

  sessionAPIs: SessionAPIs = {
    getAccessToken: async () => {
      const storedSessions = await this.storageProvider.getItem<
        string | undefined
      >('session', 'accessToken')
      return storedSessions
    },

    saveAccessToken: async (accessToken) => {
      await this.storageProvider.updateItem(
        'session',
        'accessToken',
        accessToken,
      )
    },

    deleteAccessToken: async () => {
      await this.storageProvider.deleteItem('session', 'accessToken')
    },
  }
}
