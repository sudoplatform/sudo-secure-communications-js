/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { FileEncryptionInfo } from '../../../../public/typings/fileEncryptionInfo'
import { FileEncryptionInfoEntity } from '../../../domain/entities/media/fileEncryptionInfoEntity'

export class FileEncryptionInfoTransformer {
  fromAPIToEntity(data: FileEncryptionInfo): FileEncryptionInfoEntity {
    return {
      key: data.key,
      iv: data.iv,
      v: data.v,
      hashes: data.hashes,
    }
  }
}
