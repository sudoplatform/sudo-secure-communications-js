/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { SecureCommsError } from '../../public'
import { PublicMediaType } from '../domain/entities/media/mediaCredentialEntity'

export function extractRoomId(mxcUrl: string, homeServer: string): string {
  const keyPrefix = extractObjectKeyPrefix(mxcUrl)
  return `!${keyPrefix}:${homeServer}`
}

export function extractPublicMediaType(
  mxcUrl: string,
): PublicMediaType | undefined {
  const keyPrefix = extractObjectKeyPrefix(mxcUrl)
  if (!keyPrefix) {
    return undefined
  }
  const fullPrefix = `${keyPrefix}/`
  if (Object.values(PublicMediaType).includes(fullPrefix as PublicMediaType)) {
    return fullPrefix as PublicMediaType
  }
  return undefined
}

export function extractObjectKeyPrefix(mxcUrl: string): string | undefined {
  try {
    const path = new URL(mxcUrl).pathname
    if (!path.includes('_')) {
      return undefined
    }
    return path.split('/')[1]?.split('_')[0] ?? undefined
  } catch {
    throw new SecureCommsError(`Invalid media URL: ${mxcUrl}`)
  }
}
