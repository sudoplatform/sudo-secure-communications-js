/*
 * Copyright © 2026 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { AvatarImageMetadataInput } from '../../../../gen/graphqlTypes'
import { AvatarImageMetadataEntity } from '../../../domain/entities/common/avatarImageMetadataEntity'

export class AvatarImageMetadataTransformer {
  fromEntityToGraphQL(
    data: AvatarImageMetadataEntity,
  ): AvatarImageMetadataInput {
    return {
      mimeType: data.mimeType,
    }
  }
}
