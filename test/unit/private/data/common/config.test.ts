/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { DefaultConfigurationManager } from '@sudoplatform/sudo-common'
import {
  SecureCommsServiceConfig,
  getSecureCommsServiceConfig,
} from '../../../../../src/private/data/common/config'
import { SecureCommsServiceConfigNotFoundError } from '../../../../../src/public/errors'

describe('Config Test Suite', () => {
  const secureCommsServiceConfig: SecureCommsServiceConfig = {
    region: 'region',
    serviceEndpointUrl: 'service-endpoint-url',
    homeServer: 'home-server',
    advancedSearchEnabled: true,
    roomMediaBucket: 'room-media-bucket',
    publicMediaBucket: 'public-media-bucket',
  }

  describe('getSecureCommsServiceConfig', () => {
    it('should throw a SecureCommsServiceConfigNotFoundError if config has no secureCommsService stanza', () => {
      DefaultConfigurationManager.getInstance().setConfig(JSON.stringify({}))
      expect(() => getSecureCommsServiceConfig()).toThrow(
        SecureCommsServiceConfigNotFoundError,
      )
    })

    it('should return config if secureCommsService stanza is present', () => {
      DefaultConfigurationManager.getInstance().setConfig(
        JSON.stringify({ secureCommsService: secureCommsServiceConfig }),
      )
      expect(getSecureCommsServiceConfig()).toEqual(secureCommsServiceConfig)
    })
  })
})
