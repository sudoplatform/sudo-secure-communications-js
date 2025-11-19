/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { WordValidationService } from '../../domain/entities/wordValidation/wordValidationService'
import { ApiClient } from '../common/apiClient'

export class DefaultWordValidationService implements WordValidationService {
  constructor(private readonly appSync: ApiClient) {}

  async checkWordValidity(words: Set<string>): Promise<Set<string>> {
    const result = await this.appSync.checkSecureCommsWordValidity([...words])
    return new Set(result)
  }
}
