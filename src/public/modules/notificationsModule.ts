/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { DefaultLogger, Logger } from '@sudoplatform/sudo-common'
import { SessionManager } from '../../private/data/session/sessionManager'
import { ClearRecipientChatRulesUseCase } from '../../private/domain/use-cases/notifications/clearRecipientChatRulesUseCase'
import { GetDecodedInfoUseCase } from '../../private/domain/use-cases/notifications/getDecodedInfoUseCase'
import { GetSettingsUseCase } from '../../private/domain/use-cases/notifications/getSettingsUseCase'
import { SetDefaultChatRulesUseCase } from '../../private/domain/use-cases/notifications/setDefaultChatRulesUseCase'
import { SetDefaultEventRulesUseCase } from '../../private/domain/use-cases/notifications/setDefaultEventRulesUseCase'
import { SetRecipientChatRulesUseCase } from '../../private/domain/use-cases/notifications/setRecipientChatRulesUseCase'
import { HandleId, Recipient } from '../typings'
import {
  ChatNotificationRules,
  EventNotificationRules,
  NotificationInfo,
  NotificationSettings,
} from '../typings/notification'

/**
 * Input for `NotificationsModule.getDecodedInfo` method.
 *
 * @interface GetDecodedInfoInput
 * @property {HandleId} handleId The owner of the notification.
 * @property {string} eventId The event id of the notification.
 * @property {string} roomId The room id of the notification.
 */
export interface GetDecodedInfoInput {
  handleId: HandleId
  eventId: string
  roomId: string
}

/**
 * Input for `NotificationsModule.getSettings` method.
 *
 * @interface GetSettingsInput
 * @property {HandleId} handleId The owner of the notification settings.
 */
export interface GetSettingsInput {
  handleId: HandleId
}

/**
 * Input for `NotificationsModule.setDefaultChatRules` method.
 *
 * @interface SetDefaultChatRulesInput
 * @property {HandleId} handleId The owner of the notification settings.
 * @property {ChatNotificationRules} chatRules The chat notification rules to set.
 */
export interface SetDefaultChatRulesInput {
  handleId: HandleId
  chatRules: ChatNotificationRules
}

/**
 * Input for `NotificationsModule.setDefaultEventRules` method.
 *
 * @interface SetDefaultEventRulesInput
 * @property {HandleId} handleId The owner of the notification settings.
 * @property {EventNotificationRules} eventRules The event notification rules to set.
 */
export interface SetDefaultEventRulesInput {
  handleId: HandleId
  eventRules: EventNotificationRules
}

/**
 * Input for `NotificationsModule.setRecipientChatRules` method.
 *
 * @interface SetRecipientChatRulesInput
 * @property {HandleId} handleId The owner of the notification settings.
 * @property {Recipient} recipient The recipient of the notification settings.
 * @property {ChatNotificationRules} chatRules The chat notification rules to set.
 */
export interface SetRecipientChatRulesInput {
  handleId: HandleId
  recipient: Recipient
  chatRules: ChatNotificationRules
}

/**
 * Input for `NotificationsModule.clearRecipientChatRules` method.
 *
 * @interface ClearRecipientChatRulesInput
 * @property {HandleId} handleId The owner of the notification settings.
 * @property {Recipient} recipient The recipient of the notification settings.
 */
export interface ClearRecipientChatRulesInput {
  handleId: HandleId
  recipient: Recipient
}

/**
 * Notification related methods for the Secure Communications Service.
 */
export interface NotificationsModule {
  /**
   * Decode a remote notification content into a {@link NotificationInfo}.
   *
   * @param {GetDecodedInfoInput} input Parameters used to decode a notification content.
   * @returns {NotificationInfo | undefined} The decoded notification info, or undefined if the notification content is not a valid notification.
   */
  getDecodedInfo(
    input: GetDecodedInfoInput,
  ): Promise<NotificationInfo | undefined>

  /**
   * Get all notification settings.
   *
   * @param {GetSettingsInput} input Parameters used to get the notification settings.
   * @returns {NotificationSettings} The notification settings for the given handle.
   */
  getSettings(input: GetSettingsInput): Promise<NotificationSettings>

  /**
   * Set the default notification rules for events (e.g. invitations).
   *
   * @param {SetDefaultEventRulesInput} input Parameters used to set the default event notification rules.
   * @returns {void}
   */
  setDefaultEventRules(input: SetDefaultEventRulesInput): Promise<void>

  /**
   * Set the default notification rules for all recipients (direct chats, groups, channels).
   *
   * @param {SetDefaultChatRulesInput} input Parameters used to set the default chat notification rules.
   * @returns {void}
   */
  setDefaultChatRules(input: SetDefaultChatRulesInput): Promise<void>

  /**
   * Set the notification rule for a specific recipient (which will take precedence over the default chat rules).
   *
   * @param {SetRecipientChatRulesInput} input Parameters used to set the override chat notification rules.
   * @returns {void}
   */
  setRecipientChatRules(input: SetRecipientChatRulesInput): Promise<void>

  /**
   * Clear the notification rule for a specific recipient.
   *
   * @param {ClearRecipientChatRulesInput} input Parameters used to clear the override chat notification rules.
   * @returns {void}
   */
  clearRecipientChatRules(input: ClearRecipientChatRulesInput): Promise<void>
}

export class DefaultNotificationsModule implements NotificationsModule {
  private readonly log: Logger

  public constructor(private readonly sessionManager: SessionManager) {
    this.log = new DefaultLogger(this.constructor.name)
  }

  getDecodedInfo(
    input: GetDecodedInfoInput,
  ): Promise<NotificationInfo | undefined> {
    this.log.debug(this.getDecodedInfo.name, {
      input,
    })

    const getDecodedInfoUseCase = new GetDecodedInfoUseCase(this.sessionManager)

    return getDecodedInfoUseCase.execute(input)
  }

  async getSettings(input: GetSettingsInput): Promise<NotificationSettings> {
    this.log.debug(this.getSettings.name, {
      input,
    })

    const getSettingsUseCase = new GetSettingsUseCase(this.sessionManager)

    return getSettingsUseCase.execute(input)
  }

  setDefaultEventRules(input: SetDefaultEventRulesInput): Promise<void> {
    this.log.debug(this.setDefaultEventRules.name, {
      input,
    })

    const setDefaultEventRulesUseCase = new SetDefaultEventRulesUseCase(
      this.sessionManager,
    )

    return setDefaultEventRulesUseCase.execute(input)
  }

  setDefaultChatRules(input: SetDefaultChatRulesInput): Promise<void> {
    this.log.debug(this.setDefaultChatRules.name, {
      input,
    })

    const setDefaultChatRulesUseCase = new SetDefaultChatRulesUseCase(
      this.sessionManager,
    )

    return setDefaultChatRulesUseCase.execute(input)
  }

  setRecipientChatRules(input: SetRecipientChatRulesInput): Promise<void> {
    this.log.debug(this.setRecipientChatRules.name, {
      input,
    })

    const setRecipientChatRulesUseCase = new SetRecipientChatRulesUseCase(
      this.sessionManager,
    )

    return setRecipientChatRulesUseCase.execute(input)
  }

  clearRecipientChatRules(input: ClearRecipientChatRulesInput): Promise<void> {
    this.log.debug(this.clearRecipientChatRules.name, {
      input,
    })

    const clearRecipientChatRulesUseCase = new ClearRecipientChatRulesUseCase(
      this.sessionManager,
    )

    return clearRecipientChatRulesUseCase.execute(input)
  }
}
