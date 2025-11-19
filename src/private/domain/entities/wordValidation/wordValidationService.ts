/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Core entity representation of a word validation service used in business logic.
 *
 * @interface WordValidationService
 */
export interface WordValidationService {
  /**
   * Checks for the validity of a word used as a handle or channel name, keyword or tag.
   *
   * @param {Set<string>} words A set of words to check for validity.
   * @returns {Set<string>} An set of valid words based on the input.
   */
  checkWordValidity(words: Set<string>): Promise<Set<string>>
}
