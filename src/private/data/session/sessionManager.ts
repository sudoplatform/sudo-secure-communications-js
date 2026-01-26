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
      refreshTimeout?: NodeJS.Timeout
    }
  > = {}

  public constructor(
    private readonly sessionService: SessionService,
    private readonly storageModule: StorageModule,
    private readonly autoRefreshTokenMinutesBeforeExpiration: number,
  ) {
    this.log = new DefaultLogger(this.constructor.name)
  }

  public async deleteSession(
    handleId: HandleId,
    deleteStorage: boolean = false,
  ) {
    const session = this.sessions[handleId.toString()]
    if (session) {
      // Clear any scheduled token refresh
      if (session.refreshTimeout) {
        clearTimeout(session.refreshTimeout)
      }
      // stop syncing matrix client
      await session.matrixClient.stopSyncing()
      // Flush any still existing background watchers
      await new Promise<void>((r) => setTimeout(r, 0))

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
      await new Promise<void>((r) => setTimeout(r, 0))
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
    const cachedSession = this.sessions[handleId.toString()]
    const newStorePassphrase: string | undefined =
      cachedSession?.storePassphrase ?? storePassphrase ?? undefined

    // Try to use cached session if valid
    if (cachedSession) {
      const validAccessToken = await this.tryUseCachedSession(
        handleId,
        cachedSession,
        newStorePassphrase,
      )
      if (validAccessToken) {
        return validAccessToken
      }
    }

    // Create new session from storage or fresh token
    return await this.createNewSession(handleId, newStorePassphrase)
  }

  private decodeToken(token: string): {
    decoded: Record<string, string>
    expiry: number
    deviceId: string
  } {
    const decoded = JWT.decode(token) as Record<string, string>
    if (!decoded || !decoded.exp || !decoded.device_id) {
      throw new Error('Invalid token')
    }
    const expiry = parseInt(decoded.exp, 10)
    const deviceId = decoded.device_id
    return { decoded, expiry, deviceId }
  }

  private isTokenExpired(expiry: number): boolean {
    const now = Math.floor(Date.now() / 1000)
    return expiry - now <= 0
  }

  private isTokenExpiringSoon(expiry: number): boolean {
    const now = Math.floor(Date.now() / 1000)
    const refreshThresholdSeconds =
      this.autoRefreshTokenMinutesBeforeExpiration * 60
    const timeUntilExpiry = expiry - now
    return timeUntilExpiry > 0 && timeUntilExpiry <= refreshThresholdSeconds
  }

  private isTokenExpiredOrExpiringSoon(expiry: number): boolean {
    return this.isTokenExpired(expiry) || this.isTokenExpiringSoon(expiry)
  }

  private scheduleTokenRefresh(
    handleId: HandleId,
    expiry: number,
    storePassphrase?: string,
  ): NodeJS.Timeout | undefined {
    const now = Math.floor(Date.now() / 1000)
    const timeUntilExpiry = expiry - now
    const refreshThresholdSeconds =
      this.autoRefreshTokenMinutesBeforeExpiration * 60
    const timeBeforeExpiryToSchedule = timeUntilExpiry - refreshThresholdSeconds

    // Only schedule refresh if auto-refresh is enabled and there's enough time until expiry
    // If auto-refresh is disabled (0) or less than the threshold, the token will not be auto refreshed.
    if (
      this.autoRefreshTokenMinutesBeforeExpiration > 0 &&
      timeBeforeExpiryToSchedule > 0
    ) {
      return setTimeout(async () => {
        try {
          await this.ensureValidSession(handleId, storePassphrase)
        } catch (error) {
          this.log.error(
            `Failed to refresh token for handle ${handleId.toString()}`,
            { err: error },
          )
        }
      }, timeBeforeExpiryToSchedule * 1000)
    }

    return undefined
  }

  // Test if the cached session is still valid.
  // Returns access token if it is still valid or can be refreshed.
  // Returns undefined if the token is expired or cannot be refreshed.
  private async tryUseCachedSession(
    handleId: HandleId,
    cachedSession: {
      accessToken: string
      storePassphrase?: string
      matrixClient: MatrixClientManager
      refreshTimeout?: NodeJS.Timeout
    },
    storePassphrase?: string,
  ): Promise<string | undefined> {
    const { expiry, deviceId } = this.decodeToken(cachedSession.accessToken)
    if (
      !this.isTokenExpiredOrExpiringSoon(expiry) &&
      cachedSession.matrixClient.isUsingToken(cachedSession.accessToken)
    ) {
      return cachedSession.accessToken
    }
    if (this.isTokenExpired(expiry)) {
      return await this.handleExpiredToken(handleId)
    }

    return await this.refreshCachedSessionToken(
      handleId,
      cachedSession,
      deviceId,
      storePassphrase,
    )
  }

  private async handleExpiredToken(handleId: HandleId): Promise<undefined> {
    this.log.debug(
      `Token expired for handle ${handleId.toString()}, cleaned up session`,
    )
    // Stop syncing the matrix client since token is expired
    await this.deleteSession(handleId)

    return undefined
  }

  private async refreshCachedSessionToken(
    handleId: HandleId,
    cachedSession: {
      accessToken: string
      storePassphrase?: string
      matrixClient: MatrixClientManager
      refreshTimeout?: NodeJS.Timeout
    },
    deviceId: string,
    storePassphrase?: string,
  ): Promise<string | undefined> {
    try {
      const newSession = await this.getAccessTokenFromService(
        handleId,
        deviceId,
      )
      const newToken = newSession.token
      const { expiry: newExpiry } = this.decodeToken(newToken)
      // Schedule new refresh timeout
      if (cachedSession.refreshTimeout) {
        clearTimeout(cachedSession.refreshTimeout)
      }
      const refreshTimeout = this.scheduleTokenRefresh(
        handleId,
        newExpiry,
        storePassphrase,
      )
      // Update matrix client and session with new token
      cachedSession.matrixClient.updateAccessToken(newToken)
      this.sessions[handleId.toString()] = {
        accessToken: newToken,
        storePassphrase: storePassphrase,
        matrixClient: cachedSession.matrixClient,
        refreshTimeout,
      }
      // Store session for future reloads
      const handleStorage = await this.storageModule.useHandleStorage(
        handleId.toString(),
        storePassphrase,
      )
      await handleStorage?.secureCommsStore.sessionAPIs.saveAccessToken(
        newToken,
      )

      return newToken
    } catch (error) {
      // If refresh fails, clean up defunct matrix client and remove cached session
      this.log.error(
        `Failed to refresh token for handle ${handleId.toString()}: ${error}`,
      )
      await this.deleteSession(handleId)

      return undefined
    }
  }

  private async getAccessTokenFromStorage(
    handleStorage: HandleStorage,
  ): Promise<
    | { token: string; deviceId: string; isValid: true }
    | { token: string; deviceId: string; isValid: false }
    | undefined
  > {
    const storedAccessToken =
      await handleStorage?.secureCommsStore.sessionAPIs.getAccessToken()

    if (!storedAccessToken) {
      return undefined
    }

    // Parse token once to check validity
    const { expiry, deviceId } = this.decodeToken(storedAccessToken)

    // If token is still valid (not expired and not expiring soon), use it
    if (!this.isTokenExpired(expiry) && !this.isTokenExpiringSoon(expiry)) {
      return {
        token: storedAccessToken,
        deviceId,
        isValid: true,
      }
    }

    // Token is expired or expiring soon, return it with isValid: false
    return {
      token: storedAccessToken,
      deviceId,
      isValid: false,
    }
  }

  private async getAccessTokenFromService(
    handleId: HandleId,
    deviceId?: string,
  ): Promise<{ token: string; deviceId: string }> {
    const newSession = await this.sessionService.get({
      handleId: handleId.toString(),
      deviceId: deviceId ?? v4(),
    })

    // Parse new token to get deviceId (in case deviceId wasn't provided)
    const { deviceId: tokenDeviceId } = this.decodeToken(newSession.token)

    return {
      token: newSession.token,
      deviceId: deviceId ?? tokenDeviceId,
    }
  }

  private async getAccessTokenFromStorageOrService(
    handleId: HandleId,
    handleStorage: HandleStorage,
  ): Promise<{ token: string; deviceId: string | undefined }> {
    // Try to get token from storage first
    const storedToken = await this.getAccessTokenFromStorage(handleStorage)
    if (storedToken?.isValid) {
      return {
        token: storedToken.token,
        deviceId: storedToken.deviceId,
      }
    }
    // Token not in storage or invalid/expired, get from service
    // Use deviceId from previously stored token if available
    const deviceId = storedToken?.deviceId
    const serviceToken = await this.getAccessTokenFromService(
      handleId,
      deviceId,
    )
    return {
      token: serviceToken.token,
      deviceId: serviceToken.deviceId,
    }
  }

  private async createNewSession(
    handleId: HandleId,
    storePassphrase?: string,
  ): Promise<string> {
    // useHandleStorage will initialize the handle storage if it is not already initialized
    const handleStorage = await this.storageModule.useHandleStorage(
      handleId.toString(),
      storePassphrase,
    )
    // Get access token from storage or service
    const { token: accessToken } =
      await this.getAccessTokenFromStorageOrService(handleId, handleStorage!)
    // Parse token once for both matrix client creation and refresh scheduling
    const { decoded, expiry } = this.decodeToken(accessToken)
    // Create a new matrix client
    const matrixClient = await this.createMatrixClient(
      handleId.toString(),
      accessToken,
      decoded,
      storePassphrase,
      handleStorage,
    )
    // Schedule token refresh before expiry
    const refreshTimeout = this.scheduleTokenRefresh(
      handleId,
      expiry,
      storePassphrase,
    )
    // Store session
    this.sessions[handleId.toString()] = {
      accessToken: accessToken,
      storePassphrase: storePassphrase,
      matrixClient,
      refreshTimeout,
    }
    await handleStorage?.secureCommsStore.sessionAPIs.saveAccessToken(
      accessToken,
    )

    return accessToken
  }

  private async createMatrixClient(
    handleId: string,
    token: string,
    decoded: Record<string, string>,
    storePassphrase?: string,
    handleStorage?: HandleStorage,
  ): Promise<MatrixClientManager> {
    const client = new MatrixClientManager(token, decoded, handleStorage)

    if (typeof indexedDB !== 'undefined') {
      // use indexedDB if available (i.e., in browser or Node with polyfill)
      const rustCryptoOptions = {
        useIndexedDB: true,
        cryptoDatabasePrefix: `matrix-js-sdk:${handleId}`,
        storagePassword: storePassphrase,
      }
      try {
        await client.initRustCrypto(rustCryptoOptions)
      } catch (error) {
        // Rust crypto may fail to init due to a changed device ID.
        // Clear rust crypto store to start fresh.
        indexedDB.deleteDatabase(`matrix-js-sdk:${handleId}::matrix-sdk-crypto`)
        await client.initRustCrypto(rustCryptoOptions)
      }

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
