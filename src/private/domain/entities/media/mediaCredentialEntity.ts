/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Core entity representation of a credential for granting client S3 bucket access.
 *
 * @interface CredentialEntity
 * @property {string} accessKeyId The identifier of the access key used as part of S3 client initialization.
 * @property {string} secretAccessKey The secret access key used as part of S3 client initialization.
 * @property {string} sessionToken The session token used as part of S3 client initialization.
 */
interface CredentialEntity {
  accessKeyId: string
  secretAccessKey: string
  sessionToken: string
}

/**
 * Core entity representation of a media credential for granting client S3 bucket access.
 *
 * @interface MediaCredentialEntity
 * @property {string} accessKeyId See {@link CredentialEntity.accessKeyId}.
 * @property {string} secretAccessKey See {@link CredentialEntity.secretAccessKey}.
 * @property {string} sessionToken See {@link CredentialEntity.sessionToken}.
 * @property {string} bucket The name of the S3 bucket where the media resides.
 * @property {string} region The region in which the bucket resides.
 * @property {string} keyPrefix Optional object key prefix representing the type of media.
 * @property {boolean} forWrite Whether this credential allows writing to the bucket.
 */
export interface MediaCredentialEntity extends CredentialEntity {
  bucket: string
  region: string
  keyPrefix?: string
  forWrite: boolean
}

/**
 * Core entity representation of a media credential for room scoped S3 bucket access.
 *
 * @interface RoomMediaCredentialEntity
 * @property {string} accessKeyId See {@link CredentialEntity.accessKeyId}.
 * @property {string} secretAccessKey See {@link CredentialEntity.secretAccessKey}.
 * @property {string} sessionToken See {@link CredentialEntity.sessionToken}.
 * @property {string} keyPrefix The key prefix of the S3 object.
 * @property {number} expiry Time in milliseconds since epoch that the credential will expire.
 */
export interface RoomMediaCredentialEntity extends CredentialEntity {
  keyPrefix: string
  expiry: number
}

/**
 * An enumeration representing the type of public media.
 *
 * @enum
 */
export enum PublicMediaType {
  AVATARS = 'avatars/',
  MEDIA = 'media/',
}
