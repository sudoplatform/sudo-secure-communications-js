/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { GraphQLOptions } from '@aws-amplify/api-graphql'
import {
  ApiClientManager,
  DefaultApiClientManager,
} from '@sudoplatform/sudo-api-client'
import {
  DefaultLogger,
  FatalError,
  GraphQLNetworkError,
  Logger,
  UnknownGraphQLError,
  isGraphQLNetworkError,
  mapNetworkErrorToClientError,
} from '@sudoplatform/sudo-common'
import { GraphQLClient } from '@sudoplatform/sudo-user'
import { ErrorTransformer } from './transformer/errorTransformer'
import {
  BatchPublicSecureCommsChannelInfo,
  CheckSecureCommsWordValidityDocument,
  CheckSecureCommsWordValidityQuery,
  CheckSecureCommsWordValidityQueryVariables,
  CreateSecureCommsChannelDocument,
  CreateSecureCommsChannelInput,
  CreateSecureCommsChannelMutation,
  CreateSecureCommsHandleDocument,
  CreateSecureCommsHandleInput,
  CreateSecureCommsHandleMutation,
  DeleteSecureCommsChannelDocument,
  DeleteSecureCommsChannelMutation,
  DeleteSecureCommsHandleDocument,
  DeleteSecureCommsHandleMutation,
  GetMediaBucketCredentialDocument,
  GetMediaBucketCredentialInput,
  GetMediaBucketCredentialQuery,
  GetMediaBucketCredentialQueryVariables,
  GetSecureCommsChannelDocument,
  GetSecureCommsChannelQuery,
  GetSecureCommsChannelQueryVariables,
  GetSecureCommsChannelsDocument,
  GetSecureCommsChannelsQuery,
  GetSecureCommsChannelsQueryVariables,
  GetSecureCommsHandleByNameDocument,
  GetSecureCommsHandleByNameQuery,
  GetSecureCommsHandleByNameQueryVariables,
  GetSecureCommsSessionDocument,
  GetSecureCommsSessionInput,
  GetSecureCommsSessionQuery,
  GetSecureCommsSessionQueryVariables,
  ListSecureCommsHandlesDocument,
  ListSecureCommsHandlesQuery,
  ListSecureCommsHandlesQueryVariables,
  ListSecureCommsPublicChannelsDocument,
  ListSecureCommsPublicChannelsInput,
  ListSecureCommsPublicChannelsQuery,
  ListSecureCommsPublicChannelsQueryVariables,
  ListedSecureCommsChannelInfoConnection,
  MediaBucketCredential,
  PublicSecureCommsChannelInfo,
  PublicSecureCommsHandleInfo,
  SecureCommsChannel,
  SecureCommsHandle,
  SecureCommsHandleConnection,
  SecureCommsSession,
  UpdateSecureCommsChannelDocument,
  UpdateSecureCommsChannelInput,
  UpdateSecureCommsChannelMutation,
  UpdateSecureCommsHandleDocument,
  UpdateSecureCommsHandleInput,
  UpdateSecureCommsHandleMutation,
} from '../../../gen/graphqlTypes'

export class ApiClient {
  private readonly log: Logger
  private readonly client: GraphQLClient

  private readonly graphqlErrorTransformer: ErrorTransformer

  public constructor(apiClientManager?: ApiClientManager) {
    this.log = new DefaultLogger(this.constructor.name)
    this.graphqlErrorTransformer = new ErrorTransformer()
    const clientManager =
      apiClientManager ?? DefaultApiClientManager.getInstance()
    this.client = clientManager.getClient({
      configNamespace: 'secureCommsService',
    })
  }

  public async createSecureCommsHandle(
    input: CreateSecureCommsHandleInput,
  ): Promise<SecureCommsSession> {
    const data = await this.performMutation<CreateSecureCommsHandleMutation>({
      mutation: CreateSecureCommsHandleDocument,
      variables: { input },
      calleeName: this.createSecureCommsHandle.name,
    })
    return data.createSecureCommsHandle
  }

  public async getSecureCommsSession(
    input: GetSecureCommsSessionInput,
  ): Promise<SecureCommsSession> {
    const data = await this.performQuery<GetSecureCommsSessionQuery>({
      query: GetSecureCommsSessionDocument,
      variables: { input } as GetSecureCommsSessionQueryVariables,
      calleeName: this.getSecureCommsSession.name,
    })
    return data.getSecureCommsSession
  }

  public async getSecureCommsHandleByName(
    name: string,
  ): Promise<PublicSecureCommsHandleInfo | undefined> {
    const data = await this.performQuery<GetSecureCommsHandleByNameQuery>({
      query: GetSecureCommsHandleByNameDocument,
      variables: { name } as GetSecureCommsHandleByNameQueryVariables,
      calleeName: this.getSecureCommsHandleByName.name,
    })
    return data.getSecureCommsHandleByName ?? undefined
  }

  public async updateSecureCommsHandle(
    input: UpdateSecureCommsHandleInput,
  ): Promise<SecureCommsHandle> {
    const data = await this.performMutation<UpdateSecureCommsHandleMutation>({
      mutation: UpdateSecureCommsHandleDocument,
      variables: { input },
      calleeName: this.updateSecureCommsHandle.name,
    })
    return data.updateSecureCommsHandle
  }

  public async deleteSecureCommsHandle(id: string): Promise<SecureCommsHandle> {
    const data = await this.performMutation<DeleteSecureCommsHandleMutation>({
      mutation: DeleteSecureCommsHandleDocument,
      variables: { id },
      calleeName: this.deleteSecureCommsHandle.name,
    })
    return data.deleteSecureCommsHandle
  }

  public async listSecureCommsHandles(
    limit?: number,
    nextToken?: string,
  ): Promise<SecureCommsHandleConnection> {
    const data = await this.performQuery<ListSecureCommsHandlesQuery>({
      query: ListSecureCommsHandlesDocument,
      variables: { limit, nextToken } as ListSecureCommsHandlesQueryVariables,
      calleeName: this.listSecureCommsHandles.name,
    })
    return data.listSecureCommsHandles
  }

  public async createSecureCommsChannel(
    input: CreateSecureCommsChannelInput,
  ): Promise<SecureCommsChannel> {
    const data = await this.performMutation<CreateSecureCommsChannelMutation>({
      mutation: CreateSecureCommsChannelDocument,
      variables: { input },
      calleeName: this.createSecureCommsChannel.name,
    })
    return data.createSecureCommsChannel
  }

  public async updateSecureCommsChannel(
    input: UpdateSecureCommsChannelInput,
  ): Promise<PublicSecureCommsChannelInfo> {
    const data = await this.performMutation<UpdateSecureCommsChannelMutation>({
      mutation: UpdateSecureCommsChannelDocument,
      variables: { input },
      calleeName: this.updateSecureCommsChannel.name,
    })
    return data.updateSecureCommsChannel
  }

  public async deleteSecureCommsChannel(
    id: string,
    handleId: string,
  ): Promise<PublicSecureCommsChannelInfo> {
    const data = await this.performMutation<DeleteSecureCommsChannelMutation>({
      mutation: DeleteSecureCommsChannelDocument,
      variables: { channelId: id, handleId },
      calleeName: this.deleteSecureCommsChannel.name,
    })
    return data.deleteSecureCommsChannel
  }

  public async getSecureCommsChannel(
    id: string,
  ): Promise<PublicSecureCommsChannelInfo | undefined> {
    const data = await this.performQuery<GetSecureCommsChannelQuery>({
      query: GetSecureCommsChannelDocument,
      variables: { id } as GetSecureCommsChannelQueryVariables,
      calleeName: this.getSecureCommsChannel.name,
    })
    return data.getSecureCommsChannel ?? undefined
  }

  public async listSecureCommsChannels(
    ids: string[],
  ): Promise<BatchPublicSecureCommsChannelInfo> {
    const data = await this.performQuery<GetSecureCommsChannelsQuery>({
      query: GetSecureCommsChannelsDocument,
      variables: { ids } as GetSecureCommsChannelsQueryVariables,
      calleeName: this.listSecureCommsChannels.name,
    })
    return data.getSecureCommsChannels
  }

  public async listSecureCommsPublicChannels(
    input: ListSecureCommsPublicChannelsInput,
  ): Promise<ListedSecureCommsChannelInfoConnection> {
    const data = await this.performQuery<ListSecureCommsPublicChannelsQuery>({
      query: ListSecureCommsPublicChannelsDocument,
      variables: { input } as ListSecureCommsPublicChannelsQueryVariables,
      calleeName: this.listSecureCommsPublicChannels.name,
    })
    return data.listSecureCommsPublicChannels
  }

  public async checkSecureCommsWordValidity(
    words: string[],
  ): Promise<string[]> {
    const data = await this.performQuery<CheckSecureCommsWordValidityQuery>({
      query: CheckSecureCommsWordValidityDocument,
      variables: { words } as CheckSecureCommsWordValidityQueryVariables,
      calleeName: this.checkSecureCommsWordValidity.name,
    })
    return data.checkSecureCommsWordValidity
  }

  public async getMediaBucketCredential(
    input: GetMediaBucketCredentialInput,
  ): Promise<MediaBucketCredential> {
    const data = await this.performQuery<GetMediaBucketCredentialQuery>({
      query: GetMediaBucketCredentialDocument,
      variables: { input } as GetMediaBucketCredentialQueryVariables,
      calleeName: this.getMediaBucketCredential.name,
    })
    return data.getMediaBucketCredential
  }

  private async performQuery<Q>({
    variables,
    query,
    calleeName,
  }: GraphQLOptions & { calleeName?: string }): Promise<Q> {
    let result
    try {
      result = await this.client.query<Q>({
        variables,
        query,
      })
    } catch (err) {
      if (isGraphQLNetworkError(err as Error)) {
        throw mapNetworkErrorToClientError(err as GraphQLNetworkError)
      }
      throw this.mapGraphQLCallError(err as Error)
    }

    const error = result.errors?.[0]
    if (error) {
      this.log.debug('appsync query failed with error', { error })
      throw this.graphqlErrorTransformer.toClientError(error)
    }
    if (result.data) {
      return result.data
    } else {
      throw new FatalError(
        `${calleeName ?? '<no callee>'} did not return any result`,
      )
    }
  }

  private async performMutation<M>({
    mutation,
    variables,
    calleeName,
  }: Omit<GraphQLOptions, 'query'> & {
    mutation: GraphQLOptions['query']
    calleeName?: string
  }): Promise<M> {
    let result
    try {
      result = await this.client.mutate<M>({
        mutation,
        variables,
      })
    } catch (err) {
      if (isGraphQLNetworkError(err as Error)) {
        throw mapNetworkErrorToClientError(err as GraphQLNetworkError)
      }
      throw this.mapGraphQLCallError(err as Error)
    }
    const error = result.errors?.[0]
    if (error) {
      this.log.debug('appSync mutation failed with error', { error })
      throw this.graphqlErrorTransformer.toClientError(error)
    }
    if (result.data) {
      return result.data
    } else {
      throw new FatalError(
        `${calleeName ?? '<no callee>'} did not return any result`,
      )
    }
  }

  mapGraphQLCallError = (err: Error): Error => {
    if ('graphQLErrors' in err && Array.isArray(err.graphQLErrors)) {
      const error = err.graphQLErrors[0] as {
        errorType: string
        message: string
        name: string
      }
      if (error) {
        this.log.debug('appSync operation failed with error', { err })
        return this.graphqlErrorTransformer.toClientError(error)
      }
    }
    if ('errorType' in err) {
      this.log.debug('appSync operation failed with error', { err })
      return this.graphqlErrorTransformer.toClientError(
        err as { errorType: string; message: string; errorInfo?: string },
      )
    }
    return new UnknownGraphQLError(err)
  }
}
