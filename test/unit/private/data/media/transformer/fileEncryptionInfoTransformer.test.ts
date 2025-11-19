/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { FileEncryptionInfoTransformer } from '../../../../../../src/private/data/media/transformer/fileEncryptionInfoTransformer'
import { APIDataFactory } from '../../../../../data-factory/api'
import { EntityDataFactory } from '../../../../../data-factory/entity'

describe('FileEncryptionInfoTransformer Test Suite', () => {
  const instanceUnderTest = new FileEncryptionInfoTransformer()

  describe('fromAPItoEntity', () => {
    it('transforms from API to entity type successfully', () => {
      expect(
        instanceUnderTest.fromAPIToEntity(APIDataFactory.fileEncryptionInfo),
      ).toStrictEqual(EntityDataFactory.fileEncryptionInfo)
    })
  })
})
