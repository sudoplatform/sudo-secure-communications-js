/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Union type encompassing all metadata types for media content messages.
 */
export type MediaInfo =
  | ImageMedia
  | VideoMedia
  | AudioMedia
  | FileMedia

/**
 * Interface representing metadata for media content messages.
 * 
 * @interface BaseMediaInfo
 * @property {string} mimeType The MIME type of the media.
 * @property {number} size The size of the media in bytes.
 * @property {string} filename The filename of the media.
 */
interface BaseMediaInfo {
  mimeType: string
  size: number
  filename: string
}

/**
 * Information about an image.
 * 
 * @interface ImageMedia
 * @property {number} width The width of the image in pixels.
 * @property {number} height The height of the image in pixels.
 */
export interface ImageMedia extends BaseMediaInfo {
  width: number
  height: number
}

/**
 * Information about a video.
 * 
 * @interface VideoMedia
 * @property {number} width The width of the image in pixels.
 * @property {number} height The height of the image in pixels.
 * @property {number} duration The duration of the video.
 */
export interface VideoMedia extends BaseMediaInfo {
  width: number
  height: number
  duration: number
}

/**
 * Information about an audio file.
 * 
 * @interface AudioMedia
 * @property {number} duration The duration of the audio.
 */
export interface AudioMedia extends BaseMediaInfo {
  duration: number
}

/**
 * Information about a file.
 * 
 * @interface FileMedia
 */
export interface FileMedia extends BaseMediaInfo {}
