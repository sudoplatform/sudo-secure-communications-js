/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  AppSyncError,
  DefaultLogger,
  Logger,
  NotRegisteredError,
  ServiceError,
  mapGraphQLToClientError,
} from '@sudoplatform/sudo-common'
import {
  AliasNotAvailableError,
  ChannelNameNotAvailableError,
  ChannelNotFoundError,
  HandleNotAvailableError,
  HandleNotFoundError,
  InvalidArgumentError,
  InvalidChannelAliasError,
  InvalidChannelStateError,
  InvalidHandleError,
  NotAllowedError,
} from '../../../../public/errors'

export class ErrorTransformer {
  private readonly log: Logger

  constructor() {
    this.log = new DefaultLogger(this.constructor.name)
  }

  toClientError(error: AppSyncError): Error {
    this.log.debug('GraphQL call failed', { error })
    switch (error.errorType) {
      case 'sudoplatform.securecomms.IdentityContextMissing':
        return new NotRegisteredError(error.message)
      case 'sudoplatform.ServiceError':
        return new ServiceError(error.message)
      case 'sudoplatform.InvalidArgumentError':
        return new InvalidArgumentError(error.message)
      case 'sudoplatform.securecomms.HandleNotAvailable':
        return new HandleNotAvailableError(error.message)
      case 'sudoplatform.securecomms.HandleNotFound':
        return new HandleNotFoundError(error.message)
      case 'sudoplatform.securecomms.InvalidHandleName':
        return new InvalidHandleError(error.message)
      case 'sudoplatform.securecomms.AliasNotAvailable':
        return new AliasNotAvailableError(error.message)
      case 'sudoplatform.securecomms.NameNotAvailable':
        return new ChannelNameNotAvailableError(error.message)
      case 'sudoplatform.securecomms.InvalidRoomAlias':
        return new InvalidChannelAliasError(error.message)
      case 'sudoplatform.securecomms.ChannelNotFound':
        return new ChannelNotFoundError(error.message)
      case 'sudoplatform.securecomms.InvalidChannelState':
        return new InvalidChannelStateError(error.message)
      case 'sudoplatform.securecomms.NotAllowed':
        return new NotAllowedError(error.message)
      default:
        return mapGraphQLToClientError(error)
    }
  }
}
