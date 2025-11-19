/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Core entity representation of information associated with a thumbnail image.
 *
 * @interface ThumbnailInfoEntity
 * @property {number} width The width of the thumbnail in pixels.
 * @property {number} height The height of the thumbnail in pixels.
 * @property {string} blurHash The blur hash of the thumbnail. See [https://blurha.sh/](https://blurha.sh/).
 * @property {string} mimeType The MIME type of the thumbnail.
 * @property {number} size The size of the thumbnail in bytes.
 */
export interface ThumbnailInfoEntity {
  width: number
  height: number
  blurHash: string
  mimeType: string
  size: number
}
