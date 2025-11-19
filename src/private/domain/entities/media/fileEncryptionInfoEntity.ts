/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Core entity representation of the information used to encrypt a file.
 *
 * @interface FileEncryptionInfoEntity
 * @property {any} key A web key object containing the key used to encrypt.
 * @property {string} iv The 128-bit unique initialization vector used by AES-CTR, encoded as unpadded base64.
 * @property {string} v The optional version of the encrypted payload protocol.
 * @property {HashAlgorithm} hashes A map from an algorithm name to a hash of the ciphertext, encoded as unpadded base64.
 *  Clients should support the SHA-256 hash, which uses the key sha256.
 */
export interface FileEncryptionInfoEntity {
  key: any
  iv: string
  v?: string
  hashes?: {
    sha256?: string
  }
}
