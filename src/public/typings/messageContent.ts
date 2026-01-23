/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { IEvent, PollKind } from 'matrix-js-sdk'
import { EncryptedFile } from 'matrix-js-sdk/lib/types'
import { Handle } from './handle'
import { AudioMedia, FileMedia, ImageMedia, VideoMedia } from './mediaInfo'
import { MembershipState } from './member'

/**
 * Union type encompassing all possible message content types.
 */
export type MessageContent =
  // base
  | BaseMessageContent
  | EncryptedMessage
  | RedactedMessage
  | SelfDestructedMessage
  | EditedMessage
  // self destructibles
  | Text
  | Emote
  | Notice
  | Image
  | Video
  | Audio
  | File
  | Location
  | Poll
  | PollResponse
  | KeyVerificationRequest
  | MembershipChange
  
// MARK: BaseMessages

/**
 * Base message content.
 * 
 * @interface BaseMessageContent
 * @property {string} type The type of the message content.
 * @property {boolean} isEdited True if this message has been edited by the sender, false if not.
 * @property {string} threadId The thread ID of the message (if this message is in a thread).
 * @property {string} repliedToMessageId The message ID of the message this message is replying to (if this message is a reply).
 */
export interface BaseMessageContent {
  type: string
  isEdited: boolean
  threadId?: string
  repliedToMessageId?: string
}

/**
 * Key verification request message content.
 * 
 * @interface KeyVerificationRequest
 * @property {string} body The body of the key verification request.
 * @property {string} fromDevice The device ID of the sender.
 * @property {string[]} methods The methods of the key verification request.
 * @property {number} timestamp The timestamp of the key verification request.
 */
export interface KeyVerificationRequest extends BaseMessageContent {
    body: string
    fromDevice: string
    methods: string[]
    timestamp: number
}

/**
 * Redacted message content. Messages of this type have had their prevous content
 * redacted by the sender or a chat moderator.
 * 
 * @interface RedactedMessage
 * @property {IEvent} redactedBecause The event that redacted the message.
 */
export interface RedactedMessage extends BaseMessageContent {
  redactedBecause: IEvent
}

/**
 * Self-destructed message content. Messages of this type have had their previous content
 * removed due to "self-destructing" after their expiry time.
 * 
 * @interface SelfDestructedMessage
 */
export interface SelfDestructedMessage extends BaseMessageContent {}

/**
 * A user membership change message content.
 * 
 * @interface MembershipChange
 * @property {MembershipState} state The new membership state.
 * @property {Handle} handle The handle of the user whose membership state has changed.
 */
export interface MembershipChange extends BaseMessageContent {
  state: MembershipState
  handle: Handle
}

/**
 * Interface for messages that can self-destruct.
 * 
 * @interface SelfDestructible
 * @property {SelfDestructInfo} selfDestructInfo Self-destructing properties of a message.
 */
export interface SelfDestructible extends BaseMessageContent {
  selfDestructInfo?: SelfDestructInfo
}

/**
 * Edited message content. Messages of this type have replaced the original message.
 * 
 * @interface EditedMessage
 * @property {string} originalEventId The ID of the original message that was edited.
 */
export interface EditedMessage extends BaseMessageContent {
  originalEventId?: string
}

// MARK: SelfDestructibles

/**
 * Emote message content.
 * 
 * @interface Emote
 * @property {string} emote The emote content.
 */
export interface Emote extends SelfDestructible {
  emote: string
}

/**
 * Notice message content.
 * 
 * @interface Notice
 * @property {string} notice The notice content.
 */
export interface Notice extends SelfDestructible {
  notice: string
}

/**
 * Text message content.
 * 
 * @interface Text
 * @property {string} text The message text.
 */
export interface Text extends SelfDestructible {
  text: string
}

/**
 * Image message content.
 * 
 * @interface Image
 * @property {string} caption Optional caption text for the image.
 * @property {string} uri The URI of the image.
 * @property {ImageMedia} info The image information.
 * @property {string} thumbnailUri The URI of the thumbnail image.
 * @property {ThumbnailInfo} thumbnailInfo The thumbnail image information.
 * @property {EncryptedFile} encryptedFile The encrypted file information.
 */
export interface Image extends SelfDestructible {
  caption?: string
  uri: string
  info: ImageMedia
  thumbnailUri: string
  thumbnailInfo: ThumbnailInfo
  encryptedFile?: EncryptedFile
}

/**
 * Video message content.
 * 
 * @interface Video
 * @property {string} caption Optional caption text for the video.
 * @property {string} uri The URI of the video.
 * @property {VideoMedia} info The video information.
 * @property {string} thumbnailUri The URI of the thumbnail image.
 * @property {ThumbnailInfo} thumbnailInfo The thumbnail image information. 
 * @property {EncryptedFile} encryptedFile The encrypted file information.
 */
export interface Video extends SelfDestructible {
  caption?: string
  uri: string
  info: VideoMedia
  thumbnailUri: string
  thumbnailInfo: ThumbnailInfo
  encryptedFile?: EncryptedFile
}

/**
 * Audio message content.
 * 
 * @interface Audio
 * @property {string} uri The URI of the audio file.
 * @property {AudioMedia} info The audio information.
 * @property {EncryptedFile} encryptedFile The encrypted file information.
 */
export interface Audio extends SelfDestructible {
  uri: string
  info: AudioMedia
  encryptedFile?: EncryptedFile
}

/**
 * File message content.
 * 
 * @interface File
 * @property {string} uri The URI of the file.
 * @property {FileMedia} info The file information.
 * @property {EncryptedFile} encryptedFile The encrypted file information.
 */
export interface File extends SelfDestructible {
  uri: string
  info: FileMedia
  encryptedFile?: EncryptedFile
}

/**
 * Location message content.
 * 
 * @interface Location
 * @property {string} description The description of the location.
 * @property {string} geoUri The geo URI of the location.
 */
export interface Location extends SelfDestructible {
  description: string
  geoUri: string
}

// MARK: Polls

/**
 * Poll message content.
 * 
 * @interface Poll
 * @property {PollKind} kind The kind of poll, disclosed or undisclosed.
 * @property {string} question The question of the poll.
 * @property {string[]} answers The answers of the poll.
 * @property {number} maxSelections The maximum number of selections for the poll.
 */
export interface Poll extends SelfDestructible {
  kind: PollKind
  question: string
  answers: string[]
  maxSelections: number
}

/**
 * Poll response message content.
 * 
 * @interface PollResponse
 * @property {string} pollId The ID of the poll start event.
 * @property {string[]} answers The answers of the poll response.
 */
export interface PollResponse extends SelfDestructible {
  pollId: string
  answers: string[]
}

/**
 * Encrypted message content. Messages of this type are unable to be decrypted by this client.
 * 
 * @interface EncryptedMessage
 */
export interface EncryptedMessage extends SelfDestructible {}

// MARK: InfoTypes

 /**
  * Information about a thumbnail image.
  * 
  * @interface ThumbnailInfo
  * @property {number} width The width of the thumbnail in pixels.
  * @property {number} height The height of the thumbnail in pixels.
  * @property {string} blurHash The blur hash of the thumbnail. See [https://blurha.sh/](https://blurha.sh/).
  * @property {string} mimeType The MIME type of the thumbnail.
  * @property {number} size The size of the thumbnail in bytes.
  */
 export interface ThumbnailInfo{
  width: number,
  height: number,
  blurHash: string,
  mimeType: string,
  size: number,
 }

/**
 * Self-destruct information for a message.
 * 
 * @interface SelfDestructInfo
 * @property {number} clientDuration The length of time this message should be available.
 *  If undefined, the message should be available indefinitely.
 * @property {number} clientExpiry The client-side expiry time of this message.
 * @property {number} serverExpiry The expiry time of this message on the server. After this time, the
 *  server removes the contents of the message.
 */
export interface SelfDestructInfo {
  clientDuration?: number
  clientExpiry?: number
  serverExpiry?: number
}
