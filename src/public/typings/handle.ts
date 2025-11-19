/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { Owner } from '@sudoplatform/sudo-common'

/**
 * The Sudo Platform SDK representation of a Handle.
 * 
 * @interface Handle
 * @property {HandleId} handleId Unique identifier associated with the handle.
 * @property {string} name The name of the handle that will be publicly visible to other users.
 */
export interface Handle {
  handleId: HandleId,
  name: string,
}

/**
 * The Sudo Platform SDK representation of a Handle owned by this client's user.
 * 
 * @interface OwnedHandle
 * @property {HandleId} handleId See {@link Handle.handleId}.
 * @property {string} name See {@link Handle.name}.
 * @property {string} owner Identifier of the user that owns the handle.
 * @property {Owner[]} owners List of identifiers of the user/sudo associated with this handle.
 */
export interface OwnedHandle extends Handle {
  owner: string,
  owners: Owner[]
}

/**
 * Identifier type representing a unique handle.
 */
export class HandleId {
  value: string

  constructor(value: string) {
    this.value = value
  }

  toString(): string {
    return this.value
  }
}
