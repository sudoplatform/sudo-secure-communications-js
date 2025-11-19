/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import * as fs from 'fs'
import { DefaultApiClientManager } from '@sudoplatform/sudo-api-client'
import {
  DefaultConfigurationManager,
  DefaultLogger,
} from '@sudoplatform/sudo-common'
import {
  DefaultSudoUserClient,
  SudoUserClient,
  TESTAuthenticationProvider,
} from '@sudoplatform/sudo-user'
import { v4 } from 'uuid'
import { ApiClient } from '../../../src/private/data/common/apiClient'
import { PrivateSecureCommsClientOptions } from '../../../src/private/data/common/privateSecureCommsClientOptions'
import {
  DefaultSecureCommsClient,
  SecureCommsClient,
} from '../../../src/public/secureCommsClient'

// [START] - Polyfills
global.fetch = require('node-fetch')
require('isomorphic-fetch')
// [END] - Polyfills

// eslint-disable-next-line @typescript-eslint/no-var-requires
global.crypto = require('crypto').webcrypto

export const userOwnerIssuer = 'sudoplatform.identityservice'

const configFile = 'config/sudoplatformconfig.json'
const registerKeyFile = 'config/register_key.private'
const registerKeyIdFile = 'config/register_key.id'
const registerKey = fs.readFileSync(registerKeyFile).toString()
const registerKeyId = fs.readFileSync(registerKeyIdFile).toString().trim()

const testAuthenticationProvider = new TESTAuthenticationProvider(
  'scs-js-test',
  registerKey,
  registerKeyId,
)

export function setupSudoPlatformConfig(log: DefaultLogger) {
  try {
    DefaultConfigurationManager.getInstance().setConfig(
      fs.readFileSync(configFile).toString(),
    )
  } catch (err) {
    log.error(`${setupSudoPlatformConfig.name} FAILED`)
    console.log(`${setupSudoPlatformConfig.name} FAILED`)
    throw err
  }
}

export interface SetupSecureCommsClientOutput {
  secureCommsClient: SecureCommsClient
  userClient: SudoUserClient
  apiClient: ApiClient
  subject?: string
}

export const setupSecureCommsClient = async (
  log: DefaultLogger,
): Promise<SetupSecureCommsClientOutput> => {
  try {
    setupSudoPlatformConfig(log)

    const userClient = new DefaultSudoUserClient({
      logger: log,
    })
    const username = await userClient
      .registerWithAuthenticationProvider(
        testAuthenticationProvider,
        `scs-JS-SDK-${v4()}`,
      )
      .catch((err) => {
        console.log('Error registering user', { err })
        throw err
      })
    log.debug('username', { username })
    await userClient.signInWithKey().catch((err) => {
      console.log('Error signing in', { err })
      throw err
    })
    const subject = await userClient.getSubject()

    const apiClientManager =
      DefaultApiClientManager.getInstance().setAuthClient(userClient)

    const apiClient = new ApiClient(apiClientManager)
    const options: PrivateSecureCommsClientOptions = {
      sudoUserClient: userClient,
      apiClient,
    }

    const secureCommsClient = new DefaultSecureCommsClient(options)
    await secureCommsClient.reset().catch((err) => {
      console.log('Error resetting secure comms client', { err })
      throw err
    })

    return {
      secureCommsClient,
      userClient,
      apiClient,
      subject,
    }
  } catch (err) {
    log.error(`${setupSecureCommsClient.name} FAILED`)
    console.log(`${setupSecureCommsClient.name} FAILED`)
    throw err
  }
}
