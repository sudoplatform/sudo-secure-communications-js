/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { DefaultLogger, Logger } from '@sudoplatform/sudo-common'
import { IEncryptedFile, decryptAttachment } from 'matrix-encrypt-attachment'
import {
  CryptoApi,
  CryptoEvent,
  DeviceVerificationStatus,
  GeneratedSecretStorageKey,
  UserVerificationStatus,
  VerificationRequest,
} from 'matrix-js-sdk/lib/crypto-api'
import {
  decodeRecoveryKey,
  encodeRecoveryKey,
} from 'matrix-js-sdk/lib/crypto-api/recovery-key'
import {
  DeviceVerification,
  Direction,
  EventType,
  ICreateRoomOpts,
  IEvent,
  IPublicRoomsChunkRoom,
  IPushRules,
  KnownMembership,
  M_POLL_END,
  M_POLL_RESPONSE,
  M_POLL_START,
  MatrixError,
  MatrixEvent,
  Method,
  MsgType,
  PollKind,
  Preset,
  PushRuleAction,
  PushRuleCondition,
  PushRuleKind,
  RelationType,
  Room,
  Visibility,
} from 'matrix-js-sdk/lib/matrix'
import {
  MSC3575List,
  MSC3575_STATE_KEY_LAZY,
  SlidingSync,
} from 'matrix-js-sdk/lib/sliding-sync'
import {
  RoomAvatarEventContent,
  RoomMessageEventContent,
  RoomPowerLevelsEventContent,
} from 'matrix-js-sdk/lib/types'
import { getSecureCommsServiceConfig } from './config'
import { MatrixClient, createClient } from './matrixTypes'
import {
  HandleId,
  HandleNotFoundError,
  MembershipChange,
  Recipient,
  RoomNotFoundError,
  SecureCommsError,
  UnauthorizedError,
} from '../../../public'
import { HandleStorage } from '../../../public/modules/storageModule'
import { Message } from '../../../public/typings'
import { PowerLevelsEntity } from '../../domain/entities/common/powerLevelsEntity'
import {
  DirectChatPermissionsEntity,
  DirectChatRoleEntity,
} from '../../domain/entities/directChats/directChatEntity'
import { ChatSummaryEntity } from '../../domain/entities/messaging/chatSummaryEntity'
import {
  MessageEntity,
  MessageReactionEntity,
  MessageReceiptEntity,
} from '../../domain/entities/messaging/messageEntity'
import {
  ListMessagesOutput,
  SearchMessagesOutput,
} from '../../domain/entities/messaging/messagingService'
import { PollResponsesEntity } from '../../domain/entities/messaging/pollEntity'
import { CustomRoomType } from '../../domain/entities/rooms/roomEntity'
import { DirectChatPowerLevelsTransformer } from '../directChats/transformer/directChatPowerLevelsTransformer'
import { MessageReceiptTransformer } from '../messaging/transformer/messageReceiptTransformer'
import { MessageTransformer } from '../messaging/transformer/messageTransformer'
import { SearchMessagesItemTransformer } from '../messaging/transformer/searchMessagesItemTransformer'
import { RoomPowerLevelsTransformer } from '../rooms/transformer/roomPowerLevelsTransformer'

const SLIDING_SYNC_TIMEOUT_MS = 30000
const SLIDING_SYNC_TIMELINE_LIMIT = 20
const SLIDING_SYNC_REQUIRED_STATE = [
  [EventType.RoomName, ''],
  [EventType.RoomAvatar, ''],
  [EventType.RoomTopic, ''],
  [EventType.RoomPowerLevels, ''],
  [EventType.RoomMember, MSC3575_STATE_KEY_LAZY],
  [EventType.RoomJoinRules, ''],
  [EventType.RoomCanonicalAlias, ''],
  [EventType.RoomEncryption, ''],
  [EventType.RoomMessage, ''],
  [EventType.RoomPinnedEvents, ''],
  [EventType.Reaction, ''],
  [EventType.RoomRedaction, ''],
  [EventType.PollStart, ''],
]

export enum CustomMatrixEvents {
  TYPE = 'com.sudoplatform.secure-comms.type',
  TAGS = 'com.sudoplatform.secure-comms.channel.tags',
}
interface SearchRoomsOutput {
  chunk: IPublicRoomsChunkRoom[]
  next_batch?: string
  prev_batch?: string
  total_room_count_estimate?: number
}

interface RoomMemberOutput {
  roomId: string
  userId: string
  displayName?: string
  membership?: string
}

// Logger interface extension
class MatrixLogger extends DefaultLogger implements Logger {
  constructor(private readonly namespace: string) {
    super(namespace)
  }

  getChild(namespace: string): MatrixLogger {
    return new MatrixLogger(namespace)
  }
}

// MARK: MatrixClientManager

export class MatrixClientManager {
  private readonly log: Logger
  private readonly client: MatrixClient
  private readonly deviceId: string
  private accessToken: string
  readonly homeServer: string
  private currentSecretStorageKey?: {
    keyId: string
    privateKey: Uint8Array
  } = undefined
  private slidingSync?: SlidingSync = undefined

  public constructor(
    accessToken: string,
    decoded: { [key: string]: string },
    storage?: HandleStorage,
  ) {
    this.log = new DefaultLogger(this.constructor.name)

    this.deviceId = decoded.device_id
    this.homeServer = decoded.homeserver
    this.accessToken = accessToken

    const config = getSecureCommsServiceConfig()
    const baseUrl = config.serviceEndpointUrl
    const subject = decoded.sub
    const handleId = `@${subject}:${this.homeServer}`

    // Implement a custom authenticated fetch function to ensure that access token
    // is included in the Authorization header.
    const authFetch: typeof globalThis.fetch = async (input, init = {}) => {
      const headers = new Headers(init.headers)
      // if we are in node, set the user agent to the sdk name and version
      if (typeof process !== 'undefined' && process.versions?.node) {
        // Placeholder UA string here. Exact string TBD
        headers.set('User-Agent', 'SecureCommTest/1.0.0 Node')
      }
      headers.set('Authorization', `Bearer ${this.accessToken}`)
      const authInit: RequestInit = {
        ...init,
        headers,
      }
      return globalThis.fetch(input, authInit)
    }

    this.client = createClient({
      baseUrl,
      deviceId: this.deviceId,
      accessToken,
      userId: handleId,
      useAuthorizationHeader: true,
      fetchFn: authFetch,
      logger: new MatrixLogger(this.constructor.name),
      store: storage?.matrixStore,
      timelineSupport: true,
      cryptoCallbacks: {
        getSecretStorageKey: async (opts) => {
          if (this.currentSecretStorageKey) {
            const keyId = Object.keys(opts.keys)[0]
            if (keyId && this.currentSecretStorageKey.keyId === keyId) {
              return [keyId, this.currentSecretStorageKey.privateKey]
            }
          }
          return null
        },
        cacheSecretStorageKey: (
          keyId: string,
          keyInfo: any,
          key: Uint8Array,
        ) => {
          this.currentSecretStorageKey = { keyId, privateKey: key }
        },
      },
    })
    this.accessToken = accessToken
  }

  // MARK: Session / Syncing

  public isUsingToken(token: string): boolean {
    return token === this.accessToken
  }

  public updateAccessToken(token: string): void {
    this.accessToken = token
    this.client.setAccessToken(token)
  }

  public async signIn(): Promise<void> {
    this.log.debug(this.signIn.name)

    try {
      await this.client.loginRequest({
        type: 'm.login.token',
        token: this.accessToken,
        device_id: this.deviceId,
      })
    } catch (err) {
      this.log.error('Failed to sign in', { err })
    }
  }

  public async signOut(): Promise<void> {
    this.log.debug(this.signOut.name)

    try {
      await this.client.logout(true)
    } catch (err) {
      this.log.error('Failed to sign out', { err })
    }
  }

  public async startSyncing(): Promise<void> {
    this.log.debug(this.startSyncing.name)

    try {
      // Check whether the server supports sliding sync feature. If not, fallback to legacy sync
      const isSlidingSyncSupported = await this.isSlidingSyncSupported()
      let slidingSync: SlidingSync | undefined = undefined

      if (isSlidingSyncSupported) {
        const lists = new Map<string, MSC3575List>()
        lists.set('rooms', {
          ranges: [[0, 19]], // Load first 20 rooms initially
          sort: ['by_notification_level', 'by_recency'],
          required_state: [...SLIDING_SYNC_REQUIRED_STATE],
          timeline_limit: SLIDING_SYNC_TIMELINE_LIMIT,
        })
        const roomSubscriptionInfo = {
          required_state: [...SLIDING_SYNC_REQUIRED_STATE],
          timeline_limit: SLIDING_SYNC_TIMELINE_LIMIT,
        }
        const proxyBaseUrl = this.client.getHomeserverUrl()
        slidingSync = new SlidingSync(
          proxyBaseUrl,
          lists,
          roomSubscriptionInfo,
          this.client,
          SLIDING_SYNC_TIMEOUT_MS,
        )
      }
      this.slidingSync = slidingSync
      await this.client.startClient({
        slidingSync: this.slidingSync,
      })
    } catch (err) {
      this.log.error('Failed to start syncing', { err })
    }
  }

  public async stopSyncing(): Promise<void> {
    this.log.debug(this.stopSyncing.name)

    try {
      await Promise.resolve(this.client.stopClient())
      this.slidingSync = undefined
    } catch (err) {
      this.log.error('Failed to stop syncing', { err })
    }
  }

  public isReady() {
    return (
      this.client.getSyncState() === 'SYNCING' &&
      this.client.isInitialSyncComplete()
    )
  }

  private async isSlidingSyncSupported(): Promise<boolean> {
    return await this.client?.doesServerSupportUnstableFeature(
      'org.matrix.simplified_msc3575',
    )
  }

  // MARK: User

  public async getUserId(): Promise<string> {
    this.log.debug(this.getUserId.name)

    const userId = await Promise.resolve(this.client.getUserId())
    if (!userId) {
      throw new HandleNotFoundError()
    }
    return userId
  }

  public async userExists(id: string): Promise<boolean> {
    this.log.debug(this.userExists.name, { id })

    try {
      await this.client.getProfileInfo(id)
      return true
    } catch (err) {
      if (err instanceof MatrixError && err.errcode === 'M_NOT_FOUND') {
        return false
      }
      const msg = 'Failed to retrieve user profile'
      this.log.error(msg, { err })
      throw new Error(msg)
    }
  }

  // MARK: Handles

  public async kickHandle(
    id: string,
    targetHandleId: string,
    reason?: string,
  ): Promise<void> {
    this.log.debug(this.kickHandle.name, { id, targetHandleId, reason })

    try {
      await this.client.kick(id, targetHandleId, reason)
    } catch (err) {
      const msg = 'Failed to kick handle from room'
      this.log.error(msg, { err })
      throw new Error(msg)
    }
  }

  public async banHandle(
    id: string,
    targetHandleId: string,
    reason?: string,
  ): Promise<void> {
    this.log.debug(this.banHandle.name, { id, targetHandleId, reason })

    try {
      await this.client.ban(id, targetHandleId, reason)
    } catch (err) {
      const msg = 'Failed to ban handle from room'
      this.log.error(msg, { err })
      throw new Error(msg)
    }
  }

  public async unbanHandle(id: string, targetHandleId: string): Promise<void> {
    this.log.debug(this.unbanHandle.name, { id, targetHandleId })

    try {
      await this.client.unban(id, targetHandleId)
    } catch (err) {
      const msg = 'Failed to unban handle from room'
      this.log.error(msg, { err })
      throw new Error(msg)
    }
  }

  public async ignoreHandle(id: string): Promise<void> {
    this.log.debug(this.ignoreHandle.name, { id })

    try {
      await this.client.setIgnoredUsers([id])
    } catch (err) {
      const msg = 'Failed to ignore a handle'
      this.log.error(msg, { err })
      throw new Error(msg)
    }
  }

  public async unignoreHandle(id: string): Promise<void> {
    this.log.debug(this.unignoreHandle.name, { id })

    const isIgnored = await Promise.resolve(this.client.isUserIgnored(id))
    if (!isIgnored) {
      this.log.debug('Handle was not previously ignored. Returning,')
      return
    }
    try {
      const ignoreList = await Promise.resolve(this.client.getIgnoredUsers())
      const updatedIgnoreList = ignoreList.filter((item) => item !== id)
      await this.client.setIgnoredUsers(updatedIgnoreList)
    } catch (err) {
      const msg = 'Failed to unignore a handle'
      this.log.error(msg, { err })
      throw new Error(msg)
    }
  }

  public async listIgnoredHandles(): Promise<string[]> {
    this.log.debug(this.listIgnoredHandles.name)

    try {
      return await Promise.resolve(this.client.getIgnoredUsers())
    } catch (err) {
      const msg = 'Failed to list ignored handles'
      this.log.error(msg, { err })
      throw new Error(msg)
    }
  }

  // MARK: Direct Chat

  public async createDirectChat(userIdToChatTo: string): Promise<string> {
    this.log.debug(this.createDirectChat.name)

    try {
      const userId = await this.getUserId()
      const initialState = [
        {
          type: 'm.room.encryption',
          content: {
            // Currently this is the only supported algorithm.
            //
            // See:  https://spec.matrix.org/v1.13/client-server-api/#mroomencryption
            algorithm: 'm.megolm.v1.aes-sha2',
          },
        },
        {
          type: CustomMatrixEvents.TYPE,
          content: {
            type: CustomRoomType.DIRECT_CHAT,
          },
        },
      ]
      const powerLevelsTransformer = new DirectChatPowerLevelsTransformer()
      const powerLevels: PowerLevelsEntity = {
        usersDefault: powerLevelsTransformer.fromEntityToPowerLevel(
          DirectChatRoleEntity.PARTICIPANT,
        ),
        redact: powerLevelsTransformer.fromEntityToPowerLevel(
          DirectChatPermissionsEntity.default.deleteOthersMessages,
        ),
      }

      const roomPowerLevelsTransformer = new RoomPowerLevelsTransformer()
      // Create a room with is_direct flag set to true to indicate that this is a direct chat
      const room = await this.client.createRoom({
        initial_state: initialState,
        is_direct: true,
        visibility: Visibility.Private,
        preset: Preset.TrustedPrivateChat,
        invite: [userIdToChatTo],
        power_level_content_override:
          roomPowerLevelsTransformer.fromEntityPowerLevelToRoomPowerLevel(
            powerLevels,
          ),
      })

      const directEvent = await Promise.resolve(
        this.client.getAccountData(EventType.Direct),
      )
      const currentContent = directEvent?.getContent() ?? {}
      const roomMap = new Map<string, string[]>(Object.entries(currentContent))
      let modified = false
      // Remove this room from other users' direct chat lists
      for (const [otherUserId, roomList] of roomMap) {
        if (otherUserId !== userId) {
          const newRoomList = roomList.filter(
            (roomId) => roomId !== room.room_id,
          )
          if (newRoomList.length !== roomList.length) {
            roomMap.set(otherUserId, newRoomList)
            modified = true
          }
        }
      }
      // Add this room to the current user's direct chat list if not already there
      if (userId) {
        const userRoomList = roomMap.get(userId) ?? []
        if (!userRoomList.includes(room.room_id)) {
          roomMap.set(userId, [...userRoomList, room.room_id])
          modified = true
        }
      }
      // Only update if something changed
      if (modified) {
        await this.client.setAccountData(
          EventType.Direct,
          Object.fromEntries(roomMap),
        )
      }
      return room.room_id
    } catch (err) {
      const msg = 'Failed to create a direct chat room'
      this.log.error(msg, { err })
      throw new Error(msg)
    }
  }

  public async joinDirectChat(userId: string, chatId: string): Promise<void> {
    this.log.debug(this.joinDirectChat.name, { chatId })

    const directEvent = await Promise.resolve(
      this.client.getAccountData(EventType.Direct),
    )
    const currentContent = directEvent?.getContent() ?? {}
    const roomMap = new Map<string, string[]>(Object.entries(currentContent))
    try {
      await this.client.joinRoom(chatId)
      // Add this room to the specified user's room list
      const userRoomList = roomMap.get(userId) ?? []
      if (userRoomList.includes(chatId)) {
        return // Nothing to update. Only update if something changed
      }
      roomMap.set(userId, [...userRoomList, chatId])
      await this.client.setAccountData(
        EventType.Direct,
        Object.fromEntries(roomMap),
      )
    } catch (err) {
      const msg = 'Failed to join direct chat room'
      this.log.error(msg, { err })
      throw new Error(msg)
    }
  }

  public async getDirectChatAccountData(): Promise<MatrixEvent | undefined> {
    this.log.debug(this.getDirectChatAccountData.name)

    return await Promise.resolve(this.client.getAccountData(EventType.Direct))
  }

  // MARK: Rooms

  public async createRoom(input: ICreateRoomOpts): Promise<string> {
    this.log.debug(this.createRoom.name, { input })

    try {
      const result = await this.client.createRoom(input)
      return result.room_id
    } catch (err) {
      const msg = 'Failed to create a room'
      this.log.error(msg, { err })
      throw new Error(msg)
    }
  }

  public async getRoom(id: string): Promise<Room | undefined> {
    this.log.debug(this.getRoom.name, { id })

    try {
      const result = await Promise.resolve(this.client.getRoom(id))
      return result ?? undefined
    } catch (err) {
      const msg = 'Failed to retrieve a room'
      this.log.error(msg, { err })
      throw new Error(msg)
    }
  }

  public async getRoomType(
    roomId: string,
  ): Promise<CustomRoomType | undefined> {
    this.log.debug(this.getRoomType.name)

    const path = `/rooms/${roomId}/state/${CustomMatrixEvents.TYPE}`
    try {
      const response: any = await this.client.http.authedRequest(
        Method.Get,
        path,
      )
      return response.type as CustomRoomType
    } catch (err) {
      if (err instanceof MatrixError && err.errcode === 'M_NOT_FOUND') {
        return undefined
      }
      const msg = 'Failed to retrieve room type'
      this.log.error(msg, { err })
      throw new Error(msg)
    }
  }

  public async getRoomTags(roomId: string): Promise<string[] | undefined> {
    this.log.debug(this.getRoomTags.name)

    const path = `/rooms/${roomId}/state/${CustomMatrixEvents.TAGS}`
    try {
      const response: any = await this.client.http.authedRequest(
        Method.Get,
        path,
      )
      return response.tags
    } catch (err) {
      if (err instanceof MatrixError && err.errcode === 'M_NOT_FOUND') {
        return undefined
      }
      const msg = 'Failed to retrieve room tags'
      this.log.error(msg, { err })
      throw new Error(msg)
    }
  }

  public async setRoomName(id: string, name: string): Promise<void> {
    this.log.debug(this.setRoomName.name, { id, name })

    try {
      await Promise.resolve(this.client.setRoomName(id, name))
    } catch (err) {
      const msg = 'Failed to set room name'
      this.log.error(msg, { err })
      throw new Error(msg)
    }
  }

  public async setRoomTopic(id: string, alias: string): Promise<void> {
    this.log.debug(this.setRoomTopic.name, { id, alias })

    try {
      await Promise.resolve(this.client.setRoomTopic(id, alias))
    } catch (err) {
      const msg = 'Failed to set room topic'
      this.log.error(msg, { err })
      throw new Error(msg)
    }
  }

  public async getRoomTopic(roomId: string): Promise<string | undefined> {
    this.log.debug(this.getRoomTopic.name)

    const path = `/rooms/${roomId}/state/m.room.topic`
    try {
      const response: any = await this.client.http.authedRequest(
        Method.Get,
        path,
      )
      return response.topic
    } catch (err) {
      if (err instanceof MatrixError && err.errcode === 'M_NOT_FOUND') {
        return undefined
      }
      const msg = 'Failed to retrieve room topic'
      this.log.error(msg, { err })
      throw new Error(msg)
    }
  }

  public async setRoomAvatar(id: string, url?: string): Promise<void> {
    this.log.debug(this.setRoomAvatar.name, { id, url })

    const eventContent = {
      url,
    } as unknown as RoomAvatarEventContent
    try {
      await this.client.sendStateEvent(id, EventType.RoomAvatar, eventContent)
    } catch (err) {
      const msg = 'Failed to set room avatar'
      this.log.error(msg, { err })
      throw new Error(msg)
    }
  }

  public async getRoomAvatarUrl(roomId: string): Promise<string | undefined> {
    this.log.debug(this.getRoomAvatarUrl.name)

    const path = `/rooms/${roomId}/state/m.room.avatar`
    try {
      const response: any = await this.client.http.authedRequest(
        Method.Get,
        path,
      )
      return response.url
    } catch (err) {
      if (err instanceof MatrixError && err.errcode === 'M_NOT_FOUND') {
        return undefined
      }
      const msg = 'Failed to retrieve room avatar url'
      this.log.error(msg, { err })
      throw new Error(msg)
    }
  }

  public async getRoomPowerLevels(
    roomId: string,
  ): Promise<RoomPowerLevelsEventContent | undefined> {
    this.log.debug(this.getRoomPowerLevels.name, { roomId })

    try {
      const powerLevels = await this.client.getStateEvent(
        roomId,
        EventType.RoomPowerLevels,
        '',
      )
      return powerLevels
    } catch (err) {
      if (err instanceof MatrixError && err.errcode === 'M_NOT_FOUND') {
        return undefined
      }
      if (err instanceof MatrixError && err.errcode === 'M_FORBIDDEN') {
        throw new UnauthorizedError()
      }
      const msg = 'Failed to retrieve room power levels'
      this.log.error(msg, { err })
      throw new Error(msg)
    }
  }

  public async setRoomPowerLevels(
    roomId: string,
    roomPowerLevels: RoomPowerLevelsEventContent,
  ): Promise<void> {
    this.log.debug(this.setRoomPowerLevels.name, { roomId, roomPowerLevels })

    try {
      await this.client.sendStateEvent(
        roomId,
        EventType.RoomPowerLevels,
        roomPowerLevels,
        '',
      )
    } catch (err) {
      const msg = 'Failed to set room power levels'
      this.log.error(msg, { err })
      throw new Error(msg)
    }
  }

  public async setRoomMemberPowerLevel(
    roomId: string,
    userId: string,
    powerLevel: number,
  ): Promise<void> {
    this.log.debug(this.setRoomMemberPowerLevel.name, {
      roomId,
      userId,
      powerLevel,
    })

    try {
      await this.client.setPowerLevel(roomId, userId, powerLevel)
    } catch (err) {
      const msg = 'Failed to set room member power level'
      this.log.error(msg, { err })
      throw new Error(msg)
    }
  }

  public async deleteRoom(id: string): Promise<void> {
    this.log.debug(this.deleteRoom.name, { id })

    try {
      // Set to true to delete room from store
      await this.client.forget(id, true)
    } catch (err) {
      const msg = 'Failed to delete room'
      this.log.error(msg, { err })
      throw new Error(msg)
    }
  }

  public async joinRoom(id: string): Promise<void> {
    this.log.debug(this.joinRoom.name, { id })

    try {
      await this.client.joinRoom(id)
    } catch (err) {
      const msg = 'Failed to join room'
      this.log.error(msg, { err })
      throw new Error(msg)
    }
  }

  public async leaveRoom(id: string): Promise<void> {
    this.log.debug(this.leaveRoom.name, { id })

    try {
      await this.client.leave(id)
    } catch (err) {
      const msg = 'Failed to leave room'
      this.log.error(msg, { err })
      throw new Error(msg)
    }
  }

  public async invite(id: string, userId: string): Promise<void> {
    this.log.debug(this.invite.name, { id, userId })

    try {
      await this.client.invite(id, userId)
    } catch (err) {
      const msg = 'Failed to invite user to room'
      this.log.error(msg, { err })
      throw new Error(msg)
    }
  }

  public async listRooms(): Promise<Room[]> {
    this.log.debug(this.listRooms.name)

    try {
      const rooms = await Promise.resolve(this.client.getRooms())
      return rooms
    } catch (err) {
      const msg = 'Failed to retrieve rooms'
      this.log.error(msg, { err })
      throw new Error(msg)
    }
  }

  public async listJoinedRooms(): Promise<string[]> {
    this.log.debug(this.listJoinedRooms.name)

    try {
      const rooms = await this.client.getJoinedRooms()
      return rooms.joined_rooms
    } catch (err) {
      const msg = 'Failed to retrieve joined rooms'
      this.log.error(msg, { err })
      throw new Error(msg)
    }
  }

  /**
   * Search for rooms.
   *
   * @param {string} query The query to search for.
   * @param {number} limit The maximum number of rooms to return.
   * @param {string} since The token to start from.
   * @returns {SearchRoomsOutput} The list of rooms that match the query.
   */
  public async searchRooms(
    query: string,
    limit: number = 20,
    since?: string,
  ): Promise<SearchRoomsOutput> {
    this.log.debug(this.searchRooms.name, { query, limit, since })

    try {
      return this.client.publicRooms({
        filter: {
          generic_search_term: query,
        },
        limit,
        since,
      })
    } catch (err) {
      const msg = 'Failed to search rooms'
      this.log.error(msg, { err })
      throw new Error(msg)
    }
  }

  public async knockRoom(id: string, reason?: string): Promise<void> {
    this.log.debug(this.knockRoom.name, { id, reason })

    try {
      await this.client.knockRoom(id, { reason })
    } catch (err) {
      const msg = 'Failed to knock room'
      this.log.error(msg, { err })
      throw new Error(msg)
    }
  }

  public async getMembers(
    roomId: string,
  ): Promise<RoomMemberOutput[] | undefined> {
    this.log.debug(this.getMembers.name, { roomId })

    const path = `/rooms/${encodeURIComponent(roomId)}/members`
    try {
      const response: any = await this.client.http.authedRequest(
        Method.Get,
        path,
      )
      return response.chunk.map((event: IEvent) => {
        const member: RoomMemberOutput = {
          roomId,
          userId: event.state_key!,
          displayName: event.content.displayname,
          membership: event.content.membership,
        }
        return member
      })
    } catch (err) {
      if (err instanceof MatrixError && err.errcode === 'M_NOT_FOUND') {
        return undefined
      }
      if (err instanceof MatrixError && err.errcode === 'M_FORBIDDEN') {
        throw new UnauthorizedError()
      }
      const msg = 'Failed to retrieve room members'
      this.log.error(msg, { err })
      throw new Error(msg)
    }
  }

  public async getMembershipState(
    roomId: string,
    handleId: string,
  ): Promise<KnownMembership | undefined> {
    this.log.debug(this.getMembershipState.name, { roomId, handleId })

    try {
      const response: any = await this.getStateEvent(
        roomId,
        EventType.RoomMember,
        handleId,
      )
      return response?.membership
    } catch (err) {
      const msg = 'Failed to retrieve membership state'
      this.log.error(msg, { err })
      throw new Error(msg)
    }
  }

  public async fetchRoomEvent(
    roomId: string,
    eventId: string,
  ): Promise<MatrixEvent | undefined> {
    this.log.debug(this.fetchRoomEvent.name, { roomId, eventId })

    try {
      const event = await this.client.fetchRoomEvent(roomId, eventId)
      return new MatrixEvent(event)
    } catch (err) {
      const msg = 'Failed to fetch room event'
      this.log.error(msg, { err })
      throw new Error(msg)
    }
  }

  // MARK: Messages

  public async sendMessage(
    roomId: string,
    content: RoomMessageEventContent,
  ): Promise<void> {
    this.log.debug(this.sendMessage.name, { roomId, content })

    try {
      await this.client.sendMessage(roomId, content)
    } catch (err) {
      const msg = 'Failed to send a message'
      this.log.error(msg, { err })
      throw new Error(msg)
    }
  }

  public async sendThreadMessage(
    roomId: string,
    threadId: string,
    content: RoomMessageEventContent,
  ): Promise<void> {
    this.log.debug(this.sendThreadMessage.name, { roomId, threadId, content })

    const eventContent = {
      ...content,
      'm.relates_to': {
        rel_type: 'm.thread',
        event_id: threadId,
      },
    } as RoomMessageEventContent
    try {
      await this.client.sendMessage(roomId, eventContent)
    } catch (err) {
      const msg = 'Failed to send a thread message'
      this.log.error(msg, { err })
      throw new Error(msg)
    }
  }

  public async sendReplyMessage(
    roomId: string,
    replyToMessageId: string,
    content: RoomMessageEventContent,
  ): Promise<void> {
    this.log.debug(this.sendReplyMessage.name, {
      roomId,
      replyToMessageId,
      content,
    })

    const eventContent = {
      ...content,
      'm.relates_to': {
        'm.in_reply_to': { event_id: replyToMessageId },
      },
    } as RoomMessageEventContent
    try {
      await this.client.sendEvent(roomId, EventType.RoomMessage, eventContent)
    } catch (err) {
      const msg = 'Failed to send a reply message'
      this.log.error(msg, { err })
      throw new Error(msg)
    }
  }

  public async getMessage(
    eventId: string,
    roomId: string,
  ): Promise<MessageEntity | undefined> {
    this.log.debug(this.getMessage.name, { eventId, roomId })

    const [userId, room] = await Promise.all([
      this.getUserId(),
      this.getRoom(roomId),
    ])
    if (!room) {
      throw new RoomNotFoundError()
    }
    try {
      const event = room.findEventById(eventId)
      if (!event) {
        return undefined
      }
      const messageTransformer = new MessageTransformer()
      const message = messageTransformer.fromMatrixToEntity(userId, event)
      if (message) {
        // Sender name is not available in event so populate based on room member.
        message.senderHandle.name =
          room.getMember(message.senderHandle.handleId.toString())?.name ?? ''
      }
      return message
    } catch (err) {
      const msg = 'Failed to get message'
      this.log.error(msg, { err })
      throw new Error(msg)
    }
  }

  public async listMessages(
    roomId: string,
    limit: number = 10,
    nextToken?: string,
  ): Promise<ListMessagesOutput> {
    this.log.debug(this.listMessages.name, { roomId, nextToken, limit })

    const [userId, room] = await Promise.all([
      this.getUserId(),
      this.getRoom(roomId),
    ])
    if (!room) {
      throw new RoomNotFoundError()
    }

    const messageTransformer = new MessageTransformer()
    const messageEvents: MatrixEvent[] = []
    try {
      // Fetch messages based on limit and nextToken paginating backwards
      do {
        const response = await this.client.createMessagesRequest(
          roomId,
          nextToken ?? null,
          Math.max(1, limit - messageEvents.length),
          Direction.Backward,
        )
        // Filter events for room message events
        const chunk = response.chunk
          .map((event) => new MatrixEvent(event))
          .filter((event) => {
            const eventContent = event.getContent()
            if (eventContent?.['m.relates_to']?.['rel_type'] === 'm.replace')
              return false
            const eventType = event.getType()
            return (
              eventType === EventType.RoomMessage ||
              eventType === EventType.RoomMessageEncrypted ||
              eventType === EventType.RoomMember ||
              eventType === EventType.PollStart
            )
          })
        chunk.forEach((event) => {
          messageEvents.push(event)
        })
        await Promise.all(
          messageEvents.map(async (message) => {
            if (message.isEncrypted())
              await this.client.decryptEventIfNeeded(message)
          }),
        )
        nextToken = response.end
        if (!nextToken) break
      } while (messageEvents.length < limit)
      const messages = messageEvents
        .map((event) => {
          // Convert Matrix event to Message entity
          const message = messageTransformer.fromMatrixToEntity(userId, event)
          if (message) {
            message.senderHandle.name =
              room.getMember(message.senderHandle.handleId.toString())?.name ??
              ''
            if (event.getType() === EventType.RoomMember) {
              ;(message.content as MembershipChange).handle.name =
                room.getMember(
                  (
                    message.content as MembershipChange
                  ).handle.handleId.toString(),
                )?.name ?? ''
            }
          }
          return message
        })
        .filter((msg): msg is MessageEntity => Boolean(msg))
        // Sort messages from oldest to newest
        .sort((a, b) => a.timestamp - b.timestamp)

      return {
        messages,
        nextToken,
      }
    } catch (err) {
      const msg = 'Failed to list messages'
      this.log.error(msg, { err })
      throw new Error(msg)
    }
  }

  public async editMessage(
    roomId: string,
    originalEventId: string,
    content: RoomMessageEventContent,
  ): Promise<void> {
    this.log.debug(this.editMessage.name, { roomId, originalEventId, content })

    // Construct a raw event to edit a message.
    const editContent: RoomMessageEventContent = {
      msgtype: MsgType.Text,
      body: content.body,
      'm.new_content': {
        msgtype: MsgType.Text,
        body: content.body,
      },
      'm.relates_to': {
        rel_type: RelationType.Replace,
        event_id: originalEventId,
      },
    }
    try {
      await this.client.sendEvent(
        roomId,
        EventType.RoomMessage,
        editContent,
        '',
      )
    } catch (err) {
      const msg = 'Failed to edit message'
      this.log.error(msg, { err })
      throw new Error(msg)
    }
  }

  public async deleteMessage(
    roomId: string,
    eventId: string,
    reason?: string,
  ): Promise<void> {
    this.log.debug(this.deleteMessage.name, { roomId, eventId })

    try {
      const redactOpts = reason ? { reason } : undefined
      await this.client.redactEvent(roomId, eventId, undefined, redactOpts)
    } catch (err) {
      const msg = 'Failed to delete message'
      this.log.error(msg, { err })
      throw new Error(msg)
    }
  }

  public async getChatSummaries(
    roomIds: Map<Recipient, string>,
  ): Promise<ChatSummaryEntity[]> {
    this.log.debug(this.getChatSummaries.name, { roomIds })

    const messageTransformer = new MessageTransformer()
    const userId = await this.getUserId()
    const summaries = await Promise.all(
      Array.from(roomIds, async ([recipient, roomId]) => {
        // client.getRoomSummary() does not seem to provide useful information, fall back to get message from timeline.
        const room = await this.getRoom(roomId)
        if (!room) {
          throw new RoomNotFoundError()
        }

        // Initialize counts
        let unreadCountAll = 0
        let unreadCountMentions = 0
        const threadUnreadCount: Record<
          string,
          { all: number; mentions: number }
        > = {}

        const events = room.getLiveTimeline()?.getEvents() ?? []
        const latestEvent = events.at(-1)
        if (!latestEvent) {
          // If latest event cannot be retrieved then return
          return {
            recipient,
            hasUnreadMessages: false,
            unreadCount: {
              all: unreadCountAll,
              mentions: unreadCountMentions,
            },
            threadUnreadCount,
            latestMessage: undefined,
          }
        }

        const readReceipt = room.getReadReceiptForUserId(userId)
        const lastReadEventId = readReceipt?.eventId // Event ID of the latest read message

        // Find the index of the last read event
        let lastReadIndex = -1
        if (lastReadEventId) {
          lastReadIndex = events.findIndex((e) => e.getId() === lastReadEventId)
        }

        // Get unread events (events after the last read one)
        const unreadEvents =
          lastReadIndex >= 0 ? events.slice(lastReadIndex + 1) : events

        // Decrypt encrypted events if needed
        await Promise.all(
          unreadEvents.map(async (event) => {
            if (event.isEncrypted()) {
              await this.client.decryptEventIfNeeded(event)
            }
          }),
        )

        // Filter for message events (including edits, as they can be unread and contain mentions)
        const unreadMessageEvents = unreadEvents.filter((event) => {
          const eventType = event.getType()
          return (
            eventType === EventType.RoomMessage ||
            eventType === EventType.RoomMessageEncrypted ||
            eventType === EventType.RoomMember ||
            eventType === EventType.PollStart ||
            eventType === EventType.Reaction
          )
        })

        // Count unread messages
        for (const event of unreadMessageEvents) {
          const eventContent = event.getContent()
          const threadId =
            eventContent?.['m.relates_to']?.['rel_type'] === 'm.thread'
              ? eventContent['m.relates_to']?.event_id
              : undefined

          // Check if event mentions the user
          const mentions = eventContent?.['m.mentions']
          const isMentioned =
            (mentions?.user_ids?.includes(userId) ?? false) ||
            mentions?.room === true

          // Increment counts
          unreadCountAll++
          if (isMentioned) {
            unreadCountMentions++
          }

          // Track thread-specific counts
          if (threadId) {
            if (!threadUnreadCount[threadId]) {
              threadUnreadCount[threadId] = { all: 0, mentions: 0 }
            }
            threadUnreadCount[threadId].all++
            if (isMentioned) {
              threadUnreadCount[threadId].mentions++
            }
          }
        }

        const latestMessage = messageTransformer.fromMatrixToEntity(
          userId,
          latestEvent,
        )

        return {
          recipient,
          hasUnreadMessages: unreadCountAll > 0,
          unreadCount: {
            all: unreadCountAll,
            mentions: unreadCountMentions,
          },
          threadUnreadCount,
          latestMessage,
        }
      }),
    )
    return summaries
  }

  public async searchMessages(
    searchText: string,
    limit = 10,
    nextToken?: string,
  ): Promise<SearchMessagesOutput> {
    this.log.debug(this.searchMessages.name, { searchText })

    const searchMessagesItemTransformer = new SearchMessagesItemTransformer()
    try {
      const results = await this.client.search({
        body: {
          search_categories: {
            room_events: {
              search_term: searchText,
              keys: ['content.body'],
              filter: { types: [EventType.RoomMessage], limit },
              include_state: false,
            },
          },
        },
        next_batch: nextToken,
      })
      const roomEvents = results?.search_categories?.room_events
      const roomResults = roomEvents?.results ?? []
      const nextBatch = roomEvents?.next_batch

      const messages = roomResults.flatMap((roomResult) => {
        const event = roomResult?.result
        if (
          !event ||
          event.type !== EventType.RoomMessage ||
          event.content?.msgtype !== MsgType.Text
        ) {
          return []
        }
        // Convert Matrix event to SearchMessagesItem entity
        const searchMessagesItem =
          searchMessagesItemTransformer.fromMatrixToEntity(event)
        return [searchMessagesItem]
      })
      return {
        messages,
        nextToken: nextBatch,
      }
    } catch (err) {
      const msg = 'Failed to search for messages'
      this.log.error(msg, { err })
      throw new Error(msg)
    }
  }

  // MARK: Reactions

  public async toggleReaction(
    roomId: string,
    eventId: string,
    reaction: string,
  ): Promise<void> {
    this.log.debug(this.toggleReaction.name, { roomId, eventId, reaction })

    try {
      const room = await this.getRoom(roomId)
      if (!room) {
        throw new RoomNotFoundError()
      }
      const userId = await this.getUserId()
      const events = room.getLiveTimeline()?.getEvents() ?? []
      // Find existing reaction event from the current user
      const existingReaction = events.find(
        (event) =>
          event.getType() === EventType.Reaction &&
          event.getContent()?.['m.relates_to']?.event_id === eventId &&
          event.getContent()?.['m.relates_to']?.key === reaction &&
          event.getSender() === userId,
      )
      const existingReactionId = existingReaction?.getId()
      if (existingReaction && existingReactionId) {
        // If reaction exists, remove it
        await this.client.redactEvent(roomId, existingReactionId)
      } else {
        // If reaction doesn't exist, add it
        await this.client.sendEvent(roomId, EventType.Reaction, {
          'm.relates_to': {
            rel_type: RelationType.Annotation,
            event_id: eventId,
            key: reaction,
          },
        })
      }
    } catch (err) {
      const msg = 'Failed to toggle reaction'
      this.log.error(msg, { err })
      throw new Error(msg)
    }
  }

  public async getReactions(
    roomId: string,
    messageId: string,
  ): Promise<MessageReactionEntity[]> {
    this.log.debug(this.getReactions.name, { roomId, messageId })

    try {
      const room = await this.getRoom(roomId)
      if (!room) {
        throw new RoomNotFoundError()
      }
      const timeline = room.getUnfilteredTimelineSet()
      const reactions = timeline?.relations
        .getChildEventsForEvent(
          messageId,
          RelationType.Annotation,
          EventType.Reaction,
        )
        ?.getSortedAnnotationsByKey()
      if (!reactions?.length) {
        return []
      }
      return reactions.map(([key, events]) => {
        const senderHandleIds = Array.from(
          new Set(
            Array.from(events)
              .filter((event) => !event.isRedacted())
              .map((event) => event.getSender())
              .filter(Boolean),
          ),
        ).map((id) => new HandleId(id!))
        return {
          content: key,
          count: senderHandleIds.length,
          senderHandleIds,
        }
      })
    } catch (err) {
      const msg = `Failed to get reactions for message ${messageId}`
      this.log.error(msg, { err })
      throw new Error(msg)
    }
  }

  // MARK: Read Receipts

  public async sendReadReceipt(roomId: string): Promise<void> {
    this.log.debug(this.sendReadReceipt.name, { roomId })

    try {
      const room = await this.getRoom(roomId)
      if (!room) {
        throw new RoomNotFoundError()
      }
      const events = room.getLiveTimeline()?.getEvents()
      const latestEvent = events?.[0]
      if (!latestEvent) {
        throw new Error('Latest event could not be found')
      }
      await this.client.sendReadReceipt(latestEvent)
    } catch (err) {
      const msg = 'Failed to send read receipt'
      this.log.error(msg, { err })
      throw new Error(msg)
    }
  }

  public async getReadReceipts(
    roomId: string,
    event?: MatrixEvent,
    eventId?: string,
  ): Promise<MessageReceiptEntity[]> {
    this.log.debug(this.getReadReceipts.name, { roomId })

    try {
      const room = await this.getRoom(roomId)
      if (!room) {
        throw new RoomNotFoundError()
      }
      const targetEvent =
        event ??
        (eventId ? await this.fetchRoomEvent(roomId, eventId) : undefined)
      if (!targetEvent) {
        throw new Error('Valid event could not be found')
      }
      const receipts = room.getReceiptsForEvent(targetEvent) ?? []
      const messageReceiptTransformer = new MessageReceiptTransformer()
      return receipts.map((receipt) =>
        messageReceiptTransformer.fromMatrixToEntity(receipt),
      )
    } catch (err) {
      const msg = 'Failed to get read receipts'
      this.log.error(msg, { err })
      throw new Error(msg)
    }
  }

  // MARK: Edits

  public async getReplacements(
    roomId: string,
    messageId: string,
  ): Promise<MessageEntity[]> {
    this.log.debug(this.getReplacements.name, { roomId, messageId })

    const [userId, room] = await Promise.all([
      this.getUserId(),
      this.getRoom(roomId),
    ])
    if (!room) {
      throw new RoomNotFoundError()
    }
    try {
      const timeline = room.getUnfilteredTimelineSet()
      const relations = timeline?.relations
        .getChildEventsForEvent(
          messageId,
          RelationType.Replace,
          EventType.RoomMessage,
        )
        ?.getRelations()
      if (!relations?.length) {
        return []
      }

      // Map, filter and deduplicate
      const messageTransformer = new MessageTransformer()
      const replacements = relations
        .filter((event) => !event.isRedacted())
        .map((event) => messageTransformer.fromMatrixToEntity(userId, event))
        .filter((message): message is MessageEntity => Boolean(message))

      // Deduplicate by messageId
      const seen = new Set<string>()
      return replacements.filter((message) => {
        if (seen.has(message.messageId)) return false
        seen.add(message.messageId)
        return true
      })
    } catch (err) {
      const msg = `Failed to get replacements for message ${messageId}`
      this.log.error(msg, { err })
      throw new Error(msg)
    }
  }

  // MARK: Pin/Unpin Message

  public async pinUnpinMessage(roomId: string, eventId: string): Promise<void> {
    this.log.debug(this.pinUnpinMessage.name, { roomId, eventId })

    try {
      const pinnedEvents = await this.getStateEvent(
        roomId,
        EventType.RoomPinnedEvents,
        '',
      )
      const pinnedEventIds = pinnedEvents?.pinned ?? []

      // Remove eventId from array if already present, otherwise append it
      const pinnedSet = new Set<string>(pinnedEventIds)
      const wasPinned = pinnedSet.has(eventId)
      if (wasPinned) {
        pinnedSet.delete(eventId)
      } else {
        pinnedSet.add(eventId)
      }
      const updatedPinnedEventIds = Array.from(pinnedSet)

      // Only send state event if something changed
      if (
        (wasPinned && pinnedEventIds.length !== updatedPinnedEventIds.length) ||
        (!wasPinned && pinnedEventIds.length !== updatedPinnedEventIds.length)
      ) {
        await this.client.sendStateEvent(
          roomId,
          EventType.RoomPinnedEvents,
          { pinned: updatedPinnedEventIds },
          '',
        )
      }
    } catch (err) {
      const msg = 'Failed to toggle pinned message'
      this.log.error(msg, { err })
      throw new Error(msg)
    }
  }

  public async getPinnedMessages(roomId: string): Promise<MessageEntity[]> {
    this.log.debug(this.getPinnedMessages.name, { roomId })

    try {
      const pinnedEvents = await this.getStateEvent(
        roomId,
        EventType.RoomPinnedEvents,
        '',
      )
      const pinnedEventIds = pinnedEvents?.pinned ?? []

      const pinnedMessages = await Promise.all(
        pinnedEventIds.map(async (eventId: string) => {
          return await this.getMessage(eventId, roomId)
        }),
      )
      // Filter out any undefined results
      return pinnedMessages.filter((msg): msg is MessageEntity => Boolean(msg))
    } catch (err) {
      const msg = 'Failed to get pinned messages'
      this.log.error(msg, { err })
      throw new Error(msg)
    }
  }

  // MARK: Polls

  public async createPoll(
    roomId: string,
    kind: PollKind,
    question: string,
    answers: string[],
    maxSelections: number,
  ): Promise<void> {
    this.log.debug(this.createPoll.name, {
      roomId,
      kind,
      question,
      answers,
      maxSelections,
    })

    const path = `/rooms/${encodeURIComponent(roomId)}/send/${M_POLL_START.name}/${Date.now()}`
    const eventContent = {
      [M_POLL_START.name]: {
        question: {
          body: question,
          msgtype: 'm.text',
        },
        kind,
        max_selections: maxSelections,
        answers: answers.map((answer) => ({
          id: answer,
          'org.matrix.msc1767.text': answer,
        })),
      },
      'm.text': question,
    }
    try {
      await this.client.http.authedRequest(
        Method.Put,
        path,
        undefined,
        eventContent,
      )
    } catch (err) {
      const msg = 'Failed to create poll'
      this.log.error(msg, { err })
      throw new Error(msg)
    }
  }

  public async sendPollResponse(
    roomId: string,
    pollId: string,
    answers: string[],
  ): Promise<void> {
    this.log.debug(this.sendPollResponse.name, { roomId, pollId, answers })

    const path = `/rooms/${encodeURIComponent(roomId)}/send/${M_POLL_RESPONSE.name}/${Date.now()}`
    const eventContent = {
      [M_POLL_RESPONSE.name]: {
        answers,
      },
      'm.relates_to': {
        rel_type: 'm.reference',
        event_id: pollId,
      },
    }
    try {
      await this.client.http.authedRequest(
        Method.Put,
        path,
        undefined,
        eventContent,
      )
    } catch (err) {
      const msg = `Failed to send poll response ${pollId}`
      this.log.error(msg, { err })
      throw new Error(msg)
    }
  }

  public async endPoll(roomId: string, pollId: string): Promise<void> {
    this.log.debug(this.endPoll.name, { roomId, pollId })

    const path = `/rooms/${encodeURIComponent(roomId)}/send/${M_POLL_END.name}/${Date.now()}`
    const eventContent = {
      [M_POLL_END.name]: {},
      'm.relates_to': {
        rel_type: 'm.reference',
        event_id: pollId,
      },
    }
    try {
      await this.client.http.authedRequest(
        Method.Put,
        path,
        undefined,
        eventContent,
      )
    } catch (err) {
      const msg = `Failed to end poll ${pollId}`
      this.log.error(msg, { err })
      throw new Error(msg)
    }
  }

  public async getPollResponses(
    roomId: string,
    pollId: string,
  ): Promise<PollResponsesEntity> {
    this.log.debug(this.getPollResponses.name, { roomId, pollId })

    try {
      // Check if poll has ended
      const pollEnd = await this.client.relations(
        roomId,
        pollId,
        RelationType.Reference,
        M_POLL_END.name,
      )
      const pollEndTimestamp = pollEnd.events[0]?.getTs()

      // Aggregate poll responses
      const latestResponseByUser = new Map<
        string,
        { timestamp: number; answers: string[] }
      >()
      let nextBatch: string | null | undefined = undefined
      do {
        const pollResponses = await this.client.relations(
          roomId,
          pollId,
          RelationType.Reference,
          M_POLL_RESPONSE.name,
          { from: nextBatch },
        )
        pollResponses.events.forEach((event: MatrixEvent) => {
          // Filter out responses sent after poll has ended
          const responseTimestamp = event.getTs()
          if (pollEndTimestamp && responseTimestamp > pollEndTimestamp) return

          const userId = event.getSender()
          if (!userId) return

          const content: any = event.getContent()
          const answers: string[] | undefined =
            content[M_POLL_RESPONSE.name].answers
          if (!Array.isArray(answers) || answers.length === 0) return

          // Filter out older responses from the same user
          const prevResponse = latestResponseByUser.get(userId)
          if (!prevResponse || prevResponse.timestamp < responseTimestamp) {
            latestResponseByUser.set(userId, {
              timestamp: responseTimestamp,
              answers,
            })
          }
        })
        nextBatch = pollResponses.nextBatch
      } while (nextBatch)

      const talliedAnswers: Record<string, number> = {}
      latestResponseByUser.forEach(({ answers }) => {
        answers.forEach((answer) => {
          talliedAnswers[answer] = (talliedAnswers[answer] ?? 0) + 1
        })
      })
      const totalVotes = Object.values(talliedAnswers).reduce(
        (sum, count) => sum + count,
        0,
      )
      return {
        talliedAnswers,
        totalVotes,
        endedAt: pollEndTimestamp,
      }
    } catch (err) {
      const msg = `Failed to get responses for poll ${pollId}`
      this.log.error(msg, { err })
      throw new Error(msg)
    }
  }

  // MARK: Typing

  public async sendTypingNotification(
    roomId: string,
    isTyping: boolean,
  ): Promise<void> {
    this.log.debug(this.sendTypingNotification.name, { roomId, isTyping })

    try {
      await this.client.sendTyping(roomId, isTyping, 30000) // Add timeout parameter of 30 seconds
    } catch (err) {
      const msg = 'Failed to send typing notification'
      this.log.error(msg, { err })
      throw new Error(msg)
    }
  }

  // MARK: Media

  public async decryptFile(
    file: ArrayBuffer,
    encryptionInfo: IEncryptedFile,
  ): Promise<ArrayBuffer> {
    this.log.debug(this.decryptFile.name, { file, encryptionInfo })
    try {
      return await decryptAttachment(file, encryptionInfo)
    } catch (err) {
      const msg = 'Failed to decrypt file'
      this.log.error(msg, { err })
      throw new Error(msg)
    }
  }

  // MARK: Crypto

  public async initRustCrypto(options: any): Promise<void> {
    await this.client.initRustCrypto(options)
  }

  public async clearRustCrypto(cryptoDatabasePrefix: string): Promise<void> {
    await this.client.clearStores({ cryptoDatabasePrefix })
  }

  public async isVerified(): Promise<boolean> {
    const crypto = this.getCrypto()
    const userId = await this.getUserId()
    const deviceId = this.client.getDeviceId()
    if (!deviceId) {
      throw new SecureCommsError('Failed to get device id')
    }
    const deviceInfo = await crypto.getUserDeviceInfo([userId])
    const currentDevice = deviceInfo?.get(userId)?.get(deviceId)
    if (!currentDevice) {
      throw new SecureCommsError('Failed to get device info')
    }
    return currentDevice.verified === DeviceVerification.Verified
  }

  public onSessionVerificationChanged(handler: (state: boolean) => void): void {
    this.client.on(CryptoEvent.UserTrustStatusChanged, (event: any) => {
      const { userId, userTrustLevel } = event as {
        userId: string
        userTrustLevel: UserVerificationStatus
      }
      if (userId === this.client.getUserId()) {
        handler(userTrustLevel.isVerified())
      }
    })
  }

  public onVerificationRequestReceived(
    handler: (state: VerificationRequest) => void,
  ): void {
    this.client.on(CryptoEvent.VerificationRequestReceived, (event: any) => {
      handler(event as VerificationRequest)
    })
  }

  public async isSignedIn(): Promise<boolean> {
    this.log.debug(this.isSignedIn.name)

    return await Promise.resolve(this.client.isLoggedIn())
  }

  private getCrypto(): CryptoApi {
    const crypto = this.client.getCrypto()
    if (!crypto) {
      throw new SecureCommsError('Crypto API not initialized')
    }
    return crypto
  }

  public async createKeyBackup(): Promise<GeneratedSecretStorageKey> {
    this.log.debug(this.createKeyBackup.name)

    try {
      const crypto = this.getCrypto()

      // Create a recovery key
      const recoveryKey = await crypto.createRecoveryKeyFromPassphrase()

      // Set up the key backup
      await crypto.bootstrapSecretStorage({
        createSecretStorageKey: async () => recoveryKey,
        setupNewKeyBackup: true,
        setupNewSecretStorage: false,
      })

      // Get the actual key that was used (may be different from what we provided)
      const storedKey = await crypto.getSessionBackupPrivateKey()

      // Return the actual key that was used for the backup
      if (
        storedKey &&
        recoveryKey.privateKey &&
        (storedKey.length !== recoveryKey.privateKey.length ||
          !storedKey.every((val, i) => val === recoveryKey.privateKey[i]))
      ) {
        return {
          privateKey: storedKey,
          encodedPrivateKey: encodeRecoveryKey(storedKey),
        }
      }

      return recoveryKey
    } catch (err) {
      const msg = 'Failed to create key backup'
      this.log.error(msg, { err })
      throw new SecureCommsError(msg)
    }
  }

  public async hasKeyBackup(): Promise<boolean> {
    try {
      const crypto = this.getCrypto()
      const backupInfo = await crypto.checkKeyBackupAndEnable()
      return backupInfo !== null
    } catch (err) {
      const msg = 'Failed to check key backup'
      this.log.error(msg, { err })
      throw new SecureCommsError(msg)
    }
  }

  public async recoverFromBackup(backupKey: string): Promise<void> {
    this.log.debug(this.recoverFromBackup.name)

    try {
      if (!(await this.hasKeyBackup())) {
        throw new SecureCommsError('No backup found on server')
      }
      const crypto = this.getCrypto()
      const version = await crypto.getActiveSessionBackupVersion()
      if (!version) {
        throw new SecureCommsError('Failed to get backup version')
      }
      const decodedKey = decodeRecoveryKey(backupKey)
      await crypto.storeSessionBackupPrivateKey(decodedKey, version)
      await crypto.restoreKeyBackup()
    } catch (err) {
      const msg = 'Failed to recover from backup'
      this.log.error(msg, { err })
      throw new SecureCommsError(msg)
    }
  }

  public async rotateKeyBackup(): Promise<GeneratedSecretStorageKey> {
    this.log.debug(this.rotateKeyBackup.name)

    try {
      const crypto = this.getCrypto()

      // Create a new recovery key
      const recoveryKey = await crypto.createRecoveryKeyFromPassphrase()

      // Rotate the backup
      await crypto.bootstrapSecretStorage({
        createSecretStorageKey: async () => recoveryKey,
        setupNewSecretStorage: false,
        setupNewKeyBackup: true,
      })

      // Get the actual key that was used
      const storedKey = await crypto.getSessionBackupPrivateKey()

      // Return the actual key that was used for the backup
      if (
        storedKey &&
        recoveryKey.privateKey &&
        (storedKey.length !== recoveryKey.privateKey.length ||
          !storedKey.every((val, i) => val === recoveryKey.privateKey[i]))
      ) {
        return {
          privateKey: storedKey,
          encodedPrivateKey: encodeRecoveryKey(storedKey),
        }
      }

      return recoveryKey
    } catch (err) {
      const msg = 'Failed to rotate key backup'
      this.log.error(msg, { err })
      throw new SecureCommsError(msg)
    }
  }

  public async resetKeyBackup(): Promise<GeneratedSecretStorageKey> {
    this.log.debug(this.resetKeyBackup.name)
    try {
      const crypto = this.getCrypto()

      // Create a recovery key
      const recoveryKey = await crypto.createRecoveryKeyFromPassphrase()

      // Reset the backup
      await crypto.bootstrapSecretStorage({
        createSecretStorageKey: async () => recoveryKey,
        setupNewKeyBackup: true,
        setupNewSecretStorage: true,
      })

      // Get the actual key that was used
      const storedKey = await crypto.getSessionBackupPrivateKey()

      // Return the actual key that was used for the backup
      if (
        storedKey &&
        recoveryKey.privateKey &&
        (storedKey.length !== recoveryKey.privateKey.length ||
          !storedKey.every((val, i) => val === recoveryKey.privateKey[i]))
      ) {
        return {
          privateKey: storedKey,
          encodedPrivateKey: encodeRecoveryKey(storedKey),
        }
      }

      return recoveryKey
    } catch (err) {
      const msg = 'Failed to reset key backup'
      this.log.error(msg, { err })
      throw new SecureCommsError(msg)
    }
  }

  public async requestVerification(userId: string): Promise<void> {
    this.log.debug(this.requestVerification.name, { userId })

    try {
      const crypto = this.getCrypto()
      await crypto.requestOwnUserVerification()
    } catch (err) {
      const msg = 'Failed to request verification'
      this.log.error(msg, { err })
      throw new SecureCommsError(msg)
    }
  }

  public async acceptVerificationRequest(
    userId: string,
    verificationRequestId: string,
  ): Promise<void> {
    this.log.debug(this.acceptVerificationRequest.name, {
      userId,
      verificationRequestId,
    })

    try {
      const crypto = this.getCrypto()
      await crypto.requestVerificationDM(userId, verificationRequestId)
    } catch (err) {
      const msg = 'Failed to accept verification request'
      this.log.error(msg, { err })
      throw new SecureCommsError(msg)
    }
  }

  public async startVerification(userId: string): Promise<void> {
    this.log.debug(this.startVerification.name, { userId })

    try {
      const crypto = this.getCrypto()
      await crypto.requestVerificationDM(userId, 'm.sas.v1')
    } catch (err) {
      const msg = 'Failed to start verification'
      this.log.error(msg, { err })
      throw new SecureCommsError(msg)
    }
  }

  public async approveVerification(userId: string): Promise<void> {
    this.log.debug(this.approveVerification.name, { userId })

    try {
      const crypto = this.getCrypto()
      await crypto.requestVerificationDM(userId, 'm.sas.v1')
    } catch (err) {
      const msg = 'Failed to approve verification'
      this.log.error(msg, { err })
      throw new SecureCommsError(msg)
    }
  }

  public async declineVerification(userId: string): Promise<void> {
    this.log.debug(this.declineVerification.name, { userId })

    try {
      const crypto = this.getCrypto()
      await crypto.requestVerificationDM(userId, 'decline')
    } catch (err) {
      const msg = 'Failed to decline verification'
      this.log.error(msg, { err })
      throw new SecureCommsError(msg)
    }
  }

  public async cancelVerification(userId: string): Promise<void> {
    this.log.debug(this.cancelVerification.name, { userId })

    try {
      const crypto = this.getCrypto()
      await crypto.requestVerificationDM(userId, 'cancel')
    } catch (err) {
      const msg = 'Failed to cancel verification'
      this.log.error(msg, { err })
      throw new SecureCommsError(msg)
    }
  }

  public async setDeviceVerified(
    userId: string,
    deviceId: string,
  ): Promise<void> {
    this.log.debug(this.setDeviceVerified.name, { userId, deviceId })

    try {
      const crypto = this.getCrypto()
      await crypto.setDeviceVerified(userId, deviceId)
    } catch (err) {
      const msg = 'Failed to verify device'
      this.log.error(msg, { err })
      throw new SecureCommsError(msg)
    }
  }

  public async getDeviceVerificationStatus(
    userId: string,
    deviceId: string,
  ): Promise<DeviceVerificationStatus | null> {
    this.log.debug(this.getDeviceVerificationStatus.name, { userId, deviceId })

    try {
      const crypto = this.getCrypto()
      return crypto.getDeviceVerificationStatus(userId, deviceId)
    } catch (err) {
      const msg = 'Failed to check device verification status'
      this.log.error(msg, { err })
      throw new SecureCommsError(msg)
    }
  }

  public async bootstrapCrossSigning(): Promise<void> {
    this.log.debug(this.bootstrapCrossSigning.name)

    try {
      const crypto = this.getCrypto()
      await crypto.bootstrapCrossSigning({
        authUploadDeviceSigningKeys: (makeRequest) => {
          return makeRequest({
            type: 'm.login.token',
            token: this.accessToken,
            device_id: this.deviceId,
          })
        },
      })
    } catch (err) {
      const msg = 'Failed to bootstrap cross signing'
      this.log.error(msg, { err })
      throw new SecureCommsError(msg)
    }
  }

  public async isCrossSigningReady(): Promise<boolean> {
    this.log.debug(this.isCrossSigningReady.name)

    try {
      const crypto = this.getCrypto()
      return crypto.isCrossSigningReady()
    } catch (err) {
      const msg = 'Failed to check cross signing status'
      this.log.error(msg, { err })
      throw new SecureCommsError(msg)
    }
  }

  public async getUserVerificationStatus(
    userId: string,
  ): Promise<UserVerificationStatus> {
    this.log.debug(this.getUserVerificationStatus.name, { userId })

    try {
      const crypto = this.getCrypto()
      return crypto.getUserVerificationStatus(userId)
    } catch (err) {
      const msg = 'Failed to check user verification status'
      this.log.error(msg, { err })
      throw new SecureCommsError(msg)
    }
  }

  // MARK: Notifications

  /**
   * This will always get latest push rules from the server.
   * @returns IPushRules
   */
  async getPushRules(): Promise<IPushRules> {
    this.log.debug(this.getPushRules.name)

    try {
      return this.client.getPushRules()
    } catch (err) {
      const msg = 'Failed to get push rules'
      this.log.error(msg, { err })
      throw new SecureCommsError(msg)
    }
  }

  /**
   * Passthrough to MatrixClient.addPushRule
   */
  async addPushRule(
    scope: 'global' | 'device',
    kind: PushRuleKind,
    ruleId: string,
    rule: {
      conditions?: PushRuleCondition[]
      actions: PushRuleAction[]
    },
  ): Promise<void> {
    this.log.debug(this.addPushRule.name, {
      scope,
      kind,
      ruleId,
      rule,
    })

    try {
      await this.client.addPushRule(scope, kind, ruleId, rule)
    } catch (err) {
      const msg = 'Failed to add push rule'
      this.log.error(msg, { err })
      throw new SecureCommsError(msg)
    }
  }

  /**
   * Passthrough to MatrixClient.deletePushRule
   */
  async deletePushRule(
    scope: 'global' | 'device',
    kind: PushRuleKind,
    ruleId: string,
  ): Promise<void> {
    this.log.debug(this.deletePushRule.name, {
      scope,
      kind,
      ruleId,
    })

    try {
      await this.client.deletePushRule(scope, kind, ruleId)
    } catch (err) {
      const msg = 'Failed to delete push rule'
      this.log.error(msg, { err })
      throw new SecureCommsError(msg)
    }
  }

  /**
   * Passthrough to MatrixClient.setPushRuleEnabled
   */
  async setPushRuleEnabled(
    scope: 'global' | 'device',
    kind: PushRuleKind,
    ruleId: string,
    enabled: boolean,
  ): Promise<void> {
    this.log.debug(this.setPushRuleEnabled.name, {
      scope,
      kind,
      ruleId,
      enabled,
    })

    try {
      await this.client.setPushRuleEnabled(scope, kind, ruleId, enabled)
    } catch (err) {
      const msg = 'Failed to enable push rule'
      this.log.error(msg, { err })
      throw new SecureCommsError(msg)
    }
  }

  /**
   * Passthrough to MatrixClient.setPushRuleActions
   */
  async setPushRuleActions(
    scope: 'global' | 'device',
    kind: PushRuleKind,
    ruleId: string,
    actions: PushRuleAction[],
  ): Promise<void> {
    this.log.debug(this.setPushRuleActions.name, {
      scope,
      kind,
      ruleId,
      actions,
    })

    try {
      await this.client.setPushRuleActions(scope, kind, ruleId, actions)
    } catch (err) {
      const msg = 'Failed to set push rule actions'
      this.log.error(msg, { err })
      throw new SecureCommsError(msg)
    }
  }

  // MARK: Event Listener

  public registerEventListener(
    listener: (message: Message, roomId: string) => void,
  ): (event: MatrixEvent) => void {
    const messageTransformer = new MessageTransformer()
    const eventListener = async (event: MatrixEvent) => {
      if (
        [EventType.RoomMessage, EventType.PollStart].includes(
          event.getType() as EventType,
        )
      ) {
        try {
          const userId = await this.getUserId()
          const messageEntity = messageTransformer.fromMatrixToEntity(
            userId,
            event,
          )
          if (!messageEntity) return
          const roomId = event.getRoomId()
          if (!roomId) return
          const room = await this.getRoom(roomId)
          if (!room) return
          messageEntity.senderHandle.name =
            room.getMember(messageEntity.senderHandle.handleId.toString())
              ?.name ?? ''
          const message = messageTransformer.fromEntityToAPI(messageEntity)
          listener(message, roomId)
        } catch (err) {
          this.log.error('Error transforming event to message', {
            err,
            eventId: event.getId(),
          })
        }
      }
    }
    this.client.on('event' as any, eventListener)
    return eventListener
  }

  public unregisterEventListener(listener: (event: MatrixEvent) => void): void {
    this.client.removeListener('event' as any, listener)
  }

  // MARK: Util

  private async getStateEvent(
    roomId: string,
    eventType: string,
    stateKey?: string,
  ): Promise<any> {
    this.log.debug(this.getStateEvent.name, { roomId, eventType })

    try {
      const response: any = await this.client.getStateEvent(
        roomId,
        eventType,
        stateKey as string, // client.getStateEvent allows undefined stateKey, but it is not marked as optional
      )
      return response
    } catch (err) {
      if (err instanceof MatrixError && err.errcode === 'M_NOT_FOUND') {
        return undefined
      }
      const msg = 'Failed to retrieve state event'
      this.log.error(msg, { err })
      throw new Error(msg)
    }
  }
}
