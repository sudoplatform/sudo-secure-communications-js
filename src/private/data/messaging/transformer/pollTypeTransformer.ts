/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  M_POLL_KIND_DISCLOSED,
  M_POLL_KIND_UNDISCLOSED,
  PollKind,
} from 'matrix-js-sdk/lib/@types/polls'
import { PollType } from '../../../../public'
import { PollTypeEntity } from '../../../domain/entities/messaging/pollEntity'

export class PollTypeTransformer {
  fromAPIToEntity(data: PollType): PollTypeEntity {
    switch (data) {
      case PollType.DISCLOSED:
        return PollTypeEntity.DISCLOSED
      case PollType.UNDISCLOSED:
        return PollTypeEntity.UNDISCLOSED
    }
  }

  fromEntityToAPI(entity: PollTypeEntity): PollType {
    switch (entity) {
      case PollTypeEntity.DISCLOSED:
        return PollType.DISCLOSED
      case PollTypeEntity.UNDISCLOSED:
        return PollType.UNDISCLOSED
    }
  }

  fromEntityToMatrix(entity: PollTypeEntity): PollKind {
    switch (entity) {
      case PollTypeEntity.DISCLOSED:
        return M_POLL_KIND_DISCLOSED.name
      case PollTypeEntity.UNDISCLOSED:
        return M_POLL_KIND_UNDISCLOSED.name
    }
  }
}
