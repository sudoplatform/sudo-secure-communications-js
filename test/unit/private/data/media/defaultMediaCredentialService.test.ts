/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  anything,
  capture,
  instance,
  mock,
  reset,
  verify,
  when,
} from 'ts-mockito'
import { MediaBucketOperation } from '../../../../../src/gen/graphqlTypes'
import { ApiClient } from '../../../../../src/private/data/common/apiClient'
import { DefaultMediaCredentialService } from '../../../../../src/private/data/media/defaultMediaCredentialService'
import { EntityDataFactory } from '../../../../data-factory/entity'
import { GraphQLDataFactory } from '../../../../data-factory/graphQL'

describe('DefaultMediaCredentialService Test Suite', () => {
  const mockAppSync = mock<ApiClient>()
  let instanceUnderTest: DefaultMediaCredentialService

  beforeEach(() => {
    reset(mockAppSync)
    instanceUnderTest = new DefaultMediaCredentialService(instance(mockAppSync))
  })

  describe('get', () => {
    it.each`
      forWrite | bucketOperation
      ${false} | ${MediaBucketOperation.Read}
      ${true}  | ${MediaBucketOperation.ReadWrite}
    `(
      'calls appSync and returns result correctly with $bucketOperation bucket operation',
      async ({ forWrite, bucketOperation }) => {
        when(mockAppSync.getMediaBucketCredential(anything())).thenResolve(
          GraphQLDataFactory.mediaBucketCredential,
        )

        const handleId = 'handleId'
        const roomId = 'roomId'
        const result = await instanceUnderTest.get({
          handleId,
          forWrite,
          roomId,
        })

        expect(result).toStrictEqual(EntityDataFactory.roomMediaCredential)
        const [inputArg] = capture(mockAppSync.getMediaBucketCredential).first()
        expect(inputArg).toStrictEqual<typeof inputArg>({
          handleId,
          operation: bucketOperation,
          roomId,
        })
        verify(mockAppSync.getMediaBucketCredential(anything())).once()
      },
    )
  })
})
