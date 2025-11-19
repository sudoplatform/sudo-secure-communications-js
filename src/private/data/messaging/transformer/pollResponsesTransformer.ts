/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { PollResponses } from '../../../../public/typings/poll'
import { PollResponsesEntity } from '../../../domain/entities/messaging/pollEntity'

export class PollResponsesTransformer {
  fromAPIToEntity(data: PollResponses): PollResponsesEntity {
    return {
      talliedAnswers: data.talliedAnswers,
      totalVotes: data.totalVotes,
      endedAt: data.endedAt,
    }
  }

  fromEntityToAPI(entity: PollResponsesEntity): PollResponses {
    return {
      talliedAnswers: entity.talliedAnswers,
      totalVotes: entity.totalVotes,
      endedAt: entity.endedAt,
    }
  }
}
