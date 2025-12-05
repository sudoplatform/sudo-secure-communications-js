/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { DefaultLogger, Logger } from '@sudoplatform/sudo-common'
import * as JWT from 'jsonwebtoken'
import { v4 } from 'uuid'
import { HandleId, HandleStorage, StorageModule } from '../../../public'
import { SessionService } from '../../domain/entities/session/sessionService'
import { delay } from '../../util/delay'
import { MatrixClientManager } from '../common/matrixClientManager'

export class SessionManager {
  private readonly log: Logger

  private readonly sessions: Record<
    string,
    {
      accessToken: string
      storePassphrase?: string
      matrixClient: MatrixClientManager
    }
  > = {}

  public constructor(
    private readonly sessionService: SessionService,
    private readonly storageModule: StorageModule,
  ) {
    this.log = new DefaultLogger(this.constructor.name)
  }

  public async deleteSession(
    handleId: HandleId,
    deleteStorage: boolean = false,
  ) {
    const session = this.sessions[handleId.toString()]
    if (session) {
      // stop syncing matrix client
      await session.matrixClient.stopSyncing()
      // Flush any still existing background watchers
      await new Promise<void>((r) => setImmediate(r))

      // Drop session from store
      const handleStorage = await this.storageModule.useHandleStorage(
        handleId.toString(),
      )
      await handleStorage?.secureCommsStore.sessionAPIs.deleteAccessToken()
      // Close or destroy storage
      if (deleteStorage) {
        await session.matrixClient.clearRustCrypto(
          `matrix-js-sdk:${handleId.toString()}`,
        )
        await this.storageModule.deleteHandleStorage(handleId.toString())
      } else {
        await this.storageModule.closeHandleStorage(handleId.toString())
      }
      delete this.sessions[handleId.toString()]
    }
  }

  public async reset() {
    // Wait some time for background tasks to finish
    await delay(2000)
    const handleIds = Object.keys(this.sessions)
    for (const id of handleIds) {
      // Flush any still existing background watchers
      await new Promise<void>((r) => setImmediate(r))
      await this.deleteSession(new HandleId(id))
    }
  }

  public async getMatrixClient(
    handleId: HandleId,
  ): Promise<MatrixClientManager> {
    await this.ensureValidSession(handleId)
    return this.sessions[handleId.toString()]!.matrixClient!
  }

  // MARK: Access Tokens

  public async ensureValidSession(
    handleId: HandleId,
    storePassphrase?: string,
  ): Promise<string> {
    // check if we have a cached session for this handleId
    const cachedSession = this.sessions[handleId.toString()]

    const newStorePassphrase: string | undefined =
      cachedSession?.storePassphrase ?? storePassphrase ?? undefined

    let deviceId: string | undefined

    if (cachedSession) {
      const decoded = JWT.decode(cachedSession.accessToken) as Record<
        string,
        string
      >

      deviceId = decoded.device_id

      const expiry = parseInt(decoded.exp, 10)
      const now = Math.floor(Date.now() / 1000)
      const isExpiredOrExpiringSoon = expiry - now <= 300 // Check if the token has expired or will expire in 300 seconds

      if (
        !isExpiredOrExpiringSoon &&
        cachedSession.matrixClient.isUsingToken(cachedSession.accessToken)
      ) {
        return cachedSession.accessToken
      }

      // token is expired or different than matrix token. Refresh
      try {
        const newSession = await this.sessionService.get({
          handleId: handleId.toString(),
          deviceId: deviceId ?? v4(),
        })

        const newToken = newSession.token

        // update matrix client and session with new token
        cachedSession.matrixClient.updateAccessToken(newToken)
        this.sessions[handleId.toString()] = {
          accessToken: newToken,
          storePassphrase: newStorePassphrase,
          matrixClient: cachedSession.matrixClient,
        }

        // store session for future reloads
        const handleStorage = await this.storageModule.useHandleStorage(
          handleId.toString(),
          newStorePassphrase,
        )
        await handleStorage?.secureCommsStore.sessionAPIs.saveAccessToken(
          newToken,
        )

        return newToken
      } catch {
        // if refresh fails. clean up defunct matrix client and remove cached session
        await cachedSession.matrixClient.stopSyncing()
        delete this.sessions[handleId.toString()]
      }
    }

    // useHandleStorage will initialize the handle storage if it is not already initialized.
    const handleStorage = await this.storageModule.useHandleStorage(
      handleId.toString(),
      newStorePassphrase,
    )

    let accessToken: string

    // Retrieve access token from store if cached session does not exist
    const storedAccessToken =
      await handleStorage?.secureCommsStore.sessionAPIs.getAccessToken()

    if (storedAccessToken) {
      const decoded = JWT.decode(storedAccessToken) as Record<string, string>
      deviceId = decoded.device_id
      const expiry = parseInt(decoded.exp, 10)
      const now = Math.floor(Date.now() / 1000)
      const isExpiredOrExpiringSoon = expiry - now <= 300 // Check if the token has expired or will expire in 300 seconds

      if (!isExpiredOrExpiringSoon) {
        accessToken = storedAccessToken
      } else {
        // get new access token
        accessToken = (
          await this.sessionService.get({
            handleId: handleId.toString(),
            deviceId: deviceId ?? v4(),
          })
        ).token
      }
    } else {
      // get new access token
      accessToken = (
        await this.sessionService.get({
          handleId: handleId.toString(),
          deviceId: deviceId ?? v4(),
        })
      ).token
    }

    // Create a new matrix client
    const matrixClient = await this.createMatrixClient(
      handleId.toString(),
      accessToken,
      newStorePassphrase, // still pass this in - it will be used by RustCrypto.
      handleStorage,
    )

    this.sessions[handleId.toString()] = {
      accessToken: accessToken,
      storePassphrase: newStorePassphrase,
      matrixClient,
    }

    // store session for future reloads
    await handleStorage?.secureCommsStore.sessionAPIs.saveAccessToken(
      accessToken,
    )

    return accessToken
  }

  private async createMatrixClient(
    handleId: string,
    token: string,
    storePassphrase?: string,
    handleStorage?: HandleStorage,
  ): Promise<MatrixClientManager> {
    const decoded = JWT.decode(token) as Record<string, string>

    const client = new MatrixClientManager(token, decoded, handleStorage)

    if (typeof indexedDB !== 'undefined') {
      // use indexedDB if available (i.e., in browser or Node with polyfill)
      await client.initRustCrypto({
        useIndexedDB: true,
        cryptoDatabasePrefix: `matrix-js-sdk:${handleId}`,
        storagePassword: storePassphrase,
      } as any)
      // startup the matrix store to load persisted matrix data from the database
      await handleStorage?.matrixStore.startup()
    } else {
      // use memory store
      await client.initRustCrypto({
        useIndexedDB: false,
      } as any)
    }

    await client.signIn()

    return client
  }
}
