/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  ChatNotificationRules,
  EventNotificationRules,
  NotificationInfo,
  NotificationSettings,
  Recipient,
} from '../../../../public'

/**
 * Input for `NotificationService.getDecodedInfo` method.
 *
 * @interface GetDecodedInfoInput
 * @property {NotificationContent} message The notification content to decode.
 */
export interface GetDecodedInfoInput {
  eventId: string
  roomId: string
}

/**
 * Input for `NotificationService.setDefaultChatRules` method.
 *
 * @interface SetDefaultChatRulesInput
 * @property {ChatNotificationRules} chatRules The chat notification rules to set.
 */
export interface SetDefaultChatRulesInput {
  chatRules: ChatNotificationRules
}

/**
 * Input for `NotificationService.setDefaultEventRules` method.
 *
 * @interface SetDefaultEventRulesInput
 * @property {EventNotificationRules} eventRules The event notification rules to set.
 */
export interface SetDefaultEventRulesInput {
  eventRules: EventNotificationRules
}

/**
 * Input for `NotificationService.setRecipientChatRules` method.
 *
 * @interface SetRecipientChatRulesInput
 * @property {ChatNotificationRules} chatRules The chat notification rules to set.
 * @property {Recipient} recipient The recipient of the chat notification rules.
 */
export interface SetRecipientChatRulesInput {
  chatRules: ChatNotificationRules
  recipient: Recipient
}

/**
 * Input for `NotificationService.clearRecipientChatRules` method.
 *
 * @interface ClearRecipientChatRulesInput
 * @property {Recipient} recipient The recipient of the chat notification rules.
 */
export interface ClearRecipientChatRulesInput {
  recipient: Recipient
}

export interface NotificationService {
  /**
   * Get the decoded notification info.
   *
   * @param {GetDecodedInfoInput} input Parameters used to get the decoded notification info.
   * @returns {Promise<NotificationInfo>} The decoded notification info.
   */
  getDecodedInfo(input: GetDecodedInfoInput): Promise<NotificationInfo>

  /**
   * Get the notification settings.
   *
   * @returns {Promise<NotificationSettings>} The notification settings.
   */
  getSettings(): Promise<NotificationSettings>

  /**
   * Set the default chat notification rules.
   *
   * @param {SetDefaultChatRulesInput} input Parameters used to set the default chat notification rules.
   */
  setDefaultChatRules(input: SetDefaultChatRulesInput): Promise<void>

  /**
   * Set the default event notification rules.
   *
   * @param {SetDefaultEventRulesInput} input Parameters used to set the default event notification rules.
   */
  setDefaultEventRules(input: SetDefaultEventRulesInput): Promise<void>

  /**
   * Set the recipient chat notification rules.
   *
   * @param {SetRecipientChatRulesInput} input Parameters used to set the recipient chat notification rules.
   */
  setRecipientChatRules(input: SetRecipientChatRulesInput): Promise<void>

  /**
   * Clear the recipient chat notification rules.
   *
   * @param {ClearRecipientChatRulesInput} input Parameters used to clear the recipient chat notification rules.
   */
  clearRecipientChatRules(input: ClearRecipientChatRulesInput): Promise<void>
}
