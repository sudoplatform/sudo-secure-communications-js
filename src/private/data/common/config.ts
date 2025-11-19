/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { DefaultConfigurationManager } from '@sudoplatform/sudo-common'
import * as t from 'io-ts'
import { SecureCommsServiceConfigNotFoundError } from '../../../public/errors'

const SecureCommsServiceConfigCodec = t.type({
  region: t.string,
  serviceEndpointUrl: t.string,
  homeServer: t.string,
  advancedSearchEnabled: t.boolean,
  roomMediaBucket: t.string,
  publicMediaBucket: t.string,
})

export type SecureCommsServiceConfig = t.TypeOf<
  typeof SecureCommsServiceConfigCodec
>

export const getSecureCommsServiceConfig = (): SecureCommsServiceConfig => {
  if (
    !DefaultConfigurationManager.getInstance().getConfigSet(
      'secureCommsService',
    )
  ) {
    throw new SecureCommsServiceConfigNotFoundError()
  }

  return DefaultConfigurationManager.getInstance().bindConfigSet<SecureCommsServiceConfig>(
    SecureCommsServiceConfigCodec,
    'secureCommsService',
  )
}
