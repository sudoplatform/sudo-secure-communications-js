/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { ChannelRoleTransformer } from './channelRoleTransformer'
import {
  ChannelPermissions,
  ChannelPermissionsInput,
} from '../../../../public/typings/channel'
import {
  ChannelPermissionsEntity,
  ChannelPermissionsInputEntity,
} from '../../../domain/entities/channels/channelEntity'

export class ChannelPermissionsTransformer {
  fromEntityToAPI(entity: ChannelPermissionsEntity): ChannelPermissions {
    const channelRoleTransformer = new ChannelRoleTransformer()
    return {
      sendMessages: channelRoleTransformer.fromEntityToAPI(entity.sendMessages),
      inviteHandles: channelRoleTransformer.fromEntityToAPI(
        entity.inviteHandles,
      ),
      kickHandles: channelRoleTransformer.fromEntityToAPI(entity.kickHandles),
      banHandles: channelRoleTransformer.fromEntityToAPI(entity.banHandles),
      changeChannelName: channelRoleTransformer.fromEntityToAPI(
        entity.changeChannelName,
      ),
      changeChannelDescription: channelRoleTransformer.fromEntityToAPI(
        entity.changeChannelDescription,
      ),
      changeChannelAvatar: channelRoleTransformer.fromEntityToAPI(
        entity.changeChannelAvatar,
      ),
      deleteOthersMessages: channelRoleTransformer.fromEntityToAPI(
        entity.deleteOthersMessages,
      ),
    }
  }

  fromInputAPIToEntity(
    data: ChannelPermissionsInput,
  ): ChannelPermissionsInputEntity {
    const channelRoleTransformer = new ChannelRoleTransformer()
    return {
      sendMessages: data.sendMessages
        ? channelRoleTransformer.fromAPIToEntity(data.sendMessages)
        : undefined,
      inviteHandles: data.inviteHandles
        ? channelRoleTransformer.fromAPIToEntity(data.inviteHandles)
        : undefined,
      kickHandles: data.kickHandles
        ? channelRoleTransformer.fromAPIToEntity(data.kickHandles)
        : undefined,
      banHandles: data.banHandles
        ? channelRoleTransformer.fromAPIToEntity(data.banHandles)
        : undefined,
      changeChannelName: data.changeChannelName
        ? channelRoleTransformer.fromAPIToEntity(data.changeChannelName)
        : undefined,
      changeChannelDescription: data.changeChannelDescription
        ? channelRoleTransformer.fromAPIToEntity(data.changeChannelDescription)
        : undefined,
      changeChannelAvatar: data.changeChannelAvatar
        ? channelRoleTransformer.fromAPIToEntity(data.changeChannelAvatar)
        : undefined,
      deleteOthersMessages: data.deleteOthersMessages
        ? channelRoleTransformer.fromAPIToEntity(data.deleteOthersMessages)
        : undefined,
    }
  }
}
