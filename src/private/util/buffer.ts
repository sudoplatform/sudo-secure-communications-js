/**
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

export function arrayBufferToString(buf: ArrayBuffer): string {
  return new TextDecoder().decode(buf)
}

export function stringToArrayBuffer(str: string): ArrayBuffer {
  return new TextEncoder().encode(str).buffer
}
