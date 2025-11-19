/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { internal as SudoUserInternal } from '@sudoplatform/sudo-user'
import { ApiClient } from './apiClient'
import { SecureCommsServiceConfig } from './config'
import { SecureCommsClientOptions } from '../../../public/secureCommsClient'

/**
 * Private DefaultSecureCommsClient for describing private options
 * for supporting unit testing.
 */
export type PrivateSecureCommsClientOptions = {
  apiClient?: ApiClient
  identityServiceConfig?: SudoUserInternal.IdentityServiceConfig
  secureCommsServiceConfig?: SecureCommsServiceConfig
} & SecureCommsClientOptions
