/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import md5 from 'md5'

/**
 * Converts a hex string to a base64-encoded string.
 * Browser-compatible implementation.
 */
export function hexToBase64(hex: string): string {
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16)
  }
  let binary = ''
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

/**
 * Generates a base64-encoded MD5 hash of the input string, ArrayBuffer or Uint8Array.
 *
 * @param {string | ArrayBuffer | Uint8Array} input The input string/buffer to hash.
 * @returns The Base64-encoded MD5 hash.
 */
export function getBase64EncodedMd5Hash(
  input: string | ArrayBuffer | Uint8Array,
): string {
  let md5Input: string | number[]

  if (typeof input === 'string') {
    md5Input = input
  } else {
    const uint8Array =
      input instanceof Uint8Array ? input : new Uint8Array(input)
    md5Input = Array.from(uint8Array)
  }

  const hashHex = md5(md5Input)
  return hexToBase64(hashHex)
}
