/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { HandleId } from '../../../../public'
import { OwnerEntity } from '../common/ownerEntity'

/**
 * Core entity representation of public handle information business rule.
 *
 * @interface HandleEntity
 * @property {HandleId} handleId Unique identifier associated with the handle.
 * @property {string} name The name of the handle that will be publicly visible to other users.
 */
export interface HandleEntity {
  handleId: HandleId
  name: string
}

/**
 * Core entity representation of a handle business rule owned by this client.
 *
 * @interface OwnedHandleEntity
 * @property {HandleId} handleId See {@link HandleEntity.handleId}.
 * @property {string} name See {@link HandleEntity.name}.
 * @property {string} owner Identifier of the user that owns the handle.
 * @property {Owner[]} owners List of identifiers of the user/sudo associated with this handle.
 */
export interface OwnedHandleEntity extends HandleEntity {
  owner: string
  owners: OwnerEntity[]
}
