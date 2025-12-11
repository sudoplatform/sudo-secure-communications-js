/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

export class SecureCommsError extends Error {
  constructor(msg?: string) {
    super(msg)
    this.name = this.constructor.name
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor)
    }
  }
}

export class InternalError extends Error {
  constructor(msg: string) {
    super(msg)
  }
}

export class InvalidArgumentError extends SecureCommsError {
  constructor(msg?: string) {
    super(msg)
  }
}

export class UnauthorizedError extends SecureCommsError {
  constructor(msg?: string) {
    super(msg)
  }
}

export class UnacceptableWordsError extends SecureCommsError {
  constructor(msg?: string) {
    super(msg)
  }
}

export class HandleNotAvailableError extends SecureCommsError {
  constructor(msg?: string) {
    super(msg)
  }
}

export class HandleNotFoundError extends SecureCommsError {
  constructor(msg?: string) {
    super(msg)
  }
}

export class InvalidHandleNameError extends SecureCommsError {
  constructor(msg?: string) {
    super(msg)
  }
}

export class InvalidHandleIdError extends SecureCommsError {
  constructor(msg?: string) {
    super(msg)
  }
}

export class AliasNotAvailableError extends SecureCommsError {
  constructor(msg?: string) {
    super(msg)
  }
}

export class ChannelNotFoundError extends SecureCommsError {
  constructor(msg?: string) {
    super(msg)
  }
}

export class ChannelNameNotAvailableError extends SecureCommsError {
  constructor(msg?: string) {
    super(msg)
  }
}

export class InvalidChannelStateError extends SecureCommsError {
  constructor(msg?: string) {
    super(msg)
  }
}

export class InvalidChannelAliasError extends SecureCommsError {
  constructor(msg?: string) {
    super(msg)
  }
}

export class RoomNotFoundError extends SecureCommsError {
  constructor(msg?: string) {
    super(msg)
  }
}

export class PermissionDeniedError extends SecureCommsError {
  constructor(msg?: string) {
    super(msg)
  }
}

export class NotAllowedError extends SecureCommsError {
  constructor(msg?: string) {
    super(msg)
  }
}

export class DirectChatExistsError extends SecureCommsError {
  constructor(msg?: string) {
    super(msg)
  }
}

export class DirectChatMembershipError extends SecureCommsError {
  constructor(msg?: string) {
    super(msg)
  }
}

export class SecureCommsServiceConfigNotFoundError extends SecureCommsError {
  constructor(msg?: string) {
    super(msg)
  }
}

/**
 * Error when uploading a file to S3.
 */
export class S3UploadError extends SecureCommsError {
  constructor(msg?: string) {
    super(msg)
  }
}

/**
 * Error when downloading a file from S3.
 */
export class S3DownloadError extends SecureCommsError {
  constructor(msg?: string) {
    super(msg)
  }
}
