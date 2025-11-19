/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  ApiClientManager,
  DefaultApiClientManager,
} from '@sudoplatform/sudo-api-client'
import {
  AppSyncNetworkError,
  DefaultLogger,
  FatalError,
  Logger,
  UnknownGraphQLError,
  isAppSyncNetworkError,
  mapNetworkErrorToClientError,
} from '@sudoplatform/sudo-common'
import { NormalizedCacheObject } from 'apollo-cache-inmemory'
import {
  MutationOptions,
  QueryOptions,
} from 'apollo-client/core/watchQueryOptions'
import { ApolloError } from 'apollo-client/errors/ApolloError'
import AWSAppSyncClient from 'aws-appsync'
import { ErrorTransformer } from './transformer/errorTransformer'
import {
  BatchPublicSecureCommsChannelInfo,
  CheckSecureCommsWordValidityDocument,
  CheckSecureCommsWordValidityQuery,
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
  GetSecureCommsChannelDocument,
  GetSecureCommsChannelQuery,
  GetSecureCommsChannelsDocument,
  GetSecureCommsChannelsQuery,
  GetSecureCommsHandleByNameDocument,
  GetSecureCommsHandleByNameQuery,
  GetSecureCommsSessionDocument,
  GetSecureCommsSessionInput,
  GetSecureCommsSessionQuery,
  ListSecureCommsHandlesDocument,
  ListSecureCommsHandlesQuery,
  ListSecureCommsPublicChannelsDocument,
  ListSecureCommsPublicChannelsInput,
  ListSecureCommsPublicChannelsQuery,
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
  private readonly client: AWSAppSyncClient<NormalizedCacheObject>

  private readonly graphqlErrorTransformer: ErrorTransformer

  public constructor(apiClientManager?: ApiClientManager) {
    this.log = new DefaultLogger(this.constructor.name)
    this.graphqlErrorTransformer = new ErrorTransformer()
    const clientManager =
      apiClientManager ?? DefaultApiClientManager.getInstance()
    this.client = clientManager.getClient({
      disableOffline: true,
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
      variables: { input },
      fetchPolicy: 'network-only',
      calleeName: this.getSecureCommsSession.name,
    })
    return data.getSecureCommsSession
  }

  public async getSecureCommsHandleByName(
    name: string,
  ): Promise<PublicSecureCommsHandleInfo | undefined> {
    const data = await this.performQuery<GetSecureCommsHandleByNameQuery>({
      query: GetSecureCommsHandleByNameDocument,
      variables: { name },
      fetchPolicy: 'network-only',
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
      variables: { limit, nextToken },
      fetchPolicy: 'network-only',
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
      variables: { id },
      fetchPolicy: 'network-only',
      calleeName: this.getSecureCommsChannel.name,
    })
    return data.getSecureCommsChannel ?? undefined
  }

  public async listSecureCommsChannels(
    ids: string[],
  ): Promise<BatchPublicSecureCommsChannelInfo> {
    const data = await this.performQuery<GetSecureCommsChannelsQuery>({
      query: GetSecureCommsChannelsDocument,
      variables: { ids },
      fetchPolicy: 'network-only',
      calleeName: this.listSecureCommsChannels.name,
    })
    return data.getSecureCommsChannels
  }

  public async listSecureCommsPublicChannels(
    input: ListSecureCommsPublicChannelsInput,
  ): Promise<ListedSecureCommsChannelInfoConnection> {
    const data = await this.performQuery<ListSecureCommsPublicChannelsQuery>({
      query: ListSecureCommsPublicChannelsDocument,
      variables: { input },
      fetchPolicy: 'network-only',
      calleeName: this.listSecureCommsPublicChannels.name,
    })
    return data.listSecureCommsPublicChannels
  }

  public async checkSecureCommsWordValidity(
    words: string[],
  ): Promise<string[]> {
    const data = await this.performQuery<CheckSecureCommsWordValidityQuery>({
      query: CheckSecureCommsWordValidityDocument,
      variables: { words },
      fetchPolicy: 'network-only',
      calleeName: this.checkSecureCommsWordValidity.name,
    })
    return data.checkSecureCommsWordValidity
  }

  public async getMediaBucketCredential(
    input: GetMediaBucketCredentialInput,
  ): Promise<MediaBucketCredential> {
    const data = await this.performQuery<GetMediaBucketCredentialQuery>({
      query: GetMediaBucketCredentialDocument,
      variables: { input },
      fetchPolicy: 'network-only',
      calleeName: this.getMediaBucketCredential.name,
    })
    return data.getMediaBucketCredential
  }

  private async performQuery<Q>({
    variables,
    fetchPolicy,
    query,
    calleeName,
  }: QueryOptions & { calleeName?: string }): Promise<Q> {
    let result
    try {
      result = await this.client.query<Q>({
        variables,
        fetchPolicy,
        query,
      })
    } catch (err) {
      if (isAppSyncNetworkError(err as Error)) {
        throw mapNetworkErrorToClientError(err as AppSyncNetworkError)
      }

      const clientError = err as ApolloError
      this.log.debug('error received', { calleeName, clientError })
      const error = clientError.graphQLErrors?.[0]
      if (error) {
        this.log.debug('appSync query failed with error', { error })
        throw this.graphqlErrorTransformer.toClientError(error)
      } else {
        throw new UnknownGraphQLError(err)
      }
    }

    const error = result.errors?.[0]
    if (error) {
      this.log.debug('error received', { error })
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
  }: Omit<MutationOptions<M>, 'fetchPolicy'> & {
    calleeName?: string
  }): Promise<M> {
    let result
    try {
      result = await this.client.mutate<M>({
        mutation,
        variables,
      })
    } catch (err) {
      if (isAppSyncNetworkError(err as Error)) {
        throw mapNetworkErrorToClientError(err as AppSyncNetworkError)
      }

      const clientError = err as ApolloError
      this.log.debug('error received', { calleeName, clientError })
      const error = clientError.graphQLErrors?.[0]
      if (error) {
        this.log.debug('appSync mutation failed with error', { error })
        throw this.graphqlErrorTransformer.toClientError(error)
      } else {
        throw new UnknownGraphQLError(err)
      }
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
}
