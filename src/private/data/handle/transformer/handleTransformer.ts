/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  SecureCommsHandle as HandleGraphQL,
  PublicSecureCommsHandleInfo as PublicHandleInfoGraphQL,
} from '../../../../gen/graphqlTypes'
import { HandleId, OwnedHandle } from '../../../../public'
import {
  HandleEntity,
  OwnedHandleEntity,
} from '../../../domain/entities/handle/handleEntity'

export class HandleTransformer {
  fromEntityToAPI(entity: OwnedHandleEntity): OwnedHandle {
    return {
      handleId: entity.handleId,
      name: entity.name,
      owner: entity.owner,
      owners: entity.owners.map(({ id, issuer }) => ({ id, issuer })),
    }
  }

  fromGraphQLToEntity(data: PublicHandleInfoGraphQL): HandleEntity {
    return {
      handleId: new HandleId(data.id),
      name: data.name,
    }
  }

  fromGraphQLToOwnedEntity(data: HandleGraphQL): OwnedHandleEntity {
    return {
      handleId: new HandleId(data.id),
      name: data.name,
      owner: data.owner,
      owners: data.owners.map(({ id, issuer }) => ({ id, issuer })),
    }
  }
}
