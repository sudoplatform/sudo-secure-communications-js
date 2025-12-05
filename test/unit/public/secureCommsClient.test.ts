/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { DefaultConfigurationManager } from '@sudoplatform/sudo-common'
import { SudoUserClient, internal as userSdk } from '@sudoplatform/sudo-user'
import { WebSudoCryptoProvider } from '@sudoplatform/sudo-web-crypto-provider'
import {
  anything,
  capture,
  instance,
  mock,
  reset,
  verify,
  when,
} from 'ts-mockito'
import { v4 } from 'uuid'
import { DefaultChannelsService } from '../../../src/private/data/channels/defaultChannelsService'
import { ApiClient } from '../../../src/private/data/common/apiClient'
import { SecureCommsServiceConfig } from '../../../src/private/data/common/config'
import { PrivateSecureCommsClientOptions } from '../../../src/private/data/common/privateSecureCommsClientOptions'
import { DefaultHandleService } from '../../../src/private/data/handle/defaultHandleService'
import { MatrixMediaService } from '../../../src/private/data/media/matrixMediaService'
import { MatrixMessagingService } from '../../../src/private/data/messaging/matrixMessagingService'
import { DefaultNotificationService } from '../../../src/private/data/notification/defaultNotificationService'
import { MatrixRoomsService } from '../../../src/private/data/rooms/matrixRoomsService'
import { MatrixSecurityService } from '../../../src/private/data/security/matrixSecurityService'
import { DefaultSessionService } from '../../../src/private/data/session/defaultSessionService'
import { MembershipStateEntity } from '../../../src/private/domain/entities/common/memberEntity'
import { AcceptInvitationUseCase as AcceptChannelInvitationUseCase } from '../../../src/private/domain/use-cases/channels/acceptInvitationUseCase'
import { BanHandleUseCase as BanChannelHandleUseCase } from '../../../src/private/domain/use-cases/channels/banHandleUseCase'
import { CreateChannelUseCase } from '../../../src/private/domain/use-cases/channels/createChannelUseCase'
import { DeclineInvitationUseCase as DeclineChannelInvitationUseCase } from '../../../src/private/domain/use-cases/channels/declineInvitationUseCase'
import { DeleteChannelUseCase } from '../../../src/private/domain/use-cases/channels/deleteChannelUseCase'
import { GetChannelMembersUseCase } from '../../../src/private/domain/use-cases/channels/getChannelMembersUseCase'
import { GetChannelMembershipUseCase } from '../../../src/private/domain/use-cases/channels/getChannelMembershipUseCase'
import { GetChannelUseCase } from '../../../src/private/domain/use-cases/channels/getChannelUseCase'
import { GetChannelsUseCase } from '../../../src/private/domain/use-cases/channels/getChannelsUseCase'
import { JoinChannelUseCase } from '../../../src/private/domain/use-cases/channels/joinChannelUseCase'
import { KickHandleUseCase as KickChannelHandleUseCase } from '../../../src/private/domain/use-cases/channels/kickHandleUseCase'
import { LeaveChannelUseCase } from '../../../src/private/domain/use-cases/channels/leaveChannelUseCase'
import { ListInvitationsUseCase as ListChannelInvitationsUseCase } from '../../../src/private/domain/use-cases/channels/listInvitationsUseCase'
import { ListJoinedChannelsUseCase } from '../../../src/private/domain/use-cases/channels/listJoinedChannelsUseCase'
import { ListReceivedInvitationRequestsUseCase } from '../../../src/private/domain/use-cases/channels/listReceivedInvitationRequestsUseCase'
import { ListSentInvitationRequestsUseCase } from '../../../src/private/domain/use-cases/channels/listSentInvitationRequestsUseCase'
import { SearchPublicChannelsUseCase } from '../../../src/private/domain/use-cases/channels/searchPublicChannelsUseCase'
import { SendInvitationRequestUseCase } from '../../../src/private/domain/use-cases/channels/sendInvitationRequestUseCase'
import { SendInvitationsUseCase as SendChannelInvitationsUseCase } from '../../../src/private/domain/use-cases/channels/sendInvitationsUseCase'
import { UnbanHandleUseCase as UnbanChannelHandleUseCase } from '../../../src/private/domain/use-cases/channels/unbanHandleUseCase'
import { UpdateChannelMemberRoleUseCase } from '../../../src/private/domain/use-cases/channels/updateChannelMemberRoleUseCase'
import { UpdateChannelUseCase } from '../../../src/private/domain/use-cases/channels/updateChannelUseCase'
import { WithdrawInvitationUseCase as WithdrawChannelInvitationUseCase } from '../../../src/private/domain/use-cases/channels/withdrawInvitationUseCase'
import { AcceptInvitationUseCase as AcceptDirectChatInvitationUseCase } from '../../../src/private/domain/use-cases/directChats/acceptInvitationUseCase'
import { BlockHandleUseCase } from '../../../src/private/domain/use-cases/directChats/blockHandleUseCase'
import { CreateChatUseCase } from '../../../src/private/domain/use-cases/directChats/createChatUseCase'
import { DeclineInvitationUseCase as DeclineDirectChatInvitationUseCase } from '../../../src/private/domain/use-cases/directChats/declineInvitationUseCase'
import { ListBlockedHandlesUseCase } from '../../../src/private/domain/use-cases/directChats/listBlockedHandlesUseCase'
import { ListInvitationsUseCase as ListDirectChatInvitationsUseCase } from '../../../src/private/domain/use-cases/directChats/listInvitationsUseCase'
import { ListJoinedChatsUseCase } from '../../../src/private/domain/use-cases/directChats/listJoinedChatsUseCase'
import { UnblockHandleUseCase } from '../../../src/private/domain/use-cases/directChats/unblockHandleUseCase'
import { AcceptInvitationUseCase as AcceptGroupInvitationUseCase } from '../../../src/private/domain/use-cases/groups/acceptInvitationUseCase'
import { BanHandleUseCase as BanGroupHandleUseCase } from '../../../src/private/domain/use-cases/groups/banHandleUseCase'
import { CreateGroupUseCase } from '../../../src/private/domain/use-cases/groups/createGroupUseCase'
import { DeclineInvitationUseCase as DeclineGroupInvitationUseCase } from '../../../src/private/domain/use-cases/groups/declineInvitationUseCase'
import { DeleteGroupUseCase } from '../../../src/private/domain/use-cases/groups/deleteGroupUseCase'
import { GetGroupMembersUseCase } from '../../../src/private/domain/use-cases/groups/getGroupMembersUseCase'
import { GetGroupUseCase } from '../../../src/private/domain/use-cases/groups/getGroupUseCase'
import { GetGroupsUseCase } from '../../../src/private/domain/use-cases/groups/getGroupsUseCase'
import { KickHandleUseCase as KickGroupHandleUseCase } from '../../../src/private/domain/use-cases/groups/kickHandleUseCase'
import { LeaveGroupUseCase } from '../../../src/private/domain/use-cases/groups/leaveGroupUseCase'
import { ListInvitationsUseCase as ListGroupInvitationsUseCase } from '../../../src/private/domain/use-cases/groups/listInvitationsUseCase'
import { ListJoinedGroupsUseCase } from '../../../src/private/domain/use-cases/groups/listJoinedGroupsUseCase'
import { SendInvitationsUseCase as SendGroupInvitationsUseCase } from '../../../src/private/domain/use-cases/groups/sendInvitationsUseCase'
import { UnbanHandleUseCase as UnbanGroupHandleUseCase } from '../../../src/private/domain/use-cases/groups/unbanHandleUseCase'
import { UpdateGroupMemberRoleUseCase } from '../../../src/private/domain/use-cases/groups/updateGroupMemberRoleUseCase'
import { UpdateGroupUseCase } from '../../../src/private/domain/use-cases/groups/updateGroupUseCase'
import { WithdrawInvitationUseCase as WithdrawGroupInvitationUseCase } from '../../../src/private/domain/use-cases/groups/withdrawInvitationUseCase'
import { DeprovisionHandleUseCase } from '../../../src/private/domain/use-cases/handles/deprovisionHandleUseCase'
import { ListHandlesUseCase } from '../../../src/private/domain/use-cases/handles/listHandlesUseCase'
import { ProvisionHandleUseCase } from '../../../src/private/domain/use-cases/handles/provisionHandleUseCase'
import { UpdateHandleUseCase } from '../../../src/private/domain/use-cases/handles/updateHandleUseCase'
import { DownloadMediaFileUseCase } from '../../../src/private/domain/use-cases/media/downloadMediaFileUseCase'
import { CreatePollUseCase } from '../../../src/private/domain/use-cases/messaging/createPollUseCase'
import { DeleteMessageUseCase } from '../../../src/private/domain/use-cases/messaging/deleteMessageUseCase'
import { EditMessageUseCase } from '../../../src/private/domain/use-cases/messaging/editMessageUseCase'
import { EditPollUseCase } from '../../../src/private/domain/use-cases/messaging/editPollUseCase'
import { EndPollUseCase } from '../../../src/private/domain/use-cases/messaging/endPollUseCase'
import { GetChatSummariesUseCase } from '../../../src/private/domain/use-cases/messaging/getChatSummariesUseCase'
import { GetMessageUseCase } from '../../../src/private/domain/use-cases/messaging/getMessageUseCase'
import { GetMessagesUseCase } from '../../../src/private/domain/use-cases/messaging/getMessagesUseCase'
import { GetPinnedMessagesUseCase } from '../../../src/private/domain/use-cases/messaging/getPinnedMessagesUseCase'
import { GetPollResponsesUseCase } from '../../../src/private/domain/use-cases/messaging/getPollResponsesUseCase'
import { MarkAsReadUseCase } from '../../../src/private/domain/use-cases/messaging/markAsReadUseCase'
import { PinUnpinMessageUseCase } from '../../../src/private/domain/use-cases/messaging/pinUnpinMessageUseCase'
import { SearchMessagesUseCase } from '../../../src/private/domain/use-cases/messaging/searchMessagesUseCase'
import { SendMediaUseCase } from '../../../src/private/domain/use-cases/messaging/sendMediaUseCase'
import { SendMessageUseCase } from '../../../src/private/domain/use-cases/messaging/sendMessageUseCase'
import { SendPollResponseUseCase } from '../../../src/private/domain/use-cases/messaging/sendPollResponseUseCase'
import { SendReplyMessageUseCase } from '../../../src/private/domain/use-cases/messaging/sendReplyMessageUseCase'
import { SendThreadMessageUseCase } from '../../../src/private/domain/use-cases/messaging/sendThreadMessageUseCase'
import { SendTypingNotificationUseCase } from '../../../src/private/domain/use-cases/messaging/sendTypingNotificationUseCase'
import { ToggleReactionUseCase } from '../../../src/private/domain/use-cases/messaging/toggleReactionUseCase'
import { ClearRecipientChatRulesUseCase } from '../../../src/private/domain/use-cases/notifications/clearRecipientChatRulesUseCase'
import { GetDecodedInfoUseCase } from '../../../src/private/domain/use-cases/notifications/getDecodedInfoUseCase'
import { GetSettingsUseCase } from '../../../src/private/domain/use-cases/notifications/getSettingsUseCase'
import { SetDefaultChatRulesUseCase } from '../../../src/private/domain/use-cases/notifications/setDefaultChatRulesUseCase'
import { SetDefaultEventRulesUseCase } from '../../../src/private/domain/use-cases/notifications/setDefaultEventRulesUseCase'
import { SetRecipientChatRulesUseCase } from '../../../src/private/domain/use-cases/notifications/setRecipientChatRulesUseCase'
import { AcceptVerificationUseCase } from '../../../src/private/domain/use-cases/security/acceptVerificationUseCase'
import { ApproveVerificationUseCase } from '../../../src/private/domain/use-cases/security/approveVerificationUseCase'
import { CancelVerificationUseCase } from '../../../src/private/domain/use-cases/security/cancelVerificationUseCase'
import { CreateBackupUseCase } from '../../../src/private/domain/use-cases/security/createBackupUseCase'
import { DeclineVerificationUseCase } from '../../../src/private/domain/use-cases/security/declineVerificationUseCase'
import { GetBackupStateUseCase } from '../../../src/private/domain/use-cases/security/getBackupStateUseCase'
import { IsVerifiedUseCase } from '../../../src/private/domain/use-cases/security/isVerifiedUseCase'
import { OnSessionVerificationChangedUseCase } from '../../../src/private/domain/use-cases/security/onSessionVerificationChangedUseCase'
import { OnVerificationRequestReceivedUseCase } from '../../../src/private/domain/use-cases/security/onVerificationRequestReceivedUseCase'
import { RecoverUseCase } from '../../../src/private/domain/use-cases/security/recoverUseCase'
import { RequestVerificationUseCase } from '../../../src/private/domain/use-cases/security/requestVerificationUseCase'
import { ResetBackupKeyUseCase } from '../../../src/private/domain/use-cases/security/resetBackupKeyUseCase'
import { RotateBackupKeyUseCase } from '../../../src/private/domain/use-cases/security/rotateBackupKeyUseCase'
import { StartVerificationUseCase } from '../../../src/private/domain/use-cases/security/startVerificationUseCase'
import {
  ChannelId,
  ChannelJoinRule,
  ChannelRole,
  ChannelSortDirection,
  ChannelSortField,
  ChatId,
  CreatePollInput,
  DefaultSecureCommsClient,
  EditPollInput,
  EndPollInput,
  GroupId,
  GroupRole,
  HandleId,
  MessageNotificationLevel,
  PublicChannelJoinRule,
  SecureCommsClient,
  SendPollResponseInput,
} from '../../../src/public'
import { PollType } from '../../../src/public/typings/poll'
import { APIDataFactory } from '../../data-factory/api'
import { EntityDataFactory } from '../../data-factory/entity'

// MARK: Service mocks

jest.mock('../../../src/private/data/session/defaultSessionService')
const JestMockDefaultSessionService = DefaultSessionService as jest.MockedClass<
  typeof DefaultSessionService
>
jest.mock('../../../src/private/data/handle/defaultHandleService')
const JestMockDefaultHandleService = DefaultHandleService as jest.MockedClass<
  typeof DefaultHandleService
>
jest.mock('../../../src/private/data/channels/defaultChannelsService')
const JestMockDefaultChannelsService =
  DefaultChannelsService as jest.MockedClass<typeof DefaultChannelsService>
jest.mock('../../../src/private/data/rooms/matrixRoomsService')
const JestMockMatrixRoomsService = MatrixRoomsService as jest.MockedClass<
  typeof MatrixRoomsService
>
jest.mock('../../../src/private/data/messaging/matrixMessagingService')
const JestMockMatrixMessagingService =
  MatrixMessagingService as jest.MockedClass<typeof MatrixMessagingService>
jest.mock('../../../src/private/data/media/matrixMediaService')
const JestMockMatrixMediaService = MatrixMediaService as jest.MockedClass<
  typeof MatrixMediaService
>
jest.mock('../../../src/private/data/security/matrixSecurityService')
const JestMockMatrixSecurityService = MatrixSecurityService as jest.MockedClass<
  typeof MatrixSecurityService
>
jest.mock('../../../src/private/data/notification/defaultNotificationService')
const JestMockDefaultNotificationService =
  DefaultNotificationService as jest.MockedClass<
    typeof DefaultNotificationService
  >
jest.mock('../../../src/private/data/common/apiClient')
const JestMockApiClient = ApiClient as jest.MockedClass<typeof ApiClient>
jest.mock('@sudoplatform/sudo-web-crypto-provider')
const JestMockWebSudoCryptoProvider = WebSudoCryptoProvider as jest.MockedClass<
  typeof WebSudoCryptoProvider
>
jest.mock('@sudoplatform/sudo-user')
const JestMockUserConfig = userSdk as jest.Mocked<typeof userSdk>

// MARK: Use case mocks

jest.mock(
  '../../../src/private/domain/use-cases/handles/provisionHandleUseCase',
)
const JestMockProvisionHandleUseCase =
  ProvisionHandleUseCase as jest.MockedClass<typeof ProvisionHandleUseCase>
jest.mock(
  '../../../src/private/domain/use-cases/handles/deprovisionHandleUseCase',
)
const JestMockDeprovisionHandleUseCase =
  DeprovisionHandleUseCase as jest.MockedClass<typeof DeprovisionHandleUseCase>
jest.mock('../../../src/private/domain/use-cases/handles/updateHandleUseCase')
const JestMockUpdateHandleUseCase = UpdateHandleUseCase as jest.MockedClass<
  typeof UpdateHandleUseCase
>
jest.mock('../../../src/private/domain/use-cases/handles/listHandlesUseCase')
const JestMockListHandlesUseCase = ListHandlesUseCase as jest.MockedClass<
  typeof ListHandlesUseCase
>
jest.mock('../../../src/private/domain/use-cases/directChats/createChatUseCase')
const JestMockCreateChatUseCase = CreateChatUseCase as jest.MockedClass<
  typeof CreateChatUseCase
>
jest.mock(
  '../../../src/private/domain/use-cases/directChats/acceptInvitationUseCase',
)
const JestMockAcceptDirectChatInvitationUseCase =
  AcceptDirectChatInvitationUseCase as jest.MockedClass<
    typeof AcceptDirectChatInvitationUseCase
  >
jest.mock(
  '../../../src/private/domain/use-cases/directChats/declineInvitationUseCase',
)
const JestMockDeclineDirectChatInvitationUseCase =
  DeclineDirectChatInvitationUseCase as jest.MockedClass<
    typeof DeclineDirectChatInvitationUseCase
  >
jest.mock(
  '../../../src/private/domain/use-cases/directChats/listInvitationsUseCase',
)
const JestMockListDirectChatInvitationsUseCase =
  ListDirectChatInvitationsUseCase as jest.MockedClass<
    typeof ListDirectChatInvitationsUseCase
  >
jest.mock(
  '../../../src/private/domain/use-cases/directChats/listJoinedChatsUseCase',
)
const JestMockListJoinedChatsUseCase =
  ListJoinedChatsUseCase as jest.MockedClass<typeof ListJoinedChatsUseCase>
jest.mock(
  '../../../src/private/domain/use-cases/directChats/blockHandleUseCase',
)
const JestMockBlockHandleUseCase = BlockHandleUseCase as jest.MockedClass<
  typeof BlockHandleUseCase
>
jest.mock(
  '../../../src/private/domain/use-cases/directChats/unblockHandleUseCase',
)
const JestMockUnblockHandleUseCase = UnblockHandleUseCase as jest.MockedClass<
  typeof UnblockHandleUseCase
>
jest.mock(
  '../../../src/private/domain/use-cases/directChats/listBlockedHandlesUseCase',
)
const JestMockListBlockedHandlesUseCase =
  ListBlockedHandlesUseCase as jest.MockedClass<
    typeof ListBlockedHandlesUseCase
  >
jest.mock('../../../src/private/domain/use-cases/groups/createGroupUseCase')
const JestMockCreateGroupUseCase = CreateGroupUseCase as jest.MockedClass<
  typeof CreateGroupUseCase
>
jest.mock('../../../src/private/domain/use-cases/groups/updateGroupUseCase')
const JestMockUpdateGroupUseCase = UpdateGroupUseCase as jest.MockedClass<
  typeof UpdateGroupUseCase
>
jest.mock('../../../src/private/domain/use-cases/groups/deleteGroupUseCase')
const JestMockDeleteGroupUseCase = DeleteGroupUseCase as jest.MockedClass<
  typeof DeleteGroupUseCase
>
jest.mock('../../../src/private/domain/use-cases/groups/getGroupUseCase')
const JestMockGetGroupUseCase = GetGroupUseCase as jest.MockedClass<
  typeof GetGroupUseCase
>
jest.mock('../../../src/private/domain/use-cases/groups/getGroupsUseCase')
const JestMockGetGroupsUseCase = GetGroupsUseCase as jest.MockedClass<
  typeof GetGroupsUseCase
>
jest.mock('../../../src/private/domain/use-cases/groups/sendInvitationsUseCase')
const JestMockSendGroupInvitationsUseCase =
  SendGroupInvitationsUseCase as jest.MockedClass<
    typeof SendGroupInvitationsUseCase
  >
jest.mock(
  '../../../src/private/domain/use-cases/groups/withdrawInvitationUseCase',
)
const JestMockWithdrawGroupInvitationUseCase =
  WithdrawGroupInvitationUseCase as jest.MockedClass<
    typeof WithdrawGroupInvitationUseCase
  >
jest.mock(
  '../../../src/private/domain/use-cases/groups/acceptInvitationUseCase',
)
const JestMockAcceptGroupInvitationUseCase =
  AcceptGroupInvitationUseCase as jest.MockedClass<
    typeof AcceptGroupInvitationUseCase
  >
jest.mock(
  '../../../src/private/domain/use-cases/groups/declineInvitationUseCase',
)
const JestMockDeclineGroupInvitationUseCase =
  DeclineGroupInvitationUseCase as jest.MockedClass<
    typeof DeclineGroupInvitationUseCase
  >
jest.mock('../../../src/private/domain/use-cases/groups/leaveGroupUseCase')
const JestMockLeaveGroupUseCase = LeaveGroupUseCase as jest.MockedClass<
  typeof LeaveGroupUseCase
>
jest.mock('../../../src/private/domain/use-cases/groups/listInvitationsUseCase')
const JestMockListGroupInvitationsUseCase =
  ListGroupInvitationsUseCase as jest.MockedClass<
    typeof ListGroupInvitationsUseCase
  >
jest.mock(
  '../../../src/private/domain/use-cases/groups/listJoinedGroupsUseCase',
)
const JestMockListJoinedGroupsUseCase =
  ListJoinedGroupsUseCase as jest.MockedClass<typeof ListJoinedGroupsUseCase>
jest.mock('../../../src/private/domain/use-cases/groups/getGroupMembersUseCase')
const JestMockGetGroupMembersUseCase =
  GetGroupMembersUseCase as jest.MockedClass<typeof GetGroupMembersUseCase>
jest.mock(
  '../../../src/private/domain/use-cases/groups/updateGroupMemberRoleUseCase',
)
const JestMockUpdateGroupMemberRoleUseCase =
  UpdateGroupMemberRoleUseCase as jest.MockedClass<
    typeof UpdateGroupMemberRoleUseCase
  >
jest.mock('../../../src/private/domain/use-cases/groups/kickHandleUseCase')
const JestMockKickGroupHandleUseCase =
  KickGroupHandleUseCase as jest.MockedClass<typeof KickGroupHandleUseCase>
jest.mock('../../../src/private/domain/use-cases/groups/banHandleUseCase')
const JestMockBanGroupHandleUseCase = BanGroupHandleUseCase as jest.MockedClass<
  typeof BanGroupHandleUseCase
>
jest.mock('../../../src/private/domain/use-cases/groups/unbanHandleUseCase')
const JestMockUnbanGroupHandleUseCase =
  UnbanGroupHandleUseCase as jest.MockedClass<typeof UnbanGroupHandleUseCase>

jest.mock('../../../src/private/domain/use-cases/channels/createChannelUseCase')
const JestMockCreateChannelUseCase = CreateChannelUseCase as jest.MockedClass<
  typeof CreateChannelUseCase
>
jest.mock('../../../src/private/domain/use-cases/channels/updateChannelUseCase')
const JestMockUpdateChannelUseCase = UpdateChannelUseCase as jest.MockedClass<
  typeof UpdateChannelUseCase
>
jest.mock('../../../src/private/domain/use-cases/channels/deleteChannelUseCase')
const JestMockDeleteChannelUseCase = DeleteChannelUseCase as jest.MockedClass<
  typeof DeleteChannelUseCase
>
jest.mock('../../../src/private/domain/use-cases/channels/getChannelUseCase')
const JestMockGetChannelUseCase = GetChannelUseCase as jest.MockedClass<
  typeof GetChannelUseCase
>
jest.mock('../../../src/private/domain/use-cases/channels/getChannelsUseCase')
const JestMockGetChannelsUseCase = GetChannelsUseCase as jest.MockedClass<
  typeof GetChannelsUseCase
>
jest.mock(
  '../../../src/private/domain/use-cases/channels/searchPublicChannelsUseCase',
)
const JestMockSearchPublicChannelsUseCase =
  SearchPublicChannelsUseCase as jest.MockedClass<
    typeof SearchPublicChannelsUseCase
  >
jest.mock('../../../src/private/domain/use-cases/channels/joinChannelUseCase')
const JestMockJoinChannelUseCase = JoinChannelUseCase as jest.MockedClass<
  typeof JoinChannelUseCase
>
jest.mock('../../../src/private/domain/use-cases/channels/leaveChannelUseCase')
const JestMockLeaveChannelUseCase = LeaveChannelUseCase as jest.MockedClass<
  typeof LeaveChannelUseCase
>
jest.mock(
  '../../../src/private/domain/use-cases/channels/listJoinedChannelsUseCase',
)
const JestMockListJoinedChannelsUseCase =
  ListJoinedChannelsUseCase as jest.MockedClass<
    typeof ListJoinedChannelsUseCase
  >
jest.mock(
  '../../../src/private/domain/use-cases/channels/sendInvitationsUseCase',
)
const JestMockSendChannelInvitationsUseCase =
  SendChannelInvitationsUseCase as jest.MockedClass<
    typeof SendChannelInvitationsUseCase
  >
jest.mock(
  '../../../src/private/domain/use-cases/channels/withdrawInvitationUseCase',
)
const JestMockWithdrawChannelInvitationUseCase =
  WithdrawChannelInvitationUseCase as jest.MockedClass<
    typeof WithdrawChannelInvitationUseCase
  >
jest.mock(
  '../../../src/private/domain/use-cases/channels/acceptInvitationUseCase',
)
const JestMockAcceptChannelInvitationUseCase =
  AcceptChannelInvitationUseCase as jest.MockedClass<
    typeof AcceptChannelInvitationUseCase
  >
jest.mock(
  '../../../src/private/domain/use-cases/channels/declineInvitationUseCase',
)
const JestMockDeclineChannelInvitationUseCase =
  DeclineChannelInvitationUseCase as jest.MockedClass<
    typeof DeclineChannelInvitationUseCase
  >
jest.mock(
  '../../../src/private/domain/use-cases/channels/listInvitationsUseCase',
)
const JestMockListChannelInvitationsUseCase =
  ListChannelInvitationsUseCase as jest.MockedClass<
    typeof ListChannelInvitationsUseCase
  >
jest.mock(
  '../../../src/private/domain/use-cases/channels/sendInvitationRequestUseCase',
)
const JestMockSendInvitationRequestUseCase =
  SendInvitationRequestUseCase as jest.MockedClass<
    typeof SendInvitationRequestUseCase
  >
jest.mock(
  '../../../src/private/domain/use-cases/channels/listSentInvitationRequestsUseCase',
)
const JestMockListSentInvitationRequestsUseCase =
  ListSentInvitationRequestsUseCase as jest.MockedClass<
    typeof ListSentInvitationRequestsUseCase
  >
jest.mock(
  '../../../src/private/domain/use-cases/channels/listReceivedInvitationRequestsUseCase',
)
const JestMockListReceivedInvitationRequestsUseCase =
  ListReceivedInvitationRequestsUseCase as jest.MockedClass<
    typeof ListReceivedInvitationRequestsUseCase
  >
jest.mock(
  '../../../src/private/domain/use-cases/channels/getChannelMembersUseCase',
)
const JestMockGetChannelMembersUseCase =
  GetChannelMembersUseCase as jest.MockedClass<typeof GetChannelMembersUseCase>
jest.mock(
  '../../../src/private/domain/use-cases/channels/getChannelMembershipUseCase',
)
const JestMockGetChannelMembershipUseCase =
  GetChannelMembershipUseCase as jest.MockedClass<
    typeof GetChannelMembershipUseCase
  >
jest.mock(
  '../../../src/private/domain/use-cases/channels/updateChannelMemberRoleUseCase',
)
const JestMockUpdateChannelMemberRoleUseCase =
  UpdateChannelMemberRoleUseCase as jest.MockedClass<
    typeof UpdateChannelMemberRoleUseCase
  >
jest.mock('../../../src/private/domain/use-cases/channels/kickHandleUseCase')
const JestMockKickChannelHandleUseCase =
  KickChannelHandleUseCase as jest.MockedClass<typeof KickChannelHandleUseCase>
jest.mock('../../../src/private/domain/use-cases/channels/banHandleUseCase')
const JestMockBanChannelHandleUseCase =
  BanChannelHandleUseCase as jest.MockedClass<typeof BanChannelHandleUseCase>
jest.mock('../../../src/private/domain/use-cases/channels/unbanHandleUseCase')
const JestMockUnbanChannelHandleUseCase =
  UnbanChannelHandleUseCase as jest.MockedClass<
    typeof UnbanChannelHandleUseCase
  >
jest.mock('../../../src/private/domain/use-cases/messaging/getMessagesUseCase')
const JestMockGetMessagesUseCase = GetMessagesUseCase as jest.MockedClass<
  typeof GetMessagesUseCase
>
jest.mock('../../../src/private/domain/use-cases/messaging/getMessageUseCase')
const JestMockGetMessageUseCase = GetMessageUseCase as jest.MockedClass<
  typeof GetMessageUseCase
>
jest.mock(
  '../../../src/private/domain/use-cases/messaging/getChatSummariesUseCase',
)
const JestMockGetChatSummariesUseCase =
  GetChatSummariesUseCase as jest.MockedClass<typeof GetChatSummariesUseCase>
jest.mock(
  '../../../src/private/domain/use-cases/messaging/searchMessagesUseCase',
)
const JestMockSearchMessagesUseCase = SearchMessagesUseCase as jest.MockedClass<
  typeof SearchMessagesUseCase
>
jest.mock('../../../src/private/domain/use-cases/messaging/markAsReadUseCase')
const JestMockMarkAsReadUseCase = MarkAsReadUseCase as jest.MockedClass<
  typeof MarkAsReadUseCase
>
jest.mock(
  '../../../src/private/domain/use-cases/messaging/sendTypingNotificationUseCase',
)
const JestMockSendTypingNotificationUseCase =
  SendTypingNotificationUseCase as jest.MockedClass<
    typeof SendTypingNotificationUseCase
  >
jest.mock('../../../src/private/domain/use-cases/messaging/sendMessageUseCase')
const JestMockSendMessageUseCase = SendMessageUseCase as jest.MockedClass<
  typeof SendMessageUseCase
>
jest.mock(
  '../../../src/private/domain/use-cases/messaging/sendThreadMessageUseCase',
)
const JestMockSendThreadMessageUseCase =
  SendThreadMessageUseCase as jest.MockedClass<typeof SendThreadMessageUseCase>
jest.mock(
  '../../../src/private/domain/use-cases/messaging/sendReplyMessageUseCase',
)
const JestMockSendReplyMessageUseCase =
  SendReplyMessageUseCase as jest.MockedClass<typeof SendReplyMessageUseCase>
jest.mock('../../../src/private/domain/use-cases/messaging/editMessageUseCase')
const JestMockEditMessageUseCase = EditMessageUseCase as jest.MockedClass<
  typeof EditMessageUseCase
>
jest.mock(
  '../../../src/private/domain/use-cases/messaging/deleteMessageUseCase',
)
const JestMockDeleteMessageUseCase = DeleteMessageUseCase as jest.MockedClass<
  typeof DeleteMessageUseCase
>
jest.mock('../../../src/private/domain/use-cases/messaging/sendMediaUseCase')
const JestMockSendMediaUseCase = SendMediaUseCase as jest.MockedClass<
  typeof SendMediaUseCase
>
jest.mock(
  '../../../src/private/domain/use-cases/messaging/toggleReactionUseCase',
)
const JestMockToggleReactionUseCase = ToggleReactionUseCase as jest.MockedClass<
  typeof ToggleReactionUseCase
>
jest.mock(
  '../../../src/private/domain/use-cases/messaging/pinUnpinMessageUseCase',
)
const JestMockPinUnpinMessageUseCase =
  PinUnpinMessageUseCase as jest.MockedClass<typeof PinUnpinMessageUseCase>
jest.mock(
  '../../../src/private/domain/use-cases/messaging/getPinnedMessagesUseCase',
)
const JestMockGetPinnedMessagesUseCase =
  GetPinnedMessagesUseCase as jest.MockedClass<typeof GetPinnedMessagesUseCase>
jest.mock('../../../src/private/domain/use-cases/messaging/createPollUseCase')
const JestMockCreatePollUseCase = CreatePollUseCase as jest.MockedClass<
  typeof CreatePollUseCase
>
jest.mock(
  '../../../src/private/domain/use-cases/messaging/sendPollResponseUseCase',
)
const JestMockSendPollResponseUseCase =
  SendPollResponseUseCase as jest.MockedClass<typeof SendPollResponseUseCase>
jest.mock('../../../src/private/domain/use-cases/messaging/editPollUseCase')
const JestMockEditPollUseCase = EditPollUseCase as jest.MockedClass<
  typeof EditPollUseCase
>
jest.mock('../../../src/private/domain/use-cases/messaging/endPollUseCase')
const JestMockEndPollUseCase = EndPollUseCase as jest.MockedClass<
  typeof EndPollUseCase
>
jest.mock(
  '../../../src/private/domain/use-cases/messaging/getPollResponsesUseCase',
)
const JestMockGetPollResponsesUseCase =
  GetPollResponsesUseCase as jest.MockedClass<typeof GetPollResponsesUseCase>
jest.mock(
  '../../../src/private/domain/use-cases/media/downloadMediaFileUseCase',
)
const JestMockDownloadMediaFileUseCase =
  DownloadMediaFileUseCase as jest.MockedClass<typeof DownloadMediaFileUseCase>
jest.mock(
  '../../../src/private/domain/use-cases/security/acceptVerificationUseCase',
)
const JestMockAcceptVerificationUseCase =
  AcceptVerificationUseCase as jest.MockedClass<
    typeof AcceptVerificationUseCase
  >
jest.mock(
  '../../../src/private/domain/use-cases/security/approveVerificationUseCase',
)
const JestMockApproveVerificationUseCase =
  ApproveVerificationUseCase as jest.MockedClass<
    typeof ApproveVerificationUseCase
  >
jest.mock(
  '../../../src/private/domain/use-cases/security/cancelVerificationUseCase',
)
const JestMockCancelVerificationUseCase =
  CancelVerificationUseCase as jest.MockedClass<
    typeof CancelVerificationUseCase
  >
jest.mock('../../../src/private/domain/use-cases/security/createBackupUseCase')
const JestMockCreateBackupUseCase = CreateBackupUseCase as jest.MockedClass<
  typeof CreateBackupUseCase
>
jest.mock(
  '../../../src/private/domain/use-cases/security/declineVerificationUseCase',
)
const JestMockDeclineVerificationUseCase =
  DeclineVerificationUseCase as jest.MockedClass<
    typeof DeclineVerificationUseCase
  >
jest.mock(
  '../../../src/private/domain/use-cases/security/getBackupStateUseCase',
)
const JestMockGetBackupStateUseCase = GetBackupStateUseCase as jest.MockedClass<
  typeof GetBackupStateUseCase
>
jest.mock('../../../src/private/domain/use-cases/security/recoverUseCase')
const JestMockRecoverUseCase = RecoverUseCase as jest.MockedClass<
  typeof RecoverUseCase
>
jest.mock(
  '../../../src/private/domain/use-cases/security/requestVerificationUseCase',
)
const JestMockRequestVerificationUseCase =
  RequestVerificationUseCase as jest.MockedClass<
    typeof RequestVerificationUseCase
  >
jest.mock(
  '../../../src/private/domain/use-cases/security/resetBackupKeyUseCase',
)
const JestMockResetBackupKeyUseCase = ResetBackupKeyUseCase as jest.MockedClass<
  typeof ResetBackupKeyUseCase
>
jest.mock(
  '../../../src/private/domain/use-cases/security/rotateBackupKeyUseCase',
)
const JestMockRotateBackupKeyUseCase =
  RotateBackupKeyUseCase as jest.MockedClass<typeof RotateBackupKeyUseCase>
jest.mock(
  '../../../src/private/domain/use-cases/security/startVerificationUseCase',
)
const JestMockStartVerificationUseCase =
  StartVerificationUseCase as jest.MockedClass<typeof StartVerificationUseCase>
jest.mock('../../../src/private/domain/use-cases/security/isVerifiedUseCase')
const JestMockIsVerifiedUseCase = IsVerifiedUseCase as jest.MockedClass<
  typeof IsVerifiedUseCase
>
jest.mock(
  '../../../src/private/domain/use-cases/security/onSessionVerificationChangedUseCase',
)
const JestMockOnSessionVerificationChangedUseCase =
  OnSessionVerificationChangedUseCase as jest.MockedClass<
    typeof OnSessionVerificationChangedUseCase
  >
jest.mock(
  '../../../src/private/domain/use-cases/security/onVerificationRequestReceivedUseCase',
)
const JestMockOnVerificationRequestReceivedUseCase =
  OnVerificationRequestReceivedUseCase as jest.MockedClass<
    typeof OnVerificationRequestReceivedUseCase
  >
jest.mock(
  '../../../src/private/domain/use-cases/notifications/getDecodedInfoUseCase',
)
const JestMockGetDecodedInfoUseCase = GetDecodedInfoUseCase as jest.MockedClass<
  typeof GetDecodedInfoUseCase
>
jest.mock(
  '../../../src/private/domain/use-cases/notifications/getSettingsUseCase',
)
const JestMockGetSettingsUseCase = GetSettingsUseCase as jest.MockedClass<
  typeof GetSettingsUseCase
>
jest.mock(
  '../../../src/private/domain/use-cases/notifications/setDefaultChatRulesUseCase',
)
const JestMockSetDefaultChatRulesUseCase =
  SetDefaultChatRulesUseCase as jest.MockedClass<
    typeof SetDefaultChatRulesUseCase
  >
jest.mock(
  '../../../src/private/domain/use-cases/notifications/setDefaultEventRulesUseCase',
)
const JestMockSetDefaultEventRulesUseCase =
  SetDefaultEventRulesUseCase as jest.MockedClass<
    typeof SetDefaultEventRulesUseCase
  >
jest.mock(
  '../../../src/private/domain/use-cases/notifications/setRecipientChatRulesUseCase',
)
const JestMockSetRecipientChatRulesUseCase =
  SetRecipientChatRulesUseCase as jest.MockedClass<
    typeof SetRecipientChatRulesUseCase
  >
jest.mock(
  '../../../src/private/domain/use-cases/notifications/clearRecipientChatRulesUseCase',
)
const JestMockClearRecipientChatRulesUseCase =
  ClearRecipientChatRulesUseCase as jest.MockedClass<
    typeof ClearRecipientChatRulesUseCase
  >

// MARK: Test suite

describe('SecureCommsClient Test Suite', () => {
  const mockSudoUserClient = mock<SudoUserClient>()
  const mockApiClient = mock<ApiClient>()

  const mockSessionService = mock<DefaultSessionService>()
  const mockHandleService = mock<DefaultHandleService>()
  const mockChannelsService = mock<DefaultChannelsService>()
  const mockMatrixRoomsService = mock<MatrixRoomsService>()
  const mockMatrixMessagingService = mock<MatrixMessagingService>()
  const mockMatrixMediaService = mock<MatrixMediaService>()
  const mockMatrixSecurityService = mock<MatrixSecurityService>()
  const mockNotificationService = mock<DefaultNotificationService>()

  const mockProvisionHandleUseCase = mock<ProvisionHandleUseCase>()
  const mockDeprovisionHandleUseCase = mock<DeprovisionHandleUseCase>()
  const mockUpdateHandleUseCase = mock<UpdateHandleUseCase>()
  const mockListHandlesUseCase = mock<ListHandlesUseCase>()
  const mockCreateChatUseCase = mock<CreateChatUseCase>()
  const mockAcceptDirectChatInvitationUseCase =
    mock<AcceptDirectChatInvitationUseCase>()
  const mockDeclineDirectChatInvitationUseCase =
    mock<DeclineDirectChatInvitationUseCase>()
  const mockListDirectChatInvitationsUseCase =
    mock<ListDirectChatInvitationsUseCase>()
  const mockListJoinedChatsUseCase = mock<ListJoinedChatsUseCase>()
  const mockBlockHandleUseCase = mock<BlockHandleUseCase>()
  const mockUnblockHandleUseCase = mock<UnblockHandleUseCase>()
  const mockListBlockedHandlesUseCase = mock<ListBlockedHandlesUseCase>()
  const mockCreateGroupUseCase = mock<CreateGroupUseCase>()
  const mockUpdateGroupUseCase = mock<UpdateGroupUseCase>()
  const mockDeleteGroupUseCase = mock<DeleteGroupUseCase>()
  const mockGetGroupUseCase = mock<GetGroupUseCase>()
  const mockGetGroupsUseCase = mock<GetGroupsUseCase>()
  const mockSendGroupInvitationsUseCase = mock<SendGroupInvitationsUseCase>()
  const mockWithdrawGroupInvitationUseCase =
    mock<WithdrawGroupInvitationUseCase>()
  const mockAcceptGroupInvitationUseCase = mock<AcceptGroupInvitationUseCase>()
  const mockDeclineGroupInvitationUseCase =
    mock<DeclineGroupInvitationUseCase>()
  const mockLeaveGroupUseCase = mock<LeaveGroupUseCase>()
  const mockListGroupInvitationsUseCase = mock<ListGroupInvitationsUseCase>()
  const mockListJoinedGroupsUseCase = mock<ListJoinedGroupsUseCase>()
  const mockGetGroupMembersUseCase = mock<GetGroupMembersUseCase>()
  const mockUpdateGroupMemberRoleUseCase = mock<UpdateGroupMemberRoleUseCase>()
  const mockKickGroupHandleUseCase = mock<KickGroupHandleUseCase>()
  const mockBanGroupHandleUseCase = mock<BanGroupHandleUseCase>()
  const mockUnbanGroupHandleUseCase = mock<UnbanGroupHandleUseCase>()
  const mockCreateChannelUseCase = mock<CreateChannelUseCase>()
  const mockUpdateChannelUseCase = mock<UpdateChannelUseCase>()
  const mockDeleteChannelUseCase = mock<DeleteChannelUseCase>()
  const mockGetChannelUseCase = mock<GetChannelUseCase>()
  const mockGetChannelsUseCase = mock<GetChannelsUseCase>()
  const mockSearchPublicChannelsUseCase = mock<SearchPublicChannelsUseCase>()
  const mockJoinChannelUseCase = mock<JoinChannelUseCase>()
  const mockLeaveChannelUseCase = mock<LeaveChannelUseCase>()
  const mockListJoinedChannelsUseCase = mock<ListJoinedChannelsUseCase>()
  const mockSendChannelInvitationsUseCase =
    mock<SendChannelInvitationsUseCase>()
  const mockWithdrawChannelInvitationUseCase =
    mock<WithdrawChannelInvitationUseCase>()
  const mockAcceptChannelInvitationUseCase =
    mock<AcceptChannelInvitationUseCase>()
  const mockDeclineChannelInvitationUseCase =
    mock<DeclineChannelInvitationUseCase>()
  const mockListChannelInvitationsUseCase =
    mock<ListChannelInvitationsUseCase>()
  const mockSendInvitationRequestUseCase = mock<SendInvitationRequestUseCase>()
  const mockListSentInvitationRequestsUseCase =
    mock<ListSentInvitationRequestsUseCase>()
  const mockListReceivedInvitationRequestsUseCase =
    mock<ListReceivedInvitationRequestsUseCase>()
  const mockGetChannelMembersUseCase = mock<GetChannelMembersUseCase>()
  const mockGetChannelMembershipUseCase = mock<GetChannelMembershipUseCase>()
  const mockUpdateChannelMemberRoleUseCase =
    mock<UpdateChannelMemberRoleUseCase>()
  const mockKickChannelHandleUseCase = mock<KickChannelHandleUseCase>()
  const mockBanChannelHandleUseCase = mock<BanChannelHandleUseCase>()
  const mockUnbanChannelHandleUseCase = mock<UnbanChannelHandleUseCase>()
  const mockGetMessagesUseCase = mock<GetMessagesUseCase>()
  const mockGetMessageUseCase = mock<GetMessageUseCase>()
  const mockGetChatSummariesUseCase = mock<GetChatSummariesUseCase>()
  const mockSearchMessagesUseCase = mock<SearchMessagesUseCase>()
  const mockMarkAsReadUseCase = mock<MarkAsReadUseCase>()
  const mockSendTypingNotificationUseCase =
    mock<SendTypingNotificationUseCase>()
  const mockSendMessageUseCase = mock<SendMessageUseCase>()
  const mockSendThreadMessageUseCase = mock<SendThreadMessageUseCase>()
  const mockSendReplyMessageUseCase = mock<SendReplyMessageUseCase>()
  const mockEditMessageUseCase = mock<EditMessageUseCase>()
  const mockDeleteMessageUseCase = mock<DeleteMessageUseCase>()
  const mockSendMediaUseCase = mock<SendMediaUseCase>()
  const mockToggleReactionUseCase = mock<ToggleReactionUseCase>()
  const mockPinUnpinMessageUseCase = mock<PinUnpinMessageUseCase>()
  const mockGetPinnedMessagesUseCase = mock<GetPinnedMessagesUseCase>()
  const mockCreatePollUseCase = mock<CreatePollUseCase>()
  const mockSendPollResponseUseCase = mock<SendPollResponseUseCase>()
  const mockEditPollUseCase = mock<EditPollUseCase>()
  const mockEndPollUseCase = mock<EndPollUseCase>()
  const mockGetPollResponsesUseCase = mock<GetPollResponsesUseCase>()
  const mockDownloadMediaFileUseCase = mock<DownloadMediaFileUseCase>()
  const mockAcceptVerificationUseCase = mock<AcceptVerificationUseCase>()
  const mockApproveVerificationUseCase = mock<ApproveVerificationUseCase>()
  const mockCancelVerificationUseCase = mock<CancelVerificationUseCase>()
  const mockCreateBackupUseCase = mock<CreateBackupUseCase>()
  const mockResetBackupKeyUseCase = mock<ResetBackupKeyUseCase>()
  const mockRequestVerificationUseCase = mock<RequestVerificationUseCase>()
  const mockRotateBackupKeyUseCase = mock<RotateBackupKeyUseCase>()
  const mockStartVerificationUseCase = mock<StartVerificationUseCase>()
  const mockDeclineVerificationUseCase = mock<DeclineVerificationUseCase>()
  const mockGetBackupStateUseCase = mock<GetBackupStateUseCase>()
  const mockRecoverUseCase = mock<RecoverUseCase>()
  const mockIsVerifiedUseCase = mock<IsVerifiedUseCase>()
  const mockOnSessionVerificationChangedUseCase =
    mock<OnSessionVerificationChangedUseCase>()
  const mockOnVerificationRequestReceivedUseCase =
    mock<OnVerificationRequestReceivedUseCase>()
  const mockGetDecodedInfoUseCase = mock<GetDecodedInfoUseCase>()
  const mockGetSettingsUseCase = mock<GetSettingsUseCase>()
  const mockSetDefaultChatRulesUseCase = mock<SetDefaultChatRulesUseCase>()
  const mockSetDefaultEventRulesUseCase = mock<SetDefaultEventRulesUseCase>()
  const mockSetRecipientChatRulesUseCase = mock<SetRecipientChatRulesUseCase>()
  const mockClearRecipientChatRulesUseCase =
    mock<ClearRecipientChatRulesUseCase>()

  let instanceUnderTest: SecureCommsClient

  const mockIdentityServiceConfig: userSdk.IdentityServiceConfig = {
    region: 'region',
    poolId: 'poolId',
    clientId: 'clientId',
    identityPoolId: 'identityPoolId',
    apiUrl: 'apiUrl',
    transientBucket: 'transientBucket',
    registrationMethods: [],
    bucket: 'bucket',
  }

  const mockSecureCommsServiceConfig: SecureCommsServiceConfig = {
    region: 'region',
    serviceEndpointUrl: 'serviceEndpointUrl',
    advancedSearchEnabled: true,
    homeServer: 'homeServer',
    roomMediaBucket: 'roomMediaBucket',
    publicMediaBucket: 'publicMediaBucket',
  }

  // MARK: resetMocks

  const resetMocks = (): void => {
    reset(mockSudoUserClient)
    reset(mockApiClient)

    reset(mockSessionService)
    reset(mockHandleService)
    reset(mockChannelsService)
    reset(mockMatrixRoomsService)
    reset(mockMatrixMessagingService)
    reset(mockMatrixMediaService)
    reset(mockMatrixSecurityService)

    reset(mockProvisionHandleUseCase)
    reset(mockDeprovisionHandleUseCase)
    reset(mockUpdateHandleUseCase)
    reset(mockListHandlesUseCase)
    reset(mockCreateChatUseCase)
    reset(mockAcceptDirectChatInvitationUseCase)
    reset(mockDeclineDirectChatInvitationUseCase)
    reset(mockListDirectChatInvitationsUseCase)
    reset(mockListJoinedChatsUseCase)
    reset(mockBlockHandleUseCase)
    reset(mockUnblockHandleUseCase)
    reset(mockListBlockedHandlesUseCase)
    reset(mockCreateGroupUseCase)
    reset(mockUpdateGroupUseCase)
    reset(mockDeleteGroupUseCase)
    reset(mockGetGroupUseCase)
    reset(mockGetGroupsUseCase)
    reset(mockSendGroupInvitationsUseCase)
    reset(mockWithdrawGroupInvitationUseCase)
    reset(mockAcceptGroupInvitationUseCase)
    reset(mockDeclineGroupInvitationUseCase)
    reset(mockLeaveGroupUseCase)
    reset(mockListGroupInvitationsUseCase)
    reset(mockListJoinedGroupsUseCase)
    reset(mockGetGroupMembersUseCase)
    reset(mockUpdateGroupMemberRoleUseCase)
    reset(mockKickGroupHandleUseCase)
    reset(mockBanGroupHandleUseCase)
    reset(mockUnbanGroupHandleUseCase)
    reset(mockCreateChannelUseCase)
    reset(mockUpdateChannelUseCase)
    reset(mockDeleteChannelUseCase)
    reset(mockGetChannelUseCase)
    reset(mockGetChannelsUseCase)
    reset(mockSearchPublicChannelsUseCase)
    reset(mockJoinChannelUseCase)
    reset(mockLeaveChannelUseCase)
    reset(mockListJoinedChannelsUseCase)
    reset(mockSendChannelInvitationsUseCase)
    reset(mockWithdrawChannelInvitationUseCase)
    reset(mockAcceptChannelInvitationUseCase)
    reset(mockDeclineChannelInvitationUseCase)
    reset(mockListChannelInvitationsUseCase)
    reset(mockSendInvitationRequestUseCase)
    reset(mockListSentInvitationRequestsUseCase)
    reset(mockListReceivedInvitationRequestsUseCase)
    reset(mockGetChannelMembersUseCase)
    reset(mockGetChannelMembershipUseCase)
    reset(mockUpdateChannelMemberRoleUseCase)
    reset(mockKickChannelHandleUseCase)
    reset(mockBanChannelHandleUseCase)
    reset(mockUnbanChannelHandleUseCase)
    reset(mockGetMessagesUseCase)
    reset(mockGetMessageUseCase)
    reset(mockGetChatSummariesUseCase)
    reset(mockSearchMessagesUseCase)
    reset(mockMarkAsReadUseCase)
    reset(mockSendTypingNotificationUseCase)
    reset(mockSendMessageUseCase)
    reset(mockSendThreadMessageUseCase)
    reset(mockSendReplyMessageUseCase)
    reset(mockEditMessageUseCase)
    reset(mockDeleteMessageUseCase)
    reset(mockSendMediaUseCase)
    reset(mockToggleReactionUseCase)
    reset(mockPinUnpinMessageUseCase)
    reset(mockGetPinnedMessagesUseCase)
    reset(mockCreatePollUseCase)
    reset(mockSendPollResponseUseCase)
    reset(mockEditPollUseCase)
    reset(mockEndPollUseCase)
    reset(mockGetPollResponsesUseCase)
    reset(mockDownloadMediaFileUseCase)
    reset(mockAcceptVerificationUseCase)
    reset(mockApproveVerificationUseCase)
    reset(mockCancelVerificationUseCase)
    reset(mockCreateBackupUseCase)
    reset(mockDeclineVerificationUseCase)
    reset(mockGetBackupStateUseCase)
    reset(mockRecoverUseCase)
    reset(mockRequestVerificationUseCase)
    reset(mockResetBackupKeyUseCase)
    reset(mockRotateBackupKeyUseCase)
    reset(mockStartVerificationUseCase)
    reset(mockIsVerifiedUseCase)
    reset(mockOnSessionVerificationChangedUseCase)
    reset(mockOnVerificationRequestReceivedUseCase)
    reset(mockGetDecodedInfoUseCase)
    reset(mockGetSettingsUseCase)
    reset(mockSetDefaultChatRulesUseCase)
    reset(mockSetDefaultEventRulesUseCase)
    reset(mockSetRecipientChatRulesUseCase)
    reset(mockClearRecipientChatRulesUseCase)

    JestMockDefaultSessionService.mockClear()
    JestMockDefaultHandleService.mockClear()
    JestMockDefaultChannelsService.mockClear()
    JestMockMatrixRoomsService.mockClear()
    JestMockMatrixMessagingService.mockClear()
    JestMockMatrixMediaService.mockClear()
    JestMockMatrixSecurityService.mockClear()
    JestMockDefaultNotificationService.mockClear()
    JestMockApiClient.mockClear()
    JestMockWebSudoCryptoProvider.mockClear()
    JestMockUserConfig.getIdentityServiceConfig.mockClear()

    JestMockProvisionHandleUseCase.mockClear()
    JestMockDeprovisionHandleUseCase.mockClear()
    JestMockUpdateHandleUseCase.mockClear()
    JestMockListHandlesUseCase.mockClear()
    JestMockCreateChatUseCase.mockClear()
    JestMockAcceptDirectChatInvitationUseCase.mockClear()
    JestMockDeclineDirectChatInvitationUseCase.mockClear()
    JestMockListDirectChatInvitationsUseCase.mockClear()
    JestMockListJoinedChatsUseCase.mockClear()
    JestMockBlockHandleUseCase.mockClear()
    JestMockUnblockHandleUseCase.mockClear()
    JestMockListBlockedHandlesUseCase.mockClear()
    JestMockCreateGroupUseCase.mockClear()
    JestMockUpdateGroupUseCase.mockClear()
    JestMockDeleteGroupUseCase.mockClear()
    JestMockGetGroupUseCase.mockClear()
    JestMockGetGroupsUseCase.mockClear()
    JestMockSendGroupInvitationsUseCase.mockClear()
    JestMockWithdrawGroupInvitationUseCase.mockClear()
    JestMockAcceptGroupInvitationUseCase.mockClear()
    JestMockDeclineGroupInvitationUseCase.mockClear()
    JestMockLeaveGroupUseCase.mockClear()
    JestMockListGroupInvitationsUseCase.mockClear()
    JestMockListJoinedGroupsUseCase.mockClear()
    JestMockGetGroupMembersUseCase.mockClear()
    JestMockUpdateGroupMemberRoleUseCase.mockClear()
    JestMockKickGroupHandleUseCase.mockClear()
    JestMockBanGroupHandleUseCase.mockClear()
    JestMockUnbanGroupHandleUseCase.mockClear()
    JestMockCreateChannelUseCase.mockClear()
    JestMockUpdateChannelUseCase.mockClear()
    JestMockDeleteChannelUseCase.mockClear()
    JestMockGetChannelUseCase.mockClear()
    JestMockGetChannelsUseCase.mockClear()
    JestMockSearchPublicChannelsUseCase.mockClear()
    JestMockJoinChannelUseCase.mockClear()
    JestMockLeaveChannelUseCase.mockClear()
    JestMockListJoinedChannelsUseCase.mockClear()
    JestMockSendChannelInvitationsUseCase.mockClear()
    JestMockWithdrawChannelInvitationUseCase.mockClear()
    JestMockAcceptChannelInvitationUseCase.mockClear()
    JestMockDeclineChannelInvitationUseCase.mockClear()
    JestMockListChannelInvitationsUseCase.mockClear()
    JestMockSendInvitationRequestUseCase.mockClear()
    JestMockListSentInvitationRequestsUseCase.mockClear()
    JestMockListReceivedInvitationRequestsUseCase.mockClear()
    JestMockGetChannelMembersUseCase.mockClear()
    JestMockGetChannelMembershipUseCase.mockClear()
    JestMockUpdateChannelMemberRoleUseCase.mockClear()
    JestMockKickChannelHandleUseCase.mockClear()
    JestMockBanChannelHandleUseCase.mockClear()
    JestMockUnbanChannelHandleUseCase.mockClear()
    JestMockGetMessagesUseCase.mockClear()
    JestMockGetMessageUseCase.mockClear()
    JestMockGetChatSummariesUseCase.mockClear()
    JestMockMarkAsReadUseCase.mockClear()
    JestMockSendTypingNotificationUseCase.mockClear()
    JestMockSendMessageUseCase.mockClear()
    JestMockSendThreadMessageUseCase.mockClear()
    JestMockSendReplyMessageUseCase.mockClear()
    JestMockEditMessageUseCase.mockClear()
    JestMockDeleteMessageUseCase.mockClear()
    JestMockSendMediaUseCase.mockClear()
    JestMockToggleReactionUseCase.mockClear()
    JestMockPinUnpinMessageUseCase.mockClear()
    JestMockGetPinnedMessagesUseCase.mockClear()
    JestMockCreatePollUseCase.mockClear()
    JestMockSendPollResponseUseCase.mockClear()
    JestMockEditPollUseCase.mockClear()
    JestMockEndPollUseCase.mockClear()
    JestMockDownloadMediaFileUseCase.mockClear()
    JestMockAcceptVerificationUseCase.mockClear()
    JestMockApproveVerificationUseCase.mockClear()
    JestMockCancelVerificationUseCase.mockClear()
    JestMockCreateBackupUseCase.mockClear()
    JestMockDeclineVerificationUseCase.mockClear()
    JestMockGetBackupStateUseCase.mockClear()
    JestMockRecoverUseCase.mockClear()
    JestMockRequestVerificationUseCase.mockClear()
    JestMockResetBackupKeyUseCase.mockClear()
    JestMockRotateBackupKeyUseCase.mockClear()
    JestMockStartVerificationUseCase.mockClear()
    JestMockIsVerifiedUseCase.mockClear()
    JestMockOnSessionVerificationChangedUseCase.mockClear()
    JestMockOnVerificationRequestReceivedUseCase.mockClear()
    JestMockGetDecodedInfoUseCase.mockClear()
    JestMockGetSettingsUseCase.mockClear()
    JestMockSetDefaultChatRulesUseCase.mockClear()
    JestMockSetDefaultEventRulesUseCase.mockClear()
    JestMockSetRecipientChatRulesUseCase.mockClear()
    JestMockClearRecipientChatRulesUseCase.mockClear()

    JestMockApiClient.mockImplementation(() => instance(mockApiClient))
    JestMockUserConfig.getIdentityServiceConfig.mockImplementation(() => ({
      identityService: mockIdentityServiceConfig,
    }))
    JestMockDefaultSessionService.mockImplementation(() =>
      instance(mockSessionService),
    )
    JestMockDefaultHandleService.mockImplementation(() =>
      instance(mockHandleService),
    )
    JestMockDefaultChannelsService.mockImplementation(() =>
      instance(mockChannelsService),
    )
    JestMockMatrixRoomsService.mockImplementation(() =>
      instance(mockMatrixRoomsService),
    )
    JestMockMatrixMessagingService.mockImplementation(() =>
      instance(mockMatrixMessagingService),
    )
    JestMockMatrixMediaService.mockImplementation(() =>
      instance(mockMatrixMediaService),
    )
    JestMockMatrixSecurityService.mockImplementation(() =>
      instance(mockMatrixSecurityService),
    )
    JestMockDefaultNotificationService.mockImplementation(() =>
      instance(mockNotificationService),
    )
    JestMockProvisionHandleUseCase.mockImplementation(() =>
      instance(mockProvisionHandleUseCase),
    )
    JestMockDeprovisionHandleUseCase.mockImplementation(() =>
      instance(mockDeprovisionHandleUseCase),
    )
    JestMockUpdateHandleUseCase.mockImplementation(() =>
      instance(mockUpdateHandleUseCase),
    )
    JestMockListHandlesUseCase.mockImplementation(() =>
      instance(mockListHandlesUseCase),
    )
    JestMockCreateChatUseCase.mockImplementation(() =>
      instance(mockCreateChatUseCase),
    )
    JestMockAcceptDirectChatInvitationUseCase.mockImplementation(() =>
      instance(mockAcceptDirectChatInvitationUseCase),
    )
    JestMockDeclineDirectChatInvitationUseCase.mockImplementation(() =>
      instance(mockDeclineDirectChatInvitationUseCase),
    )
    JestMockListDirectChatInvitationsUseCase.mockImplementation(() =>
      instance(mockListDirectChatInvitationsUseCase),
    )
    JestMockListJoinedChatsUseCase.mockImplementation(() =>
      instance(mockListJoinedChatsUseCase),
    )
    JestMockBlockHandleUseCase.mockImplementation(() =>
      instance(mockBlockHandleUseCase),
    )
    JestMockUnblockHandleUseCase.mockImplementation(() =>
      instance(mockUnblockHandleUseCase),
    )
    JestMockListBlockedHandlesUseCase.mockImplementation(() =>
      instance(mockListBlockedHandlesUseCase),
    )
    JestMockCreateGroupUseCase.mockImplementation(() =>
      instance(mockCreateGroupUseCase),
    )
    JestMockUpdateGroupUseCase.mockImplementation(() =>
      instance(mockUpdateGroupUseCase),
    )
    JestMockDeleteGroupUseCase.mockImplementation(() =>
      instance(mockDeleteGroupUseCase),
    )
    JestMockGetGroupUseCase.mockImplementation(() =>
      instance(mockGetGroupUseCase),
    )
    JestMockGetGroupsUseCase.mockImplementation(() =>
      instance(mockGetGroupsUseCase),
    )
    JestMockSendGroupInvitationsUseCase.mockImplementation(() =>
      instance(mockSendGroupInvitationsUseCase),
    )
    JestMockWithdrawGroupInvitationUseCase.mockImplementation(() =>
      instance(mockWithdrawGroupInvitationUseCase),
    )
    JestMockAcceptGroupInvitationUseCase.mockImplementation(() =>
      instance(mockAcceptGroupInvitationUseCase),
    )
    JestMockDeclineGroupInvitationUseCase.mockImplementation(() =>
      instance(mockDeclineGroupInvitationUseCase),
    )
    JestMockLeaveGroupUseCase.mockImplementation(() =>
      instance(mockLeaveGroupUseCase),
    )
    JestMockListGroupInvitationsUseCase.mockImplementation(() =>
      instance(mockListGroupInvitationsUseCase),
    )
    JestMockListJoinedGroupsUseCase.mockImplementation(() =>
      instance(mockListJoinedGroupsUseCase),
    )
    JestMockGetGroupMembersUseCase.mockImplementation(() =>
      instance(mockGetGroupMembersUseCase),
    )
    JestMockUpdateGroupMemberRoleUseCase.mockImplementation(() =>
      instance(mockUpdateGroupMemberRoleUseCase),
    )
    JestMockKickGroupHandleUseCase.mockImplementation(() =>
      instance(mockKickGroupHandleUseCase),
    )
    JestMockBanGroupHandleUseCase.mockImplementation(() =>
      instance(mockBanGroupHandleUseCase),
    )
    JestMockUnbanGroupHandleUseCase.mockImplementation(() =>
      instance(mockUnbanGroupHandleUseCase),
    )
    JestMockCreateChannelUseCase.mockImplementation(() =>
      instance(mockCreateChannelUseCase),
    )
    JestMockUpdateChannelUseCase.mockImplementation(() =>
      instance(mockUpdateChannelUseCase),
    )
    JestMockDeleteChannelUseCase.mockImplementation(() =>
      instance(mockDeleteChannelUseCase),
    )
    JestMockGetChannelUseCase.mockImplementation(() =>
      instance(mockGetChannelUseCase),
    )
    JestMockGetChannelsUseCase.mockImplementation(() =>
      instance(mockGetChannelsUseCase),
    )
    JestMockSearchPublicChannelsUseCase.mockImplementation(() =>
      instance(mockSearchPublicChannelsUseCase),
    )
    JestMockJoinChannelUseCase.mockImplementation(() =>
      instance(mockJoinChannelUseCase),
    )
    JestMockLeaveChannelUseCase.mockImplementation(() =>
      instance(mockLeaveChannelUseCase),
    )
    JestMockListJoinedChannelsUseCase.mockImplementation(() =>
      instance(mockListJoinedChannelsUseCase),
    )
    JestMockSendChannelInvitationsUseCase.mockImplementation(() =>
      instance(mockSendChannelInvitationsUseCase),
    )
    JestMockWithdrawChannelInvitationUseCase.mockImplementation(() =>
      instance(mockWithdrawChannelInvitationUseCase),
    )
    JestMockAcceptChannelInvitationUseCase.mockImplementation(() =>
      instance(mockAcceptChannelInvitationUseCase),
    )
    JestMockDeclineChannelInvitationUseCase.mockImplementation(() =>
      instance(mockDeclineChannelInvitationUseCase),
    )
    JestMockListChannelInvitationsUseCase.mockImplementation(() =>
      instance(mockListChannelInvitationsUseCase),
    )
    JestMockSendInvitationRequestUseCase.mockImplementation(() =>
      instance(mockSendInvitationRequestUseCase),
    )
    JestMockListSentInvitationRequestsUseCase.mockImplementation(() =>
      instance(mockListSentInvitationRequestsUseCase),
    )
    JestMockListReceivedInvitationRequestsUseCase.mockImplementation(() =>
      instance(mockListReceivedInvitationRequestsUseCase),
    )
    JestMockGetChannelMembersUseCase.mockImplementation(() =>
      instance(mockGetChannelMembersUseCase),
    )
    JestMockGetChannelMembershipUseCase.mockImplementation(() =>
      instance(mockGetChannelMembershipUseCase),
    )
    JestMockUpdateChannelMemberRoleUseCase.mockImplementation(() =>
      instance(mockUpdateChannelMemberRoleUseCase),
    )
    JestMockKickChannelHandleUseCase.mockImplementation(() =>
      instance(mockKickChannelHandleUseCase),
    )
    JestMockBanChannelHandleUseCase.mockImplementation(() =>
      instance(mockBanChannelHandleUseCase),
    )
    JestMockUnbanChannelHandleUseCase.mockImplementation(() =>
      instance(mockUnbanChannelHandleUseCase),
    )
    JestMockGetMessagesUseCase.mockImplementation(() =>
      instance(mockGetMessagesUseCase),
    )
    JestMockGetMessageUseCase.mockImplementation(() =>
      instance(mockGetMessageUseCase),
    )
    JestMockGetChatSummariesUseCase.mockImplementation(() =>
      instance(mockGetChatSummariesUseCase),
    )
    JestMockSearchMessagesUseCase.mockImplementation(() =>
      instance(mockSearchMessagesUseCase),
    )
    JestMockMarkAsReadUseCase.mockImplementation(() =>
      instance(mockMarkAsReadUseCase),
    )
    JestMockSendTypingNotificationUseCase.mockImplementation(() =>
      instance(mockSendTypingNotificationUseCase),
    )
    JestMockSendMessageUseCase.mockImplementation(() =>
      instance(mockSendMessageUseCase),
    )
    JestMockSendThreadMessageUseCase.mockImplementation(() =>
      instance(mockSendThreadMessageUseCase),
    )
    JestMockSendReplyMessageUseCase.mockImplementation(() =>
      instance(mockSendReplyMessageUseCase),
    )
    JestMockEditMessageUseCase.mockImplementation(() =>
      instance(mockEditMessageUseCase),
    )
    JestMockDeleteMessageUseCase.mockImplementation(() =>
      instance(mockDeleteMessageUseCase),
    )
    JestMockSendMediaUseCase.mockImplementation(() =>
      instance(mockSendMediaUseCase),
    )
    JestMockToggleReactionUseCase.mockImplementation(() =>
      instance(mockToggleReactionUseCase),
    )
    JestMockPinUnpinMessageUseCase.mockImplementation(() =>
      instance(mockPinUnpinMessageUseCase),
    )
    JestMockGetPinnedMessagesUseCase.mockImplementation(() =>
      instance(mockGetPinnedMessagesUseCase),
    )
    JestMockCreatePollUseCase.mockImplementation(() =>
      instance(mockCreatePollUseCase),
    )
    JestMockSendPollResponseUseCase.mockImplementation(() =>
      instance(mockSendPollResponseUseCase),
    )
    JestMockEditPollUseCase.mockImplementation(() =>
      instance(mockEditPollUseCase),
    )
    JestMockEndPollUseCase.mockImplementation(() =>
      instance(mockEndPollUseCase),
    )
    JestMockGetPollResponsesUseCase.mockImplementation(() =>
      instance(mockGetPollResponsesUseCase),
    )
    JestMockDownloadMediaFileUseCase.mockImplementation(() =>
      instance(mockDownloadMediaFileUseCase),
    )
    JestMockAcceptVerificationUseCase.mockImplementation(() =>
      instance(mockAcceptVerificationUseCase),
    )
    JestMockApproveVerificationUseCase.mockImplementation(() =>
      instance(mockApproveVerificationUseCase),
    )
    JestMockCancelVerificationUseCase.mockImplementation(() =>
      instance(mockCancelVerificationUseCase),
    )
    JestMockCreateBackupUseCase.mockImplementation(() =>
      instance(mockCreateBackupUseCase),
    )
    JestMockDeclineVerificationUseCase.mockImplementation(() =>
      instance(mockDeclineVerificationUseCase),
    )
    JestMockGetBackupStateUseCase.mockImplementation(() =>
      instance(mockGetBackupStateUseCase),
    )
    JestMockRecoverUseCase.mockImplementation(() =>
      instance(mockRecoverUseCase),
    )
    JestMockRequestVerificationUseCase.mockImplementation(() =>
      instance(mockRequestVerificationUseCase),
    )
    JestMockResetBackupKeyUseCase.mockImplementation(() =>
      instance(mockResetBackupKeyUseCase),
    )
    JestMockRotateBackupKeyUseCase.mockImplementation(() =>
      instance(mockRotateBackupKeyUseCase),
    )
    JestMockStartVerificationUseCase.mockImplementation(() =>
      instance(mockStartVerificationUseCase),
    )
    JestMockIsVerifiedUseCase.mockImplementation(() =>
      instance(mockIsVerifiedUseCase),
    )
    JestMockOnSessionVerificationChangedUseCase.mockImplementation(() =>
      instance(mockOnSessionVerificationChangedUseCase),
    )
    JestMockOnVerificationRequestReceivedUseCase.mockImplementation(() =>
      instance(mockOnVerificationRequestReceivedUseCase),
    )
    JestMockGetDecodedInfoUseCase.mockImplementation(() =>
      instance(mockGetDecodedInfoUseCase),
    )
    JestMockGetSettingsUseCase.mockImplementation(() =>
      instance(mockGetSettingsUseCase),
    )
    JestMockSetDefaultChatRulesUseCase.mockImplementation(() =>
      instance(mockSetDefaultChatRulesUseCase),
    )
    JestMockSetDefaultEventRulesUseCase.mockImplementation(() =>
      instance(mockSetDefaultEventRulesUseCase),
    )
    JestMockSetRecipientChatRulesUseCase.mockImplementation(() =>
      instance(mockSetRecipientChatRulesUseCase),
    )
    JestMockClearRecipientChatRulesUseCase.mockImplementation(() =>
      instance(mockClearRecipientChatRulesUseCase),
    )
  }

  beforeEach(() => {
    resetMocks()
    const options: PrivateSecureCommsClientOptions = {
      sudoUserClient: instance(mockSudoUserClient),
      apiClient: instance(mockApiClient),
      secureCommsServiceConfig: mockSecureCommsServiceConfig,
    }

    instanceUnderTest = new DefaultSecureCommsClient(options)
  })

  // MARK: T Constructor

  describe('constructor', () => {
    beforeEach(() => {
      resetMocks()
    })
    it('constructs the client correctly', () => {
      DefaultConfigurationManager.getInstance().setConfig(
        JSON.stringify({
          identityService: mockIdentityServiceConfig,
          secureCommsService: mockSecureCommsServiceConfig,
        }),
      )

      new DefaultSecureCommsClient({
        sudoUserClient: instance(mockSudoUserClient),
      })
      expect(JestMockApiClient).toHaveBeenCalledTimes(1)
      expect(JestMockWebSudoCryptoProvider).toHaveBeenCalledTimes(1)
      expect(JestMockWebSudoCryptoProvider).toHaveBeenCalledWith(
        'SecureCommsClient',
        'com.sudoplatform.appservicename',
      )
      expect(JestMockUserConfig.getIdentityServiceConfig).toHaveBeenCalledTimes(
        1,
      )
      expect(JestMockDefaultSessionService).toHaveBeenCalledTimes(2)
      expect(JestMockDefaultHandleService).toHaveBeenCalledTimes(1)
    })
  })

  // MARK: T HandlesModule

  describe('handlesModule', () => {
    describe('provisionHandle', () => {
      beforeEach(() => {
        when(mockProvisionHandleUseCase.execute(anything())).thenResolve(
          EntityDataFactory.ownedHandle,
        )
      })
      it('generates use case', async () => {
        await instanceUnderTest.handles.provisionHandle({
          name: '',
        })
        expect(JestMockProvisionHandleUseCase).toHaveBeenCalledTimes(1)
      })
      it('calls use case as expected', async () => {
        const name = v4()
        await instanceUnderTest.handles.provisionHandle({
          name,
        })
        verify(mockProvisionHandleUseCase.execute(anything())).once()
        const [args] = capture(mockProvisionHandleUseCase.execute).first()
        expect(args).toEqual({
          name,
        })
      })
      it('calls use case as expected with id provided', async () => {
        const id = v4()
        const name = v4()
        await instanceUnderTest.handles.provisionHandle({
          id,
          name,
        })
        verify(mockProvisionHandleUseCase.execute(anything())).once()
        const [args] = capture(mockProvisionHandleUseCase.execute).first()
        expect(args).toEqual({ id, name })
      })
      it('returns expected result', async () => {
        await expect(
          instanceUnderTest.handles.provisionHandle({
            name: '',
          }),
        ).resolves.toEqual(APIDataFactory.handle)
      })
    })

    describe('deprovisionHandle', () => {
      beforeEach(() => {
        when(mockDeprovisionHandleUseCase.execute(anything())).thenResolve(
          EntityDataFactory.ownedHandle,
        )
      })
      it('generates use case', async () => {
        await instanceUnderTest.handles.deprovisionHandle(new HandleId(''))
        expect(JestMockDeprovisionHandleUseCase).toHaveBeenCalledTimes(1)
      })
      it('calls use case as expected', async () => {
        const id = new HandleId(v4())
        await instanceUnderTest.handles.deprovisionHandle(id)
        verify(mockDeprovisionHandleUseCase.execute(anything())).once()
        const [args] = capture(mockDeprovisionHandleUseCase.execute).first()
        expect(args).toEqual(id)
      })
      it('completes successfully', async () => {
        await expect(
          instanceUnderTest.handles.deprovisionHandle(new HandleId('')),
        ).resolves.not.toThrow()
      })
    })

    describe('updateHandle', () => {
      beforeEach(() => {
        when(mockUpdateHandleUseCase.execute(anything())).thenResolve(
          EntityDataFactory.ownedHandle,
        )
      })
      it('generates use case', async () => {
        await instanceUnderTest.handles.updateHandle({
          handleId: new HandleId(''),
          name: '',
        })
        expect(JestMockUpdateHandleUseCase).toHaveBeenCalledTimes(1)
      })
      it('calls use case as expected', async () => {
        const handleId = new HandleId(v4())
        const name = v4()
        await instanceUnderTest.handles.updateHandle({
          handleId,
          name,
        })
        verify(mockUpdateHandleUseCase.execute(anything())).once()
        const [args] = capture(mockUpdateHandleUseCase.execute).first()
        expect(args).toEqual({
          handleId,
          name,
        })
      })
      it('returns expected result', async () => {
        await expect(
          instanceUnderTest.handles.updateHandle({
            handleId: new HandleId(''),
            name: '',
          }),
        ).resolves.toEqual(APIDataFactory.handle)
      })
    })

    describe('listHandles', () => {
      beforeEach(() => {
        when(mockListHandlesUseCase.execute(anything())).thenResolve({
          handles: [EntityDataFactory.ownedHandle],
          nextToken: 'nextToken',
        })
      })
      it('generates use case', async () => {
        await instanceUnderTest.handles.listHandles({})
        expect(JestMockListHandlesUseCase).toHaveBeenCalledTimes(1)
      })
      it('calls use case as expected', async () => {
        const limit = 100
        const nextToken = v4()
        await instanceUnderTest.handles.listHandles({
          limit,
          nextToken,
        })
        verify(mockListHandlesUseCase.execute(anything())).once()
        const [args] = capture(mockListHandlesUseCase.execute).first()
        expect(args).toEqual({
          limit,
          nextToken,
        })
      })
      it('returns empty list if use case result is empty list', async () => {
        when(mockListHandlesUseCase.execute(anything())).thenResolve({
          handles: [],
          nextToken: undefined,
        })
        await expect(
          instanceUnderTest.handles.listHandles({}),
        ).resolves.toEqual({
          items: [],
          nextToken: undefined,
        })
      })
      it('returns expected result', async () => {
        await expect(
          instanceUnderTest.handles.listHandles({}),
        ).resolves.toEqual({
          items: [APIDataFactory.handle],
          nextToken: 'nextToken',
        })
      })
    })
  })

  // MARK: T DirectChatsModule

  describe('directChatsModule', () => {
    describe('createChat', () => {
      const chatId = new ChatId('chatId')
      beforeEach(() => {
        when(mockCreateChatUseCase.execute(anything())).thenResolve(chatId)
      })
      it('generates use case', async () => {
        await instanceUnderTest.directChats.createChat({
          handleId: new HandleId(''),
          handleIdToChatTo: new HandleId(''),
        })
        expect(JestMockCreateChatUseCase).toHaveBeenCalledTimes(1)
      })
      it('calls use case as expected', async () => {
        const handleId = new HandleId('handleId')
        const handleIdToChatTo = new HandleId('handleIdToChatTo')
        await instanceUnderTest.directChats.createChat({
          handleId,
          handleIdToChatTo,
        })
        verify(mockCreateChatUseCase.execute(anything())).once()
        const [args] = capture(mockCreateChatUseCase.execute).first()
        expect(args).toEqual({ handleId, handleIdToChatTo })
      })
      it('returns expected result', async () => {
        await expect(
          instanceUnderTest.directChats.createChat({
            handleId: new HandleId(''),
            handleIdToChatTo: new HandleId(''),
          }),
        ).resolves.toEqual(chatId)
      })
    })

    describe('acceptInvitation', () => {
      beforeEach(() => {
        when(
          mockAcceptDirectChatInvitationUseCase.execute(anything()),
        ).thenResolve()
      })
      it('generates use case', async () => {
        await instanceUnderTest.directChats.acceptInvitation({
          handleId: new HandleId(''),
          chatId: new ChatId(''),
        })
        expect(JestMockAcceptDirectChatInvitationUseCase).toHaveBeenCalledTimes(
          1,
        )
      })
      it('calls use case as expected', async () => {
        const handleId = new HandleId('handleId')
        const chatId = new ChatId(v4())
        await instanceUnderTest.directChats.acceptInvitation({
          handleId,
          chatId,
        })
        verify(mockAcceptDirectChatInvitationUseCase.execute(anything())).once()
        const [args] = capture(
          mockAcceptDirectChatInvitationUseCase.execute,
        ).first()
        expect(args).toEqual({ handleId, id: chatId })
      })
      it('completes successfully', async () => {
        const handleId = new HandleId('handleId')
        const chatId = new ChatId(v4())
        await expect(
          instanceUnderTest.directChats.acceptInvitation({
            handleId,
            chatId,
          }),
        ).resolves.not.toThrow()
      })
    })

    describe('declineInvitation', () => {
      beforeEach(() => {
        when(
          mockDeclineDirectChatInvitationUseCase.execute(anything()),
        ).thenResolve()
      })
      it('generates use case', async () => {
        await instanceUnderTest.directChats.declineInvitation({
          handleId: new HandleId(''),
          chatId: new ChatId(''),
        })
        expect(
          JestMockDeclineDirectChatInvitationUseCase,
        ).toHaveBeenCalledTimes(1)
      })
      it('calls use case as expected', async () => {
        const handleId = new HandleId('handleId')
        const chatId = new ChatId(v4())
        await instanceUnderTest.directChats.declineInvitation({
          handleId,
          chatId,
        })
        verify(
          mockDeclineDirectChatInvitationUseCase.execute(anything()),
        ).once()
        const [args] = capture(
          mockDeclineDirectChatInvitationUseCase.execute,
        ).first()
        expect(args).toEqual({ handleId, id: chatId })
      })
      it('completes successfully', async () => {
        const handleId = new HandleId('handleId')
        const chatId = new ChatId(v4())
        await expect(
          instanceUnderTest.directChats.declineInvitation({
            handleId,
            chatId,
          }),
        ).resolves.not.toThrow()
      })
    })

    describe('listInvitations', () => {
      beforeEach(() => {
        when(
          mockListDirectChatInvitationsUseCase.execute(anything()),
        ).thenResolve([APIDataFactory.directChatInvitation])
      })
      it('generates use case', async () => {
        await instanceUnderTest.directChats.listInvitations(new HandleId(''))
        expect(JestMockListDirectChatInvitationsUseCase).toHaveBeenCalledTimes(
          1,
        )
      })
      it('calls use case as expected', async () => {
        const handleId = new HandleId('handleId')
        await instanceUnderTest.directChats.listInvitations(handleId)
        verify(mockListDirectChatInvitationsUseCase.execute(anything())).once()
      })
      it('returns empty list if use case result is empty list', async () => {
        when(
          mockListDirectChatInvitationsUseCase.execute(anything()),
        ).thenResolve([])
        const handleId = new HandleId('handleId')
        await expect(
          instanceUnderTest.directChats.listInvitations(handleId),
        ).resolves.toEqual([])
      })
      it('returns expected result', async () => {
        const handleId = new HandleId('handleId')
        await expect(
          instanceUnderTest.directChats.listInvitations(handleId),
        ).resolves.toEqual([APIDataFactory.directChatInvitation])
      })
    })

    describe('listJoined', () => {
      beforeEach(() => {
        when(mockListJoinedChatsUseCase.execute(anything())).thenResolve([
          EntityDataFactory.directChat,
        ])
      })
      it('generates use case', async () => {
        await instanceUnderTest.directChats.listJoined(new HandleId(''))
        expect(JestMockListJoinedChatsUseCase).toHaveBeenCalledTimes(1)
      })
      it('calls use case as expected', async () => {
        const handleId = new HandleId('handleId')
        await instanceUnderTest.directChats.listJoined(handleId)
        verify(mockListJoinedChatsUseCase.execute(anything())).once()
      })
      it('returns empty list if use case result is empty list', async () => {
        when(mockListJoinedChatsUseCase.execute(anything())).thenResolve([])
        const handleId = new HandleId('handleId')
        await expect(
          instanceUnderTest.directChats.listJoined(handleId),
        ).resolves.toEqual([])
      })
      it('returns expected result', async () => {
        const handleId = new HandleId('handleId')
        await expect(
          instanceUnderTest.directChats.listJoined(handleId),
        ).resolves.toEqual([APIDataFactory.directChat])
      })
    })

    describe('blockHandle', () => {
      beforeEach(() => {
        when(mockBlockHandleUseCase.execute(anything())).thenResolve()
      })
      it('generates use case', async () => {
        await instanceUnderTest.directChats.blockHandle({
          handleId: new HandleId(''),
          handleIdToBlock: new HandleId(''),
        })
        expect(JestMockBlockHandleUseCase).toHaveBeenCalledTimes(1)
      })
      it('calls use case as expected', async () => {
        const handleId = new HandleId('handleId')
        const handleIdToBlock = new HandleId('handleIdToBlock')
        await instanceUnderTest.directChats.blockHandle({
          handleId,
          handleIdToBlock,
        })
        verify(mockBlockHandleUseCase.execute(anything())).once()
        const [args] = capture(mockBlockHandleUseCase.execute).first()
        expect(args).toEqual({ handleId, handleIdToBlock })
      })
      it('completes successfully', async () => {
        const handleId = new HandleId('handleId')
        const handleIdToBlock = new HandleId('handleIdToBlock')
        await expect(
          instanceUnderTest.directChats.blockHandle({
            handleId,
            handleIdToBlock,
          }),
        ).resolves.not.toThrow()
      })
    })

    describe('unblockHandle', () => {
      beforeEach(() => {
        when(mockUnblockHandleUseCase.execute(anything())).thenResolve()
      })
      it('generates use case', async () => {
        await instanceUnderTest.directChats.unblockHandle({
          handleId: new HandleId(''),
          handleIdToUnblock: new HandleId(''),
        })
        expect(JestMockUnblockHandleUseCase).toHaveBeenCalledTimes(1)
      })
      it('calls use case as expected', async () => {
        const handleId = new HandleId('handleId')
        const handleIdToUnblock = new HandleId('handleIdToUnblock')
        await instanceUnderTest.directChats.unblockHandle({
          handleId,
          handleIdToUnblock,
        })
        verify(mockUnblockHandleUseCase.execute(anything())).once()
        const [args] = capture(mockUnblockHandleUseCase.execute).first()
        expect(args).toEqual({ handleId, handleIdToUnblock })
      })
      it('completes successfully', async () => {
        const handleId = new HandleId('handleId')
        const handleIdToUnblock = new HandleId('handleIdToUnblock')
        await expect(
          instanceUnderTest.directChats.unblockHandle({
            handleId,
            handleIdToUnblock,
          }),
        ).resolves.not.toThrow()
      })
    })

    describe('listBlockedHandles', () => {
      const handleId = new HandleId('handleId')
      beforeEach(() => {
        when(mockListBlockedHandlesUseCase.execute(anything())).thenResolve([
          handleId,
        ])
      })
      it('generates use case', async () => {
        await instanceUnderTest.directChats.listBlockedHandles(new HandleId(''))
        expect(JestMockListBlockedHandlesUseCase).toHaveBeenCalledTimes(1)
      })
      it('calls use case as expected', async () => {
        await instanceUnderTest.directChats.listBlockedHandles(handleId)
        verify(mockListBlockedHandlesUseCase.execute(anything())).once()
      })
      it('returns empty list if use case result is empty list', async () => {
        when(mockListBlockedHandlesUseCase.execute(anything())).thenResolve([])
        await expect(
          instanceUnderTest.directChats.listBlockedHandles(handleId),
        ).resolves.toEqual([])
      })
      it('returns expected result', async () => {
        await expect(
          instanceUnderTest.directChats.listBlockedHandles(handleId),
        ).resolves.toEqual([handleId])
      })
    })
  })

  // MARK: T GroupsModule

  describe('groupsModule', () => {
    describe('createGroup', () => {
      beforeEach(() => {
        when(mockCreateGroupUseCase.execute(anything())).thenResolve(
          EntityDataFactory.group,
        )
      })
      it('generates use case', async () => {
        await instanceUnderTest.groups.createGroup({
          handleId: new HandleId(''),
          name: '',
          description: '',
          avatar: undefined,
          invitedHandleIds: [],
        })
        expect(JestMockCreateGroupUseCase).toHaveBeenCalledTimes(1)
      })
      it('calls use case as expected', async () => {
        const handleId = new HandleId('handleId')
        const name = 'fooName'
        const description = 'fooDescription'
        await instanceUnderTest.groups.createGroup({
          handleId,
          name,
          description,
          avatar: undefined,
          invitedHandleIds: [],
        })
        verify(mockCreateGroupUseCase.execute(anything())).once()
        const [args] = capture(mockCreateGroupUseCase.execute).first()
        expect(args).toEqual({
          handleId,
          name,
          description,
          invitedHandleIds: [],
        })
      })
      it('calls update groups use case as expected', async () => {
        const handleId = new HandleId('handleId')
        const name = 'fooName'
        const description = 'fooDescription'
        const avatar = {
          file: new ArrayBuffer(0),
          fileName: 'fileName',
          fileType: 'fileType',
        }
        when(mockUpdateGroupUseCase.execute(anything())).thenResolve({
          ...EntityDataFactory.group,
          avatarUrl: 'mxcUrl',
        })
        await instanceUnderTest.groups.createGroup({
          handleId,
          name,
          description,
          avatar,
          invitedHandleIds: [],
        })
        verify(mockUpdateGroupUseCase.execute(anything())).once()
        const [updateArgs] = capture(mockUpdateGroupUseCase.execute).first()
        expect(updateArgs).toEqual({
          handleId,
          groupId: EntityDataFactory.group.groupId,
          avatar: { value: avatar },
        })
        verify(mockCreateGroupUseCase.execute(anything())).once()
        const [args] = capture(mockCreateGroupUseCase.execute).first()
        expect(args).toEqual({
          handleId,
          name,
          description,
          invitedHandleIds: [],
        })
      })
      it('returns expected result', async () => {
        await expect(
          instanceUnderTest.groups.createGroup({
            handleId: new HandleId(''),
            name: '',
            description: '',
            avatar: undefined,
            invitedHandleIds: [],
          }),
        ).resolves.toEqual(APIDataFactory.group)
      })
    })

    describe('updateGroup', () => {
      beforeEach(() => {
        when(mockUpdateGroupUseCase.execute(anything())).thenResolve(
          EntityDataFactory.group,
        )
      })
      it('generates use case', async () => {
        await instanceUnderTest.groups.updateGroup({
          handleId: new HandleId(''),
          groupId: new GroupId(''),
          name: { value: '' },
        })
        expect(JestMockUpdateGroupUseCase).toHaveBeenCalledTimes(1)
      })
      it('calls use case as expected', async () => {
        const handleId = new HandleId('handleId')
        const groupId = new GroupId('testGroupId')
        const name = 'fooName'
        await instanceUnderTest.groups.updateGroup({
          handleId,
          groupId,
          name: { value: name },
        })
        verify(mockUpdateGroupUseCase.execute(anything())).once()
        const [args] = capture(mockUpdateGroupUseCase.execute).first()
        expect(args).toEqual({
          handleId,
          groupId,
          name: { value: name },
        })
      })
      it('returns expected result', async () => {
        await expect(
          instanceUnderTest.groups.updateGroup({
            handleId: new HandleId(''),
            groupId: new GroupId(''),
            name: { value: '' },
          }),
        ).resolves.toEqual(APIDataFactory.group)
      })
    })

    describe('deleteGroup', () => {
      beforeEach(() => {
        when(mockDeleteGroupUseCase.execute(anything())).thenResolve()
      })
      it('generates use case', async () => {
        await instanceUnderTest.groups.deleteGroup({
          handleId: new HandleId(''),
          groupId: new GroupId(''),
        })
        expect(JestMockDeleteGroupUseCase).toHaveBeenCalledTimes(1)
      })
      it('calls use case as expected', async () => {
        const handleId = new HandleId('handleId')
        const groupId = new GroupId(v4())
        await instanceUnderTest.groups.deleteGroup({
          handleId,
          groupId,
        })
        verify(mockDeleteGroupUseCase.execute(anything())).once()
        const [args] = capture(mockDeleteGroupUseCase.execute).first()
        expect(args).toEqual({ handleId, groupId })
      })
      it('completes successfully', async () => {
        const handleId = new HandleId('handleId')
        const groupId = new GroupId(v4())
        await expect(
          instanceUnderTest.groups.deleteGroup({
            handleId,
            groupId,
          }),
        ).resolves.not.toThrow()
      })
    })

    describe('getGroup', () => {
      beforeEach(() => {
        when(mockGetGroupUseCase.execute(anything())).thenResolve(
          EntityDataFactory.group,
        )
      })
      it('generates use case', async () => {
        await instanceUnderTest.groups.getGroup({
          handleId: new HandleId(''),
          groupId: new GroupId(''),
        })
        expect(JestMockGetGroupUseCase).toHaveBeenCalledTimes(1)
      })
      it('calls use case as expected', async () => {
        const handleId = new HandleId('handleId')
        const groupId = new GroupId(v4())
        await instanceUnderTest.groups.getGroup({ handleId, groupId })
        verify(mockGetGroupUseCase.execute(anything())).once()
        const [args] = capture(mockGetGroupUseCase.execute).first()
        expect(args).toEqual({ handleId, groupId })
      })
      it('returns expected result', async () => {
        await expect(
          instanceUnderTest.groups.getGroup({
            handleId: new HandleId(''),
            groupId: new GroupId(''),
          }),
        ).resolves.toEqual(APIDataFactory.group)
      })
    })

    describe('getGroups', () => {
      beforeEach(() => {
        when(mockGetGroupsUseCase.execute(anything())).thenResolve([
          EntityDataFactory.group,
        ])
      })
      it('generates use case', async () => {
        const id = new GroupId(v4())
        await instanceUnderTest.groups.getGroups({
          handleId: new HandleId(''),
          groupIds: [id],
        })
        expect(JestMockGetGroupsUseCase).toHaveBeenCalledTimes(1)
      })
      it('calls use case as expected', async () => {
        const handleId = new HandleId('handleId')
        const id = new GroupId(v4())
        await instanceUnderTest.groups.getGroups({ handleId, groupIds: [id] })
        verify(mockGetGroupsUseCase.execute(anything())).once()
        const [args] = capture(mockGetGroupsUseCase.execute).first()
        expect(args).toEqual({ handleId, groupIds: [id] })
      })
      it('returns empty list if use case result is empty list', async () => {
        when(mockGetGroupsUseCase.execute(anything())).thenResolve([])
        await expect(
          instanceUnderTest.groups.getGroups({
            handleId: new HandleId(''),
            groupIds: [],
          }),
        ).resolves.toEqual([])
      })
      it('returns expected result', async () => {
        const handleId = new HandleId('handleId')
        const id = new GroupId(v4())
        await expect(
          instanceUnderTest.groups.getGroups({
            handleId,
            groupIds: [id],
          }),
        ).resolves.toEqual([APIDataFactory.group])
      })
    })

    describe('sendInvitations', () => {
      beforeEach(() => {
        when(mockSendGroupInvitationsUseCase.execute(anything())).thenResolve()
      })
      it('generates use case', async () => {
        await instanceUnderTest.groups.sendInvitations({
          handleId: new HandleId(''),
          groupId: new GroupId(''),
          targetHandleIds: [new HandleId('')],
        })
        expect(JestMockSendGroupInvitationsUseCase).toHaveBeenCalledTimes(1)
      })
      it('calls use case as expected', async () => {
        const handleId = new HandleId('handleId')
        const groupId = new GroupId(v4())
        const targetHandleIds = [new HandleId('targetHandleId')]
        await instanceUnderTest.groups.sendInvitations({
          handleId,
          groupId,
          targetHandleIds,
        })
        verify(mockSendGroupInvitationsUseCase.execute(anything())).once()
        const [args] = capture(mockSendGroupInvitationsUseCase.execute).first()
        expect(args).toEqual({ handleId, groupId, targetHandleIds })
      })
      it('completes successfully', async () => {
        const handleId = new HandleId('handleId')
        const groupId = new GroupId(v4())
        const targetHandleIds = [new HandleId('targetHandleId')]
        await expect(
          instanceUnderTest.groups.sendInvitations({
            handleId,
            groupId,
            targetHandleIds,
          }),
        ).resolves.not.toThrow()
      })
    })

    describe('withdrawInvitation', () => {
      beforeEach(() => {
        when(
          mockWithdrawGroupInvitationUseCase.execute(anything()),
        ).thenResolve()
      })
      it('generates use case', async () => {
        await instanceUnderTest.groups.withdrawInvitation({
          handleId: new HandleId(''),
          groupId: new GroupId(''),
          targetHandleId: new HandleId(''),
        })
        expect(JestMockWithdrawGroupInvitationUseCase).toHaveBeenCalledTimes(1)
      })
      it('calls use case as expected', async () => {
        const handleId = new HandleId('handleId')
        const groupId = new GroupId(v4())
        const targetHandleId = new HandleId('targetHandleId')
        await instanceUnderTest.groups.withdrawInvitation({
          handleId,
          groupId,
          targetHandleId,
        })
        verify(mockWithdrawGroupInvitationUseCase.execute(anything())).once()
        const [args] = capture(
          mockWithdrawGroupInvitationUseCase.execute,
        ).first()
        expect(args).toEqual({ handleId, groupId, targetHandleId })
      })
      it('completes successfully', async () => {
        const handleId = new HandleId('handleId')
        const groupId = new GroupId(v4())
        const targetHandleId = new HandleId('targetHandleId')
        await expect(
          instanceUnderTest.groups.withdrawInvitation({
            handleId,
            groupId,
            targetHandleId,
          }),
        ).resolves.not.toThrow()
      })
    })

    describe('acceptInvitation', () => {
      beforeEach(() => {
        when(mockAcceptGroupInvitationUseCase.execute(anything())).thenResolve()
      })
      it('generates use case', async () => {
        await instanceUnderTest.groups.acceptInvitation({
          handleId: new HandleId(''),
          groupId: new GroupId(''),
        })
        expect(JestMockAcceptGroupInvitationUseCase).toHaveBeenCalledTimes(1)
      })
      it('calls use case as expected', async () => {
        const handleId = new HandleId('handleId')
        const groupId = new GroupId(v4())
        await instanceUnderTest.groups.acceptInvitation({
          handleId,
          groupId,
        })
        verify(mockAcceptGroupInvitationUseCase.execute(anything())).once()
        const [args] = capture(mockAcceptGroupInvitationUseCase.execute).first()
        expect(args).toEqual({ handleId, groupId })
      })
      it('completes successfully', async () => {
        const handleId = new HandleId('handleId')
        const groupId = new GroupId(v4())
        await expect(
          instanceUnderTest.groups.acceptInvitation({
            handleId,
            groupId,
          }),
        ).resolves.not.toThrow()
      })
    })

    describe('declineInvitation', () => {
      beforeEach(() => {
        when(
          mockDeclineGroupInvitationUseCase.execute(anything()),
        ).thenResolve()
      })
      it('generates use case', async () => {
        await instanceUnderTest.groups.declineInvitation({
          handleId: new HandleId(''),
          groupId: new GroupId(''),
        })
        expect(JestMockDeclineGroupInvitationUseCase).toHaveBeenCalledTimes(1)
      })
      it('calls use case as expected', async () => {
        const handleId = new HandleId('handleId')
        const groupId = new GroupId(v4())
        await instanceUnderTest.groups.declineInvitation({
          handleId,
          groupId,
        })
        verify(mockDeclineGroupInvitationUseCase.execute(anything())).once()
        const [args] = capture(
          mockDeclineGroupInvitationUseCase.execute,
        ).first()
        expect(args).toEqual({ handleId, groupId })
      })
      it('completes successfully', async () => {
        const handleId = new HandleId('handleId')
        const groupId = new GroupId(v4())
        await expect(
          instanceUnderTest.groups.declineInvitation({
            handleId,
            groupId,
          }),
        ).resolves.not.toThrow()
      })
    })

    describe('leaveGroup', () => {
      beforeEach(() => {
        when(mockLeaveGroupUseCase.execute(anything())).thenResolve()
      })
      it('generates use case', async () => {
        await instanceUnderTest.groups.leaveGroup({
          handleId: new HandleId(''),
          groupId: new GroupId(''),
        })
        expect(JestMockLeaveGroupUseCase).toHaveBeenCalledTimes(1)
      })
      it('calls use case as expected', async () => {
        const handleId = new HandleId('handleId')
        const groupId = new GroupId(v4())
        await instanceUnderTest.groups.leaveGroup({ handleId, groupId })
        verify(mockLeaveGroupUseCase.execute(anything())).once()
        const [args] = capture(mockLeaveGroupUseCase.execute).first()
        expect(args).toEqual({ handleId, groupId })
      })
      it('completes successfully', async () => {
        const handleId = new HandleId('handleId')
        const groupId = new GroupId(v4())
        await expect(
          instanceUnderTest.groups.leaveGroup({ handleId, groupId }),
        ).resolves.not.toThrow()
      })
    })

    describe('listInvitations', () => {
      beforeEach(() => {
        when(mockListGroupInvitationsUseCase.execute(anything())).thenResolve([
          EntityDataFactory.group,
        ])
      })
      it('generates use case', async () => {
        await instanceUnderTest.groups.listInvitations(new HandleId(''))
        expect(JestMockListGroupInvitationsUseCase).toHaveBeenCalledTimes(1)
      })
      it('calls use case as expected', async () => {
        const handleId = new HandleId('handleId')
        await instanceUnderTest.groups.listInvitations(handleId)
        verify(mockListGroupInvitationsUseCase.execute(anything())).once()
      })
      it('returns empty list if use case result is empty list', async () => {
        when(mockListGroupInvitationsUseCase.execute(anything())).thenResolve(
          [],
        )
        const handleId = new HandleId('handleId')
        await expect(
          instanceUnderTest.groups.listInvitations(handleId),
        ).resolves.toEqual([])
      })
      it('returns expected result', async () => {
        const handleId = new HandleId('handleId')
        await expect(
          instanceUnderTest.groups.listInvitations(handleId),
        ).resolves.toEqual([APIDataFactory.group])
      })
    })

    describe('listJoined', () => {
      beforeEach(() => {
        when(mockListJoinedGroupsUseCase.execute(anything())).thenResolve([
          EntityDataFactory.group,
        ])
      })
      it('generates use case', async () => {
        await instanceUnderTest.groups.listJoined(new HandleId(''))
        expect(JestMockListJoinedGroupsUseCase).toHaveBeenCalledTimes(1)
      })
      it('calls use case as expected', async () => {
        const handleId = new HandleId('handleId')
        await instanceUnderTest.groups.listJoined(handleId)
        verify(mockListJoinedGroupsUseCase.execute(anything())).once()
      })
      it('returns empty list if use case result is empty list', async () => {
        when(mockListJoinedGroupsUseCase.execute(anything())).thenResolve([])
        const handleId = new HandleId('handleId')
        await expect(
          instanceUnderTest.groups.listJoined(handleId),
        ).resolves.toEqual([])
      })
      it('returns expected result', async () => {
        const handleId = new HandleId('handleId')
        await expect(
          instanceUnderTest.groups.listJoined(handleId),
        ).resolves.toEqual([APIDataFactory.group])
      })
    })

    describe('getGroupMembers', () => {
      beforeEach(() => {
        when(mockGetGroupMembersUseCase.execute(anything())).thenResolve([
          EntityDataFactory.groupMember,
        ])
      })
      it('generates use case', async () => {
        await instanceUnderTest.groups.getGroupMembers({
          handleId: new HandleId(''),
          groupId: new GroupId(''),
        })
        expect(JestMockGetGroupMembersUseCase).toHaveBeenCalledTimes(1)
      })
      it('calls use case as expected', async () => {
        const handleId = new HandleId(v4())
        const groupId = new GroupId(v4())
        await instanceUnderTest.groups.getGroupMembers({ handleId, groupId })
        verify(mockGetGroupMembersUseCase.execute(anything())).once()
        const [args] = capture(mockGetGroupMembersUseCase.execute).first()
        expect(args).toEqual({ handleId, groupId })
      })
      it('returns empty list if use case result is empty list', async () => {
        const handleId = new HandleId(v4())
        const groupId = new GroupId(v4())
        when(mockGetGroupMembersUseCase.execute(anything())).thenResolve([])
        await expect(
          instanceUnderTest.groups.getGroupMembers({ handleId, groupId }),
        ).resolves.toEqual([])
      })
      it('returns expected result', async () => {
        const handleId = new HandleId(v4())
        const groupId = new GroupId(v4())
        await expect(
          instanceUnderTest.groups.getGroupMembers({ handleId, groupId }),
        ).resolves.toEqual([APIDataFactory.groupMember])
      })
    })

    describe('updateGroupMemberRole', () => {
      beforeEach(() => {
        when(mockUpdateGroupMemberRoleUseCase.execute(anything())).thenResolve()
      })
      it('generates use case', async () => {
        await instanceUnderTest.groups.updateGroupMemberRole({
          handleId: new HandleId(''),
          groupId: new GroupId(''),
          targetHandleId: new HandleId(''),
          role: GroupRole.PARTICIPANT,
        })
        expect(JestMockUpdateGroupMemberRoleUseCase).toHaveBeenCalledTimes(1)
      })
      it('calls use case as expected', async () => {
        const handleId = new HandleId('handleId')
        const groupId = new GroupId(v4())
        const targetHandleId = new HandleId('targetHandleId')
        const role = GroupRole.PARTICIPANT
        await instanceUnderTest.groups.updateGroupMemberRole({
          handleId,
          groupId,
          targetHandleId,
          role,
        })
        verify(mockUpdateGroupMemberRoleUseCase.execute(anything())).once()
        const [args] = capture(mockUpdateGroupMemberRoleUseCase.execute).first()
        expect(args).toEqual({ handleId, groupId, targetHandleId, role })
      })
      it('completes successfully', async () => {
        const handleId = new HandleId('handleId')
        const groupId = new GroupId(v4())
        const targetHandleId = new HandleId('targetHandleId')
        const role = GroupRole.PARTICIPANT
        await expect(
          instanceUnderTest.groups.updateGroupMemberRole({
            handleId,
            groupId,
            targetHandleId,
            role,
          }),
        ).resolves.not.toThrow()
      })
    })

    describe('kickHandle', () => {
      beforeEach(() => {
        when(mockKickGroupHandleUseCase.execute(anything())).thenResolve()
      })
      it('generates use case', async () => {
        await instanceUnderTest.groups.kickHandle({
          handleId: new HandleId(''),
          groupId: new GroupId(''),
          targetHandleId: new HandleId(''),
          reason: '',
        })
        expect(JestMockKickGroupHandleUseCase).toHaveBeenCalledTimes(1)
      })
      it('calls use case as expected', async () => {
        const handleId = new HandleId('handleId')
        const groupId = new GroupId(v4())
        const targetHandleId = new HandleId('targetHandleId')
        const reason = 'reason'
        await instanceUnderTest.groups.kickHandle({
          handleId,
          groupId,
          targetHandleId,
          reason,
        })
        verify(mockKickGroupHandleUseCase.execute(anything())).once()
        const [args] = capture(mockKickGroupHandleUseCase.execute).first()
        expect(args).toEqual({ handleId, groupId, targetHandleId, reason })
      })
      it('completes successfully', async () => {
        const handleId = new HandleId('handleId')
        const groupId = new GroupId(v4())
        const targetHandleId = new HandleId('targetHandleId')
        const reason = 'reason'
        await expect(
          instanceUnderTest.groups.kickHandle({
            handleId,
            groupId,
            targetHandleId,
            reason,
          }),
        ).resolves.not.toThrow()
      })
    })

    describe('banHandle', () => {
      beforeEach(() => {
        when(mockBanGroupHandleUseCase.execute(anything())).thenResolve()
      })
      it('generates use case', async () => {
        await instanceUnderTest.groups.banHandle({
          handleId: new HandleId(''),
          groupId: new GroupId(''),
          targetHandleId: new HandleId(''),
          reason: '',
        })
        expect(JestMockBanGroupHandleUseCase).toHaveBeenCalledTimes(1)
      })
      it('calls use case as expected', async () => {
        const handleId = new HandleId('handleId')
        const groupId = new GroupId(v4())
        const targetHandleId = new HandleId('targetHandleId')
        const reason = 'reason'
        await instanceUnderTest.groups.banHandle({
          handleId,
          groupId,
          targetHandleId,
          reason,
        })
        verify(mockBanGroupHandleUseCase.execute(anything())).once()
        const [args] = capture(mockBanGroupHandleUseCase.execute).first()
        expect(args).toEqual({ handleId, groupId, targetHandleId, reason })
      })
      it('completes successfully', async () => {
        const handleId = new HandleId('handleId')
        const groupId = new GroupId(v4())
        const targetHandleId = new HandleId('targetHandleId')
        const reason = 'reason'
        await expect(
          instanceUnderTest.groups.banHandle({
            handleId,
            groupId,
            targetHandleId,
            reason,
          }),
        ).resolves.not.toThrow()
      })
    })

    describe('unbanHandle', () => {
      beforeEach(() => {
        when(mockUnbanGroupHandleUseCase.execute(anything())).thenResolve()
      })
      it('generates use case', async () => {
        await instanceUnderTest.groups.unbanHandle({
          handleId: new HandleId(''),
          groupId: new GroupId(''),
          targetHandleId: new HandleId(''),
        })
        expect(JestMockUnbanGroupHandleUseCase).toHaveBeenCalledTimes(1)
      })
      it('calls use case as expected', async () => {
        const handleId = new HandleId('handleId')
        const groupId = new GroupId(v4())
        const targetHandleId = new HandleId('targetHandleId')
        await instanceUnderTest.groups.unbanHandle({
          handleId,
          groupId,
          targetHandleId,
        })
        verify(mockUnbanGroupHandleUseCase.execute(anything())).once()
        const [args] = capture(mockUnbanGroupHandleUseCase.execute).first()
        expect(args).toEqual({ handleId, groupId, targetHandleId })
      })
      it('completes successfully', async () => {
        const handleId = new HandleId('handleId')
        const groupId = new GroupId(v4())
        const targetHandleId = new HandleId('targetHandleId')
        await expect(
          instanceUnderTest.groups.unbanHandle({
            handleId,
            groupId,
            targetHandleId,
          }),
        ).resolves.not.toThrow()
      })
    })
  })

  // MARK: T ChannelsModule

  describe('channelsModule', () => {
    describe('createChannel', () => {
      beforeEach(() => {
        when(mockCreateChannelUseCase.execute(anything())).thenResolve(
          EntityDataFactory.channel,
        )
      })
      it('generates use case', async () => {
        await instanceUnderTest.channels.createChannel({
          handleId: new HandleId(''),
          name: '',
          description: '',
          avatar: undefined,
          joinRule: ChannelJoinRule.PUBLIC,
          tags: [],
          invitedHandleIds: [],
          permissions: APIDataFactory.defaultChannelPermissionsInput,
          defaultMemberRole: ChannelRole.ADMIN,
        })
        expect(JestMockCreateChannelUseCase).toHaveBeenCalledTimes(1)
      })
      it('calls use case as expected', async () => {
        const handleId = new HandleId('handleId')
        const name = 'fooName'
        const description = 'fooDescription'
        const joinRule = ChannelJoinRule.PUBLIC
        const tags = ['tag-1', 'tag-2']
        const defaultMemberRole = ChannelRole.ADMIN
        await instanceUnderTest.channels.createChannel({
          handleId,
          name,
          description,
          joinRule,
          tags,
          invitedHandleIds: [],
          permissions: APIDataFactory.defaultChannelPermissionsInput,
          defaultMemberRole,
        })
        verify(mockCreateChannelUseCase.execute(anything())).once()
        const [args] = capture(mockCreateChannelUseCase.execute).first()
        expect(args).toEqual({
          handleId,
          name,
          description,
          joinRule,
          tags,
          invitedHandleIds: [],
          permissions: APIDataFactory.defaultChannelPermissionsInput,
          defaultMemberRole,
        })
      })
      it('calls update channels use case as expected', async () => {
        const handleId = new HandleId('handleId')
        const name = 'fooName'
        const description = 'fooDescription'
        const joinRule = ChannelJoinRule.PUBLIC
        const tags = ['tag-1', 'tag-2']
        const defaultMemberRole = ChannelRole.ADMIN
        const avatar = {
          file: new ArrayBuffer(0),
          fileName: 'fileName',
          fileType: 'fileType',
        }
        when(mockUpdateChannelUseCase.execute(anything())).thenResolve({
          ...EntityDataFactory.channel,
          avatarUrl: 'mxcUrl',
        })
        await instanceUnderTest.channels.createChannel({
          handleId,
          name,
          description,
          avatar,
          joinRule,
          tags,
          invitedHandleIds: [],
          permissions: APIDataFactory.defaultChannelPermissionsInput,
          defaultMemberRole,
        })
        verify(mockUpdateChannelUseCase.execute(anything())).once()
        const [updateArgs] = capture(mockUpdateChannelUseCase.execute).first()
        expect(updateArgs).toEqual({
          handleId,
          channelId: EntityDataFactory.channel.channelId,
          avatar: { value: avatar },
        })
        verify(mockCreateChannelUseCase.execute(anything())).once()
        const [args] = capture(mockCreateChannelUseCase.execute).first()
        expect(args).toEqual({
          handleId,
          name,
          description,
          joinRule,
          tags,
          invitedHandleIds: [],
          permissions: APIDataFactory.defaultChannelPermissionsInput,
          defaultMemberRole,
        })
      })
      it('returns expected result', async () => {
        await expect(
          instanceUnderTest.channels.createChannel({
            handleId: new HandleId(''),
            name: '',
            description: '',
            avatar: undefined,
            joinRule: ChannelJoinRule.PUBLIC,
            tags: [],
            invitedHandleIds: [],
            permissions: APIDataFactory.defaultChannelPermissionsInput,
            defaultMemberRole: ChannelRole.ADMIN,
          }),
        ).resolves.toEqual(APIDataFactory.channel)
      })
    })

    describe('updateChannel', () => {
      beforeEach(() => {
        when(mockUpdateChannelUseCase.execute(anything())).thenResolve(
          EntityDataFactory.channel,
        )
      })
      it('generates use case', async () => {
        await instanceUnderTest.channels.updateChannel({
          handleId: new HandleId(''),
          channelId: new ChannelId(''),
          name: { value: '' },
        })
        expect(JestMockUpdateChannelUseCase).toHaveBeenCalledTimes(1)
      })
      it('calls use case as expected', async () => {
        const handleId = new HandleId('handleId')
        const channelId = new ChannelId('testChannelId')
        const name = 'fooName'
        await instanceUnderTest.channels.updateChannel({
          handleId,
          channelId,
          name: { value: name },
        })
        verify(mockUpdateChannelUseCase.execute(anything())).once()
        const [args] = capture(mockUpdateChannelUseCase.execute).first()
        expect(args).toEqual({
          handleId,
          channelId,
          name: { value: name },
        })
      })
      it('returns expected result', async () => {
        await expect(
          instanceUnderTest.channels.updateChannel({
            handleId: new HandleId(''),
            channelId: new ChannelId(''),
            name: { value: '' },
          }),
        ).resolves.toEqual(APIDataFactory.channel)
      })
    })

    describe('deleteChannel', () => {
      beforeEach(() => {
        when(mockDeleteChannelUseCase.execute(anything())).thenResolve()
      })
      it('generates use case', async () => {
        await instanceUnderTest.channels.deleteChannel({
          handleId: new HandleId(''),
          channelId: new ChannelId(''),
        })
        expect(JestMockDeleteChannelUseCase).toHaveBeenCalledTimes(1)
      })
      it('calls use case as expected', async () => {
        const handleId = new HandleId('handleId')
        const channelId = new ChannelId('testGroupId')
        await instanceUnderTest.channels.deleteChannel({ handleId, channelId })
        verify(mockDeleteChannelUseCase.execute(anything())).once()
        const [args] = capture(mockDeleteChannelUseCase.execute).first()
        expect(args).toEqual({ handleId, channelId })
      })
      it('completes successfully', async () => {
        await expect(
          instanceUnderTest.channels.deleteChannel({
            handleId: new HandleId(''),
            channelId: new ChannelId(''),
          }),
        ).resolves.not.toThrow()
      })
    })

    describe('getChannel', () => {
      beforeEach(() => {
        when(mockGetChannelUseCase.execute(anything())).thenResolve(
          EntityDataFactory.channel,
        )
      })
      it('generates use case', async () => {
        await instanceUnderTest.channels.getChannel({
          handleId: new HandleId(''),
          channelId: new ChannelId(''),
        })
        expect(JestMockGetChannelUseCase).toHaveBeenCalledTimes(1)
      })
      it('calls use case as expected', async () => {
        const handleId = new HandleId('handleId')
        const channelId = new ChannelId(v4())
        await instanceUnderTest.channels.getChannel({ handleId, channelId })
        verify(mockGetChannelUseCase.execute(anything())).once()
        const [args] = capture(mockGetChannelUseCase.execute).first()
        expect(args).toEqual({ handleId, channelId })
      })
      it('returns expected result', async () => {
        await expect(
          instanceUnderTest.channels.getChannel({
            handleId: new HandleId(''),
            channelId: new ChannelId(''),
          }),
        ).resolves.toEqual(APIDataFactory.channel)
      })
    })

    describe('getChannels', () => {
      beforeEach(() => {
        when(mockGetChannelsUseCase.execute(anything())).thenResolve([
          EntityDataFactory.channel,
        ])
      })
      it('generates use case', async () => {
        const id = new ChannelId(v4())
        await instanceUnderTest.channels.getChannels({
          handleId: new HandleId(''),
          channelIds: [id],
        })
        expect(JestMockGetChannelsUseCase).toHaveBeenCalledTimes(1)
      })
      it('calls use case as expected', async () => {
        const handleId = new HandleId('handleId')
        const id = new ChannelId(v4())
        await instanceUnderTest.channels.getChannels({
          handleId,
          channelIds: [id],
        })
        verify(mockGetChannelsUseCase.execute(anything())).once()
        const [args] = capture(mockGetChannelsUseCase.execute).first()
        expect(args).toEqual({ handleId, channelIds: [id] })
      })
      it('returns empty list if use case result is empty list', async () => {
        when(mockGetChannelsUseCase.execute(anything())).thenResolve([])
        await expect(
          instanceUnderTest.channels.getChannels({
            handleId: new HandleId(''),
            channelIds: [],
          }),
        ).resolves.toEqual([])
      })
      it('returns expected result', async () => {
        const handleId = new HandleId('handleId')
        const id = new ChannelId(v4())
        await expect(
          instanceUnderTest.channels.getChannels({
            handleId,
            channelIds: [id],
          }),
        ).resolves.toEqual([APIDataFactory.channel])
      })
    })

    describe('searchPublicChannels', () => {
      const handleId = new HandleId('')
      const order = {
        field: ChannelSortField.NAME,
        direction: ChannelSortDirection.ASCENDING,
      }
      const searchTerm = v4()
      const joinRule = PublicChannelJoinRule.PUBLIC
      const isJoined = true
      const limit = 100
      const nextToken = v4()
      beforeEach(() => {
        when(mockSearchPublicChannelsUseCase.execute(anything())).thenResolve({
          channels: [EntityDataFactory.publicChannelSearchResult],
          nextToken: 'nextToken',
        })
      })
      it('generates use case', async () => {
        await instanceUnderTest.channels.searchPublicChannels({
          handleId,
          order,
        })
        expect(JestMockSearchPublicChannelsUseCase).toHaveBeenCalledTimes(1)
      })
      it('calls use case as expected', async () => {
        await instanceUnderTest.channels.searchPublicChannels({
          handleId,
          order,
          searchTerm,
          joinRule,
          isJoined,
          limit,
          nextToken,
        })
        verify(mockSearchPublicChannelsUseCase.execute(anything())).once()
        const [args] = capture(mockSearchPublicChannelsUseCase.execute).first()
        expect(args).toEqual({
          handleId,
          order,
          searchTerm,
          joinRule,
          isJoined,
          limit,
          nextToken,
        })
      })
      it('returns empty list if use case result is empty list', async () => {
        when(mockSearchPublicChannelsUseCase.execute(anything())).thenResolve({
          channels: [],
          nextToken: undefined,
        })
        await expect(
          instanceUnderTest.channels.searchPublicChannels({
            handleId: new HandleId('handleId'),
            order,
          }),
        ).resolves.toEqual({ items: [], nextToken: undefined })
      })
      it('returns expected result', async () => {
        await expect(
          instanceUnderTest.channels.searchPublicChannels({
            handleId: new HandleId(''),
            order,
          }),
        ).resolves.toEqual({
          items: [APIDataFactory.publicChannelSearchResult],
          nextToken: 'nextToken',
        })
      })
    })

    describe('joinChannel', () => {
      beforeEach(() => {
        when(mockJoinChannelUseCase.execute(anything())).thenResolve()
      })
      it('generates use case', async () => {
        await instanceUnderTest.channels.joinChannel({
          handleId: new HandleId(''),
          channelId: new ChannelId(''),
        })
        expect(JestMockJoinChannelUseCase).toHaveBeenCalledTimes(1)
      })
      it('calls use case as expected', async () => {
        const handleId = new HandleId('handleId')
        const channelId = new ChannelId(v4())
        await instanceUnderTest.channels.joinChannel({ handleId, channelId })
        verify(mockJoinChannelUseCase.execute(anything())).once()
        const [args] = capture(mockJoinChannelUseCase.execute).first()
        expect(args).toEqual({ handleId, channelId })
      })
      it('completes successfully', async () => {
        const handleId = new HandleId('handleId')
        const channelId = new ChannelId(v4())
        await expect(
          instanceUnderTest.channels.joinChannel({ handleId, channelId }),
        ).resolves.not.toThrow()
      })
    })

    describe('leaveChannel', () => {
      beforeEach(() => {
        when(mockLeaveChannelUseCase.execute(anything())).thenResolve()
      })
      it('generates use case', async () => {
        await instanceUnderTest.channels.leaveChannel({
          handleId: new HandleId(''),
          channelId: new ChannelId(''),
        })
        expect(JestMockLeaveChannelUseCase).toHaveBeenCalledTimes(1)
      })
      it('calls use case as expected', async () => {
        const handleId = new HandleId('handleId')
        const channelId = new ChannelId(v4())
        await instanceUnderTest.channels.leaveChannel({ handleId, channelId })
        verify(mockLeaveChannelUseCase.execute(anything())).once()
        const [args] = capture(mockLeaveChannelUseCase.execute).first()
        expect(args).toEqual({ handleId, channelId })
      })
      it('completes successfully', async () => {
        const handleId = new HandleId('handleId')
        const channelId = new ChannelId(v4())
        await expect(
          instanceUnderTest.channels.leaveChannel({ handleId, channelId }),
        ).resolves.not.toThrow()
      })
    })

    describe('listJoined', () => {
      beforeEach(() => {
        when(mockListJoinedChannelsUseCase.execute(anything())).thenResolve([
          EntityDataFactory.channel,
        ])
      })
      it('generates use case', async () => {
        await instanceUnderTest.channels.listJoined(new HandleId(''))
        expect(JestMockListJoinedChannelsUseCase).toHaveBeenCalledTimes(1)
      })
      it('calls use case as expected', async () => {
        const handleId = new HandleId('handleId')
        await instanceUnderTest.channels.listJoined(handleId)
        verify(mockListJoinedChannelsUseCase.execute(anything())).once()
      })
      it('returns empty list if use case result is empty list', async () => {
        when(mockListJoinedChannelsUseCase.execute(anything())).thenResolve([])
        const handleId = new HandleId('handleId')
        await expect(
          instanceUnderTest.channels.listJoined(handleId),
        ).resolves.toEqual([])
      })
      it('returns expected result', async () => {
        const handleId = new HandleId('handleId')
        await expect(
          instanceUnderTest.channels.listJoined(handleId),
        ).resolves.toEqual([APIDataFactory.channel])
      })
    })

    describe('sendInvitations', () => {
      beforeEach(() => {
        when(
          mockSendChannelInvitationsUseCase.execute(anything()),
        ).thenResolve()
      })
      it('generates use case', async () => {
        await instanceUnderTest.channels.sendInvitations({
          handleId: new HandleId(''),
          channelId: new ChannelId(''),
          targetHandleIds: [new HandleId('')],
        })
        expect(JestMockSendChannelInvitationsUseCase).toHaveBeenCalledTimes(1)
      })
      it('calls use case as expected', async () => {
        const handleId = new HandleId('handleId')
        const channelId = new ChannelId(v4())
        const targetHandleIds = [new HandleId('targetHandleId')]
        await instanceUnderTest.channels.sendInvitations({
          handleId,
          channelId,
          targetHandleIds,
        })
        verify(mockSendChannelInvitationsUseCase.execute(anything())).once()
        const [args] = capture(
          mockSendChannelInvitationsUseCase.execute,
        ).first()
        expect(args).toEqual({ handleId, channelId, targetHandleIds })
      })
      it('completes successfully', async () => {
        const handleId = new HandleId('handleId')
        const channelId = new ChannelId(v4())
        const targetHandleIds = [new HandleId('targetHandleId')]
        await expect(
          instanceUnderTest.channels.sendInvitations({
            handleId,
            channelId,
            targetHandleIds,
          }),
        ).resolves.not.toThrow()
      })
    })

    describe('withdrawInvitation', () => {
      beforeEach(() => {
        when(
          mockWithdrawChannelInvitationUseCase.execute(anything()),
        ).thenResolve()
      })
      it('generates use case', async () => {
        await instanceUnderTest.channels.withdrawInvitation({
          handleId: new HandleId(''),
          channelId: new ChannelId(''),
          targetHandleId: new HandleId(''),
        })
        expect(JestMockWithdrawChannelInvitationUseCase).toHaveBeenCalledTimes(
          1,
        )
      })
      it('calls use case as expected', async () => {
        const handleId = new HandleId('handleId')
        const channelId = new ChannelId(v4())
        const targetHandleId = new HandleId('targetHandleId')
        await instanceUnderTest.channels.withdrawInvitation({
          handleId,
          channelId,
          targetHandleId,
        })
        verify(mockWithdrawChannelInvitationUseCase.execute(anything())).once()
        const [args] = capture(
          mockWithdrawChannelInvitationUseCase.execute,
        ).first()
        expect(args).toEqual({ handleId, channelId, targetHandleId })
      })
      it('completes successfully', async () => {
        const handleId = new HandleId('handleId')
        const channelId = new ChannelId(v4())
        const targetHandleId = new HandleId('targetHandleId')
        await expect(
          instanceUnderTest.channels.withdrawInvitation({
            handleId,
            channelId,
            targetHandleId,
          }),
        ).resolves.not.toThrow()
      })
    })

    describe('acceptInvitation', () => {
      beforeEach(() => {
        when(
          mockAcceptChannelInvitationUseCase.execute(anything()),
        ).thenResolve()
      })
      it('generates use case', async () => {
        await instanceUnderTest.channels.acceptInvitation({
          handleId: new HandleId(''),
          channelId: new ChannelId(''),
        })
        expect(JestMockAcceptChannelInvitationUseCase).toHaveBeenCalledTimes(1)
      })
      it('calls use case as expected', async () => {
        const handleId = new HandleId('handleId')
        const channelId = new ChannelId(v4())
        await instanceUnderTest.channels.acceptInvitation({
          handleId,
          channelId,
        })
        verify(mockAcceptChannelInvitationUseCase.execute(anything())).once()
        const [args] = capture(
          mockAcceptChannelInvitationUseCase.execute,
        ).first()
        expect(args).toEqual({ handleId, channelId })
      })
      it('completes successfully', async () => {
        const handleId = new HandleId('handleId')
        const channelId = new ChannelId(v4())
        await expect(
          instanceUnderTest.channels.acceptInvitation({
            handleId,
            channelId,
          }),
        ).resolves.not.toThrow()
      })
    })

    describe('declineInvitation', () => {
      beforeEach(() => {
        when(
          mockDeclineChannelInvitationUseCase.execute(anything()),
        ).thenResolve()
      })
      it('generates use case', async () => {
        await instanceUnderTest.channels.declineInvitation({
          handleId: new HandleId(''),
          channelId: new ChannelId(''),
        })
        expect(JestMockDeclineChannelInvitationUseCase).toHaveBeenCalledTimes(1)
      })
      it('calls use case as expected', async () => {
        const handleId = new HandleId('handleId')
        const channelId = new ChannelId(v4())
        await instanceUnderTest.channels.declineInvitation({
          handleId,
          channelId,
        })
        verify(mockDeclineChannelInvitationUseCase.execute(anything())).once()
        const [args] = capture(
          mockDeclineChannelInvitationUseCase.execute,
        ).first()
        expect(args).toEqual({ handleId, channelId })
      })
      it('completes successfully', async () => {
        const handleId = new HandleId('handleId')
        const channelId = new ChannelId(v4())
        await expect(
          instanceUnderTest.channels.declineInvitation({
            handleId,
            channelId,
          }),
        ).resolves.not.toThrow()
      })
    })

    describe('listInvitations', () => {
      beforeEach(() => {
        when(mockListChannelInvitationsUseCase.execute(anything())).thenResolve(
          [EntityDataFactory.channel],
        )
      })
      it('generates use case', async () => {
        await instanceUnderTest.channels.listInvitations(new HandleId(''))
        expect(JestMockListChannelInvitationsUseCase).toHaveBeenCalledTimes(1)
      })
      it('calls use case as expected', async () => {
        const handleId = new HandleId('handleId')
        await instanceUnderTest.channels.listInvitations(handleId)
        verify(mockListChannelInvitationsUseCase.execute(anything())).once()
      })
      it('returns empty list if use case result is empty list', async () => {
        when(mockListChannelInvitationsUseCase.execute(anything())).thenResolve(
          [],
        )
        const handleId = new HandleId('handleId')
        await expect(
          instanceUnderTest.channels.listInvitations(handleId),
        ).resolves.toEqual([])
      })
      it('returns expected result', async () => {
        const handleId = new HandleId('handleId')
        await expect(
          instanceUnderTest.channels.listInvitations(handleId),
        ).resolves.toEqual([APIDataFactory.channel])
      })
    })

    describe('sendInvitationRequest', () => {
      beforeEach(() => {
        when(mockSendInvitationRequestUseCase.execute(anything())).thenResolve()
        when(mockGetChannelMembershipUseCase.execute(anything())).thenResolve(
          MembershipStateEntity.REQUESTED,
        )
      })
      it('generates use case', async () => {
        await instanceUnderTest.channels.sendInvitationRequest({
          handleId: new HandleId(''),
          channelId: new ChannelId(''),
          reason: undefined,
        })
        expect(JestMockSendInvitationRequestUseCase).toHaveBeenCalledTimes(1)
      })
      it('calls use case as expected', async () => {
        const handleId = new HandleId('handleId')
        const channelId = new ChannelId(v4())
        const reason = 'some reason'
        await instanceUnderTest.channels.sendInvitationRequest({
          handleId,
          channelId,
          reason,
        })
        verify(mockSendInvitationRequestUseCase.execute(anything())).once()
        const [sendArgs] = capture(
          mockSendInvitationRequestUseCase.execute,
        ).first()
        expect(sendArgs).toEqual({ handleId, channelId, reason })
      })
      it('completes successfully', async () => {
        const handleId = new HandleId('handleId')
        const channelId = new ChannelId(v4())
        const reason = 'some reason'
        await expect(
          instanceUnderTest.channels.sendInvitationRequest({
            handleId,
            channelId,
            reason,
          }),
        ).resolves.not.toThrow()
      })
    })

    describe('withdrawInvitationRequest', () => {
      beforeEach(() => {
        when(mockLeaveChannelUseCase.execute(anything())).thenResolve()
        when(mockGetChannelMembershipUseCase.execute(anything())).thenResolve(
          MembershipStateEntity.LEFT,
        )
      })
      it('generates use case', async () => {
        await instanceUnderTest.channels.withdrawInvitationRequest({
          handleId: new HandleId(''),
          channelId: new ChannelId(''),
        })
        expect(JestMockLeaveChannelUseCase).toHaveBeenCalledTimes(1)
      })
      it('calls use case as expected', async () => {
        const handleId = new HandleId('handleId')
        const channelId = new ChannelId(v4())
        await instanceUnderTest.channels.withdrawInvitationRequest({
          handleId,
          channelId,
        })
        verify(mockLeaveChannelUseCase.execute(anything())).once()
        const [withdrawArgs] = capture(mockLeaveChannelUseCase.execute).first()
        expect(withdrawArgs).toEqual({ handleId, channelId })
      })
      it('completes successfully', async () => {
        const handleId = new HandleId('handleId')
        const channelId = new ChannelId(v4())
        await expect(
          instanceUnderTest.channels.withdrawInvitationRequest({
            handleId,
            channelId,
          }),
        ).resolves.not.toThrow()
      })
    })

    describe('acceptInvitationRequest', () => {
      beforeEach(() => {
        when(
          mockSendChannelInvitationsUseCase.execute(anything()),
        ).thenResolve()
      })
      it('generates use case', async () => {
        await instanceUnderTest.channels.acceptInvitationRequest({
          handleId: new HandleId(''),
          channelId: new ChannelId(''),
          targetHandleId: new HandleId(''),
        })
        expect(JestMockSendChannelInvitationsUseCase).toHaveBeenCalledTimes(1)
      })
      it('calls use case as expected', async () => {
        const handleId = new HandleId('handleId')
        const channelId = new ChannelId(v4())
        const targetHandleId = new HandleId('targetHandleId')
        await instanceUnderTest.channels.acceptInvitationRequest({
          handleId,
          channelId,
          targetHandleId,
        })
        verify(mockSendChannelInvitationsUseCase.execute(anything())).once()
        const [args] = capture(
          mockSendChannelInvitationsUseCase.execute,
        ).first()
        expect(args).toEqual({
          handleId,
          channelId,
          targetHandleIds: [targetHandleId],
        })
      })
      it('completes successfully', async () => {
        const handleId = new HandleId('handleId')
        const channelId = new ChannelId(v4())
        const targetHandleId = new HandleId('targetHandleId')
        await expect(
          instanceUnderTest.channels.acceptInvitationRequest({
            handleId,
            channelId,
            targetHandleId,
          }),
        ).resolves.not.toThrow()
      })
    })

    describe('declineInvitationRequest', () => {
      beforeEach(() => {
        when(mockKickChannelHandleUseCase.execute(anything())).thenResolve()
      })
      it('generates use case', async () => {
        await instanceUnderTest.channels.declineInvitationRequest({
          handleId: new HandleId(''),
          channelId: new ChannelId(''),
          targetHandleId: new HandleId(''),
          reason: undefined,
        })
        expect(JestMockKickChannelHandleUseCase).toHaveBeenCalledTimes(1)
      })
      it('calls use case as expected', async () => {
        const handleId = new HandleId('handleId')
        const channelId = new ChannelId(v4())
        const targetHandleId = new HandleId('targetHandleId')
        const reason = 'some reason'
        await instanceUnderTest.channels.declineInvitationRequest({
          handleId,
          channelId,
          targetHandleId,
          reason,
        })
        verify(mockKickChannelHandleUseCase.execute(anything())).once()
        const [args] = capture(mockKickChannelHandleUseCase.execute).first()
        expect(args).toEqual({ handleId, channelId, targetHandleId, reason })
      })
      it('completes successfully', async () => {
        const handleId = new HandleId('handleId')
        const channelId = new ChannelId(v4())
        const targetHandleId = new HandleId('targetHandleId')
        await expect(
          instanceUnderTest.channels.declineInvitationRequest({
            handleId,
            channelId,
            targetHandleId,
          }),
        ).resolves.not.toThrow()
      })
    })

    describe('listSentInvitationRequests', () => {
      beforeEach(() => {
        when(
          mockListSentInvitationRequestsUseCase.execute(anything()),
        ).thenResolve([EntityDataFactory.channel])
      })
      it('generates use case', async () => {
        await instanceUnderTest.channels.listSentInvitationRequests(
          new HandleId(''),
        )
        expect(JestMockListSentInvitationRequestsUseCase).toHaveBeenCalledTimes(
          1,
        )
      })
      it('calls use case as expected', async () => {
        const handleId = new HandleId('handleId')
        await instanceUnderTest.channels.listSentInvitationRequests(handleId)
        verify(mockListSentInvitationRequestsUseCase.execute(handleId)).once()
      })
      it('returns empty list if use case result is empty list', async () => {
        const handleId = new HandleId('handleId')
        when(
          mockListSentInvitationRequestsUseCase.execute(handleId),
        ).thenResolve([])
        await expect(
          instanceUnderTest.channels.listSentInvitationRequests(handleId),
        ).resolves.toEqual([])
      })
      it('returns expected result', async () => {
        const handleId = new HandleId('handleId')
        await expect(
          instanceUnderTest.channels.listSentInvitationRequests(handleId),
        ).resolves.toEqual([APIDataFactory.channel])
      })
    })

    describe('listReceivedInvitationRequests', () => {
      beforeEach(() => {
        when(
          mockListReceivedInvitationRequestsUseCase.execute(anything()),
        ).thenResolve([EntityDataFactory.channelInvitationRequest])
      })
      it('generates use case', async () => {
        await instanceUnderTest.channels.listReceivedInvitationRequests({
          handleId: new HandleId(''),
          channelId: new ChannelId(''),
        })
        expect(
          JestMockListReceivedInvitationRequestsUseCase,
        ).toHaveBeenCalledTimes(1)
      })
      it('calls use case as expected', async () => {
        const handleId = new HandleId('handleId')
        const channelId = new ChannelId('channelId')
        await instanceUnderTest.channels.listReceivedInvitationRequests({
          handleId,
          channelId,
        })
        verify(
          mockListReceivedInvitationRequestsUseCase.execute(anything()),
        ).once()
      })
      it('returns empty list if use case result is empty list', async () => {
        when(
          mockListReceivedInvitationRequestsUseCase.execute(anything()),
        ).thenResolve([])
        const handleId = new HandleId('handleId')
        const channelId = new ChannelId('channelId')
        await expect(
          instanceUnderTest.channels.listReceivedInvitationRequests({
            handleId,
            channelId,
          }),
        ).resolves.toEqual([])
      })
      it('returns expected result', async () => {
        const handleId = new HandleId('handleId')
        const channelId = new ChannelId('channelId')
        await expect(
          instanceUnderTest.channels.listReceivedInvitationRequests({
            handleId,
            channelId,
          }),
        ).resolves.toEqual([APIDataFactory.channelInvitationRequest])
      })
    })

    describe('getChannelMembers', () => {
      beforeEach(() => {
        when(mockGetChannelMembersUseCase.execute(anything())).thenResolve([
          EntityDataFactory.channelMember,
        ])
      })
      it('generates use case', async () => {
        await instanceUnderTest.channels.getChannelMembers({
          handleId: new HandleId(''),
          channelId: new ChannelId(''),
        })
        expect(JestMockGetChannelMembersUseCase).toHaveBeenCalledTimes(1)
      })
      it('calls use case as expected', async () => {
        const handleId = new HandleId(v4())
        const channelId = new ChannelId(v4())
        await instanceUnderTest.channels.getChannelMembers({
          handleId,
          channelId,
        })
        verify(mockGetChannelMembersUseCase.execute(anything())).once()
        const [args] = capture(mockGetChannelMembersUseCase.execute).first()
        expect(args).toEqual({ handleId, channelId })
      })
      it('returns empty list if use case result is empty list', async () => {
        const handleId = new HandleId(v4())
        const channelId = new ChannelId(v4())
        when(mockGetChannelMembersUseCase.execute(anything())).thenResolve([])
        await expect(
          instanceUnderTest.channels.getChannelMembers({ handleId, channelId }),
        ).resolves.toEqual([])
      })
      it('returns expected result', async () => {
        const handleId = new HandleId(v4())
        const channelId = new ChannelId(v4())
        await expect(
          instanceUnderTest.channels.getChannelMembers({ handleId, channelId }),
        ).resolves.toEqual([APIDataFactory.channelMember])
      })
    })

    describe('getChannelMembership', () => {
      beforeEach(() => {
        when(mockGetChannelMembershipUseCase.execute(anything())).thenResolve(
          EntityDataFactory.channelMember.membership,
        )
      })
      it('generates use case', async () => {
        await instanceUnderTest.channels.getChannelMembership({
          handleId: new HandleId(''),
          channelId: new ChannelId(''),
        })
        expect(JestMockGetChannelMembershipUseCase).toHaveBeenCalledTimes(1)
      })
      it('calls use case as expected', async () => {
        const handleId = new HandleId(v4())
        const channelId = new ChannelId(v4())
        await instanceUnderTest.channels.getChannelMembership({
          handleId,
          channelId,
        })
        verify(mockGetChannelMembershipUseCase.execute(anything())).once()
        const [args] = capture(mockGetChannelMembershipUseCase.execute).first()
        expect(args).toEqual({ handleId, channelId })
      })
      it('returns undefined if use case result is undefined', async () => {
        const handleId = new HandleId(v4())
        const channelId = new ChannelId(v4())
        when(mockGetChannelMembershipUseCase.execute(anything())).thenResolve(
          undefined,
        )
        await expect(
          instanceUnderTest.channels.getChannelMembership({
            handleId,
            channelId,
          }),
        ).resolves.toEqual(undefined)
      })
      it('returns expected result', async () => {
        const handleId = new HandleId(v4())
        const channelId = new ChannelId(v4())
        await expect(
          instanceUnderTest.channels.getChannelMembership({
            handleId,
            channelId,
          }),
        ).resolves.toEqual(APIDataFactory.channelMember.membership)
      })
    })

    describe('updateChannelMemberRole', () => {
      beforeEach(() => {
        when(
          mockUpdateChannelMemberRoleUseCase.execute(anything()),
        ).thenResolve()
      })
      it('generates use case', async () => {
        await instanceUnderTest.channels.updateChannelMemberRole({
          handleId: new HandleId(''),
          channelId: new ChannelId(''),
          targetHandleId: new HandleId(''),
          role: ChannelRole.PARTICIPANT,
        })
        expect(JestMockUpdateChannelMemberRoleUseCase).toHaveBeenCalledTimes(1)
      })
      it('calls use case as expected', async () => {
        const handleId = new HandleId('handleId')
        const channelId = new ChannelId(v4())
        const targetHandleId = new HandleId('targetHandleId')
        const role = ChannelRole.PARTICIPANT
        await instanceUnderTest.channels.updateChannelMemberRole({
          handleId,
          channelId,
          targetHandleId,
          role,
        })
        verify(mockUpdateChannelMemberRoleUseCase.execute(anything())).once()
        const [args] = capture(
          mockUpdateChannelMemberRoleUseCase.execute,
        ).first()
        expect(args).toEqual({ handleId, channelId, targetHandleId, role })
      })
      it('completes successfully', async () => {
        const handleId = new HandleId('handleId')
        const channelId = new ChannelId(v4())
        const targetHandleId = new HandleId('targetHandleId')
        const role = ChannelRole.PARTICIPANT
        await expect(
          instanceUnderTest.channels.updateChannelMemberRole({
            handleId,
            channelId,
            targetHandleId,
            role,
          }),
        ).resolves.not.toThrow()
      })
    })

    describe('kickHandle', () => {
      beforeEach(() => {
        when(mockKickChannelHandleUseCase.execute(anything())).thenResolve()
      })
      it('generates use case', async () => {
        await instanceUnderTest.channels.kickHandle({
          handleId: new HandleId(''),
          channelId: new ChannelId(''),
          targetHandleId: new HandleId(''),
          reason: '',
        })
        expect(JestMockKickChannelHandleUseCase).toHaveBeenCalledTimes(1)
      })
      it('calls use case as expected', async () => {
        const handleId = new HandleId('handleId')
        const channelId = new ChannelId(v4())
        const targetHandleId = new HandleId('targetHandleId')
        const reason = 'reason'
        await instanceUnderTest.channels.kickHandle({
          handleId,
          channelId,
          targetHandleId,
          reason,
        })
        verify(mockKickChannelHandleUseCase.execute(anything())).once()
        const [args] = capture(mockKickChannelHandleUseCase.execute).first()
        expect(args).toEqual({ handleId, channelId, targetHandleId, reason })
      })
      it('completes successfully', async () => {
        const handleId = new HandleId('handleId')
        const channelId = new ChannelId(v4())
        const targetHandleId = new HandleId('targetHandleId')
        const reason = 'reason'
        await expect(
          instanceUnderTest.channels.kickHandle({
            handleId,
            channelId,
            targetHandleId,
            reason,
          }),
        ).resolves.not.toThrow()
      })
    })

    describe('banHandle', () => {
      beforeEach(() => {
        when(mockBanChannelHandleUseCase.execute(anything())).thenResolve()
      })
      it('generates use case', async () => {
        await instanceUnderTest.channels.banHandle({
          handleId: new HandleId(''),
          channelId: new ChannelId(''),
          targetHandleId: new HandleId(''),
          reason: '',
        })
        expect(JestMockBanChannelHandleUseCase).toHaveBeenCalledTimes(1)
      })
      it('calls use case as expected', async () => {
        const handleId = new HandleId('handleId')
        const channelId = new ChannelId(v4())
        const targetHandleId = new HandleId('targetHandleId')
        const reason = 'reason'
        await instanceUnderTest.channels.banHandle({
          handleId,
          channelId,
          targetHandleId,
          reason,
        })
        verify(mockBanChannelHandleUseCase.execute(anything())).once()
        const [args] = capture(mockBanChannelHandleUseCase.execute).first()
        expect(args).toEqual({ handleId, channelId, targetHandleId, reason })
      })
      it('completes successfully', async () => {
        const handleId = new HandleId('handleId')
        const channelId = new ChannelId(v4())
        const targetHandleId = new HandleId('targetHandleId')
        const reason = 'reason'
        await expect(
          instanceUnderTest.channels.banHandle({
            handleId,
            channelId,
            targetHandleId,
            reason,
          }),
        ).resolves.not.toThrow()
      })
    })

    describe('unbanHandle', () => {
      beforeEach(() => {
        when(mockUnbanChannelHandleUseCase.execute(anything())).thenResolve()
      })
      it('generates use case', async () => {
        await instanceUnderTest.channels.unbanHandle({
          handleId: new HandleId(''),
          channelId: new ChannelId(''),
          targetHandleId: new HandleId(''),
        })
        expect(JestMockUnbanChannelHandleUseCase).toHaveBeenCalledTimes(1)
      })
      it('calls use case as expected', async () => {
        const handleId = new HandleId('handleId')
        const channelId = new ChannelId(v4())
        const targetHandleId = new HandleId('targetHandleId')
        await instanceUnderTest.channels.unbanHandle({
          handleId,
          channelId,
          targetHandleId,
        })
        verify(mockUnbanChannelHandleUseCase.execute(anything())).once()
        const [args] = capture(mockUnbanChannelHandleUseCase.execute).first()
        expect(args).toEqual({ handleId, channelId, targetHandleId })
      })
      it('completes successfully', async () => {
        const handleId = new HandleId('handleId')
        const channelId = new ChannelId(v4())
        const targetHandleId = new HandleId('targetHandleId')
        await expect(
          instanceUnderTest.channels.unbanHandle({
            handleId,
            channelId,
            targetHandleId,
          }),
        ).resolves.not.toThrow()
      })
    })
  })

  // MARK: T MessagingModule

  describe('messagingModule', () => {
    describe('getMessages', () => {
      const recipient = new HandleId(v4())
      beforeEach(() => {
        when(mockGetMessagesUseCase.execute(anything())).thenResolve({
          messages: [EntityDataFactory.message],
          nextToken: 'nextToken',
        })
      })
      it('generates use case', async () => {
        await instanceUnderTest.messaging.getMessages({
          handleId: new HandleId(''),
          recipient,
        })
        expect(JestMockGetMessagesUseCase).toHaveBeenCalledTimes(1)
      })
      it('calls use case as expected', async () => {
        const handleId = new HandleId('handleId')
        const limit = 100
        const nextToken = v4()
        await instanceUnderTest.messaging.getMessages({
          handleId,
          recipient,
          limit,
          nextToken,
        })
        verify(mockGetMessagesUseCase.execute(anything())).once()
        const [args] = capture(mockGetMessagesUseCase.execute).first()
        expect(args).toEqual({
          handleId,
          recipient,
          limit,
          nextToken,
        })
      })
      it('returns empty list if use case result is empty list', async () => {
        when(mockGetMessagesUseCase.execute(anything())).thenResolve({
          messages: [],
          nextToken: undefined,
        })
        await expect(
          instanceUnderTest.messaging.getMessages({
            handleId: new HandleId('handleId'),
            recipient,
          }),
        ).resolves.toEqual({ items: [], nextToken: undefined })
      })
      it('returns expected result', async () => {
        await expect(
          instanceUnderTest.messaging.getMessages({
            handleId: new HandleId(''),
            recipient,
          }),
        ).resolves.toEqual({
          items: [APIDataFactory.message],
          nextToken: 'nextToken',
        })
      })
    })

    describe('getMessage', () => {
      beforeEach(() => {
        when(mockGetMessageUseCase.execute(anything())).thenResolve(
          EntityDataFactory.message,
        )
      })
      it('generates use case', async () => {
        await instanceUnderTest.messaging.getMessage({
          handleId: new HandleId(''),
          recipient: new HandleId(''),
          messageId: '',
        })
        expect(JestMockGetMessageUseCase).toHaveBeenCalledTimes(1)
      })
      it('calls use case as expected', async () => {
        const handleId = new HandleId('handleId')
        const recipient = new HandleId('recipient')
        const messageId = v4()
        await instanceUnderTest.messaging.getMessage({
          handleId,
          recipient,
          messageId,
        })
        verify(mockGetMessageUseCase.execute(anything())).once()
        const [args] = capture(mockGetMessageUseCase.execute).first()
        expect(args).toEqual({ handleId, recipient, messageId })
      })
      it('returns expected result', async () => {
        await expect(
          instanceUnderTest.messaging.getMessage({
            handleId: new HandleId(''),
            recipient: new HandleId(''),
            messageId: '',
          }),
        ).resolves.toEqual(APIDataFactory.message)
      })
    })

    describe('getChatSummaries', () => {
      const recipients = [new HandleId(v4()), new HandleId(v4())]
      beforeEach(() => {
        when(mockGetChatSummariesUseCase.execute(anything())).thenResolve([
          EntityDataFactory.chatSummary,
        ])
      })
      it('generates use case', async () => {
        await instanceUnderTest.messaging.getChatSummaries({
          handleId: new HandleId(''),
          recipients,
        })
        expect(JestMockGetChatSummariesUseCase).toHaveBeenCalledTimes(1)
      })
      it('calls use case as expected', async () => {
        const handleId = new HandleId('handleId')
        await instanceUnderTest.messaging.getChatSummaries({
          handleId,
          recipients,
        })
        verify(mockGetChatSummariesUseCase.execute(anything())).once()
        const [args] = capture(mockGetChatSummariesUseCase.execute).first()
        expect(args).toEqual({
          handleId,
          recipients,
        })
      })
      it('returns empty list if use case result is empty list', async () => {
        when(mockGetChatSummariesUseCase.execute(anything())).thenResolve([])
        await expect(
          instanceUnderTest.messaging.getChatSummaries({
            handleId: new HandleId('handleId'),
            recipients,
          }),
        ).resolves.toEqual([])
      })
      it('returns expected result', async () => {
        await expect(
          instanceUnderTest.messaging.getChatSummaries({
            handleId: new HandleId(''),
            recipients,
          }),
        ).resolves.toEqual([APIDataFactory.chatSummary])
      })
    })

    describe('searchMessages', () => {
      beforeEach(() => {
        when(mockSearchMessagesUseCase.execute(anything())).thenResolve({
          messages: [EntityDataFactory.searchMessageItem],
          nextToken: 'nextToken',
        })
      })
      it('generates use case', async () => {
        await instanceUnderTest.messaging.searchMessages({
          handleId: new HandleId(''),
          searchText: 'testBody',
        })
        expect(JestMockSearchMessagesUseCase).toHaveBeenCalledTimes(1)
      })
      it('calls use case as expected', async () => {
        const handleId = new HandleId('handleId')
        const limit = 100
        const nextToken = v4()
        await instanceUnderTest.messaging.searchMessages({
          handleId,
          searchText: 'testBody',
          limit,
          nextToken,
        })
        verify(mockSearchMessagesUseCase.execute(anything())).once()
        const [args] = capture(mockSearchMessagesUseCase.execute).first()
        expect(args).toEqual({
          handleId,
          searchText: 'testBody',
          limit,
          nextToken,
        })
      })
      it('returns empty list if use case result is empty list', async () => {
        when(mockSearchMessagesUseCase.execute(anything())).thenResolve({
          messages: [],
          nextToken: undefined,
        })
        await expect(
          instanceUnderTest.messaging.searchMessages({
            handleId: new HandleId('handleId'),
            searchText: 'testBody',
          }),
        ).resolves.toEqual({ items: [], nextToken: undefined })
      })
      it('returns expected result', async () => {
        await expect(
          instanceUnderTest.messaging.searchMessages({
            handleId: new HandleId(''),
            searchText: 'testBody',
          }),
        ).resolves.toEqual({
          items: [APIDataFactory.searchMessageItem],
          nextToken: 'nextToken',
        })
      })
    })

    describe('markAsRead', () => {
      const recipient = new HandleId(v4())
      beforeEach(() => {
        when(mockMarkAsReadUseCase.execute(anything())).thenResolve()
      })
      it('generates use case', async () => {
        await instanceUnderTest.messaging.markAsRead({
          handleId: new HandleId(''),
          recipient,
        })
        expect(JestMockMarkAsReadUseCase).toHaveBeenCalledTimes(1)
      })
      it('calls use case as expected', async () => {
        const handleId = new HandleId('handleId')
        await instanceUnderTest.messaging.markAsRead({
          handleId,
          recipient,
        })
        verify(mockMarkAsReadUseCase.execute(anything())).once()
        const [args] = capture(mockMarkAsReadUseCase.execute).first()
        expect(args).toEqual({
          handleId,
          recipient,
        })
      })
      it('completes successfully', async () => {
        await expect(
          instanceUnderTest.messaging.markAsRead({
            handleId: new HandleId(''),
            recipient,
          }),
        ).resolves.not.toThrow()
      })
    })

    describe('sendTypingNotification', () => {
      const recipient = new HandleId(v4())
      const isTyping = true
      beforeEach(() => {
        when(
          mockSendTypingNotificationUseCase.execute(anything()),
        ).thenResolve()
      })
      it('generates use case', async () => {
        await instanceUnderTest.messaging.sendTypingNotification({
          handleId: new HandleId(''),
          recipient,
          isTyping,
        })
        expect(JestMockSendTypingNotificationUseCase).toHaveBeenCalledTimes(1)
      })
      it('calls use case as expected', async () => {
        const handleId = new HandleId('handleId')
        await instanceUnderTest.messaging.sendTypingNotification({
          handleId,
          recipient,
          isTyping,
        })
        verify(mockSendTypingNotificationUseCase.execute(anything())).once()
        const [args] = capture(
          mockSendTypingNotificationUseCase.execute,
        ).first()
        expect(args).toEqual({
          handleId,
          recipient,
          isTyping,
        })
      })
      it('completes successfully', async () => {
        await expect(
          instanceUnderTest.messaging.sendTypingNotification({
            handleId: new HandleId(''),
            recipient,
            isTyping,
          }),
        ).resolves.not.toThrow()
      })
    })

    describe('sendMessage', () => {
      const recipient = new HandleId(v4())
      const message = 'Sending a message'
      const threadId = 'threadId'
      const replyToMessageId = 'replyToMessageId'
      const mentions = [
        EntityDataFactory.messageHandleMention,
        EntityDataFactory.messageChatMention,
      ]
      beforeEach(() => {
        when(mockSendMessageUseCase.execute(anything())).thenResolve()
      })
      it('generates use case', async () => {
        await instanceUnderTest.messaging.sendMessage({
          handleId: new HandleId(''),
          recipient,
          message,
          mentions,
        })
        expect(JestMockSendMessageUseCase).toHaveBeenCalledTimes(1)
      })
      it('calls use case as expected', async () => {
        const handleId = new HandleId('handleId')
        await instanceUnderTest.messaging.sendMessage({
          handleId,
          recipient,
          message,
          mentions,
        })
        verify(mockSendMessageUseCase.execute(anything())).once()
        const [args] = capture(mockSendMessageUseCase.execute).first()
        expect(args).toEqual({
          handleId,
          recipient,
          message,
          mentions,
        })
      })
      it('completes successfully', async () => {
        await expect(
          instanceUnderTest.messaging.sendMessage({
            handleId: new HandleId(''),
            recipient,
            message,
            mentions,
          }),
        ).resolves.not.toThrow()
      })

      describe('sendThreadMessage', () => {
        it('generates use case', async () => {
          await instanceUnderTest.messaging.sendMessage({
            handleId: new HandleId(''),
            recipient,
            message,
            threadId,
            mentions,
          })
          expect(JestMockSendThreadMessageUseCase).toHaveBeenCalledTimes(1)
        })
        it('calls use case as expected', async () => {
          const handleId = new HandleId('handleId')
          await instanceUnderTest.messaging.sendMessage({
            handleId,
            recipient,
            message,
            threadId,
            mentions,
          })
          verify(mockSendThreadMessageUseCase.execute(anything())).once()
          const [args] = capture(mockSendThreadMessageUseCase.execute).first()
          expect(args).toEqual({
            handleId,
            recipient,
            message,
            threadId,
            mentions,
          })
        })
        it('completes successfully', async () => {
          await expect(
            instanceUnderTest.messaging.sendMessage({
              handleId: new HandleId(''),
              recipient,
              message,
              threadId,
              mentions,
            }),
          ).resolves.not.toThrow()
        })
      })

      describe('sendReplyMessage', () => {
        it('generates use case', async () => {
          await instanceUnderTest.messaging.sendMessage({
            handleId: new HandleId(''),
            recipient,
            message,
            replyToMessageId,
            mentions,
          })
          expect(JestMockSendReplyMessageUseCase).toHaveBeenCalledTimes(1)
        })
        it('calls use case as expected', async () => {
          const handleId = new HandleId('handleId')
          await instanceUnderTest.messaging.sendMessage({
            handleId,
            recipient,
            message,
            replyToMessageId,
            mentions,
          })
          verify(mockSendReplyMessageUseCase.execute(anything())).once()
          const [args] = capture(mockSendReplyMessageUseCase.execute).first()
          expect(args).toEqual({
            handleId,
            recipient,
            message,
            replyToMessageId,
            mentions,
          })
        })
        it('completes successfully', async () => {
          await expect(
            instanceUnderTest.messaging.sendMessage({
              handleId: new HandleId(''),
              recipient,
              message,
              replyToMessageId,
              mentions,
            }),
          ).resolves.not.toThrow()
        })
      })
    })

    describe('editMessage', () => {
      const recipient = new HandleId(v4())
      const messageId = 'messageId'
      const message = 'Editing a message'
      beforeEach(() => {
        when(mockEditMessageUseCase.execute(anything())).thenResolve()
      })
      it('generates use case', async () => {
        await instanceUnderTest.messaging.editMessage({
          handleId: new HandleId(''),
          recipient,
          messageId,
          message,
        })
        expect(JestMockEditMessageUseCase).toHaveBeenCalledTimes(1)
      })
      it('calls use case as expected', async () => {
        const handleId = new HandleId('handleId')
        await instanceUnderTest.messaging.editMessage({
          handleId,
          recipient,
          messageId,
          message,
        })
        verify(mockEditMessageUseCase.execute(anything())).once()
        const [args] = capture(mockEditMessageUseCase.execute).first()
        expect(args).toEqual({
          handleId,
          recipient,
          messageId,
          message,
        })
      })
      it('completes successfully', async () => {
        await expect(
          instanceUnderTest.messaging.editMessage({
            handleId: new HandleId(''),
            recipient,
            messageId,
            message,
          }),
        ).resolves.not.toThrow()
      })
    })

    describe('deleteMessage', () => {
      const recipient = new HandleId(v4())
      const messageId = 'messageId'
      beforeEach(() => {
        when(mockDeleteMessageUseCase.execute(anything())).thenResolve()
      })
      it('generates use case', async () => {
        await instanceUnderTest.messaging.deleteMessage({
          handleId: new HandleId(''),
          recipient,
          messageId,
        })
        expect(JestMockDeleteMessageUseCase).toHaveBeenCalledTimes(1)
      })
      it('calls use case as expected', async () => {
        const handleId = new HandleId('handleId')
        await instanceUnderTest.messaging.deleteMessage({
          handleId,
          recipient,
          messageId,
        })
        verify(mockDeleteMessageUseCase.execute(anything())).once()
        const [args] = capture(mockDeleteMessageUseCase.execute).first()
        expect(args).toEqual({
          handleId,
          recipient,
          messageId,
        })
      })
      it('completes successfully', async () => {
        await expect(
          instanceUnderTest.messaging.deleteMessage({
            handleId: new HandleId(''),
            recipient,
            messageId,
          }),
        ).resolves.not.toThrow()
      })
    })

    describe('sendMedia', () => {
      const recipient = new HandleId(v4())
      const file = new ArrayBuffer(100)
      const fileType = 'image/jpeg'
      const fileName = 'image.jpg'
      const fileSize = 100
      beforeEach(() => {
        when(mockSendMediaUseCase.execute(anything())).thenResolve()
      })
      it('generates use case', async () => {
        await instanceUnderTest.messaging.sendMedia({
          handleId: new HandleId(''),
          recipient,
          file,
          fileType,
          fileName,
          fileSize,
        })
        expect(JestMockSendMediaUseCase).toHaveBeenCalledTimes(1)
      })
      it('calls use case as expected', async () => {
        const handleId = new HandleId('handleId')
        await instanceUnderTest.messaging.sendMedia({
          handleId,
          recipient,
          file,
          fileType,
          fileName,
          fileSize,
        })
        verify(mockSendMediaUseCase.execute(anything())).once()
        const [args] = capture(mockSendMediaUseCase.execute).first()
        expect(args).toEqual({
          handleId,
          recipient,
          file,
          fileType,
          fileName,
          fileSize,
        })
      })
      it('completes successfully', async () => {
        await expect(
          instanceUnderTest.messaging.sendMedia({
            handleId: new HandleId(''),
            recipient,
            file,
            fileType,
            fileName,
            fileSize,
          }),
        ).resolves.not.toThrow()
      })
    })

    describe('toggleReaction', () => {
      const recipient = new HandleId(v4())
      const messageId = 'messageId'
      const content = 'reaction'
      beforeEach(() => {
        when(mockToggleReactionUseCase.execute(anything())).thenResolve()
      })
      it('generates use case', async () => {
        await instanceUnderTest.messaging.toggleReaction({
          handleId: new HandleId('handleId'),
          recipient,
          messageId,
          content,
        })
        expect(JestMockToggleReactionUseCase).toHaveBeenCalledTimes(1)
      })
      it('calls use case as expected', async () => {
        const handleId = new HandleId('handleId')
        await instanceUnderTest.messaging.toggleReaction({
          handleId,
          recipient,
          messageId,
          content,
        })
        verify(mockToggleReactionUseCase.execute(anything())).once()
        const [args] = capture(mockToggleReactionUseCase.execute).first()
        expect(args).toEqual({
          handleId,
          recipient,
          messageId,
          content,
        })
      })
      it('completes successfully', async () => {
        await expect(
          instanceUnderTest.messaging.toggleReaction({
            handleId: new HandleId('handleId'),
            recipient,
            messageId,
            content,
          }),
        ).resolves.not.toThrow()
      })
    })

    describe('pinMessage', () => {
      const recipient = new HandleId(v4())
      const messageId = 'messageId'
      beforeEach(() => {
        when(mockPinUnpinMessageUseCase.execute(anything())).thenResolve()
      })
      it('generates use case', async () => {
        await instanceUnderTest.messaging.pinMessage({
          handleId: new HandleId('handleId'),
          recipient,
          messageId,
        })
        expect(JestMockPinUnpinMessageUseCase).toHaveBeenCalledTimes(1)
      })
      it('calls use case as expected', async () => {
        const handleId = new HandleId('handleId')
        await instanceUnderTest.messaging.pinMessage({
          handleId,
          recipient,
          messageId,
        })
        verify(mockPinUnpinMessageUseCase.execute(anything())).once()
        const [args] = capture(mockPinUnpinMessageUseCase.execute).first()
        expect(args).toEqual({
          handleId,
          recipient,
          messageId,
        })
      })
      it('completes successfully', async () => {
        await expect(
          instanceUnderTest.messaging.pinMessage({
            handleId: new HandleId('handleId'),
            recipient,
            messageId,
          }),
        ).resolves.not.toThrow()
      })
    })

    describe('unpinMessage', () => {
      const recipient = new HandleId(v4())
      const messageId = 'messageId'
      beforeEach(() => {
        when(mockPinUnpinMessageUseCase.execute(anything())).thenResolve()
      })
      it('generates use case', async () => {
        await instanceUnderTest.messaging.unpinMessage({
          handleId: new HandleId('handleId'),
          recipient,
          messageId,
        })
        expect(JestMockPinUnpinMessageUseCase).toHaveBeenCalledTimes(1)
      })
      it('calls use case as expected', async () => {
        const handleId = new HandleId('handleId')
        await instanceUnderTest.messaging.unpinMessage({
          handleId,
          recipient,
          messageId,
        })
        verify(mockPinUnpinMessageUseCase.execute(anything())).once()
        const [args] = capture(mockPinUnpinMessageUseCase.execute).first()
        expect(args).toEqual({
          handleId,
          recipient,
          messageId,
        })
      })
      it('completes successfully', async () => {
        await expect(
          instanceUnderTest.messaging.unpinMessage({
            handleId: new HandleId('handleId'),
            recipient,
            messageId,
          }),
        ).resolves.not.toThrow()
      })
    })

    describe('getPinnedMessages', () => {
      const recipient = new HandleId(v4())
      beforeEach(() => {
        when(mockGetPinnedMessagesUseCase.execute(anything())).thenResolve([
          EntityDataFactory.message,
        ])
      })
      it('generates use case', async () => {
        await instanceUnderTest.messaging.getPinnedMessages({
          handleId: new HandleId(''),
          recipient,
        })
        expect(JestMockGetPinnedMessagesUseCase).toHaveBeenCalledTimes(1)
      })
      it('calls use case as expected', async () => {
        const handleId = new HandleId('handleId')
        await instanceUnderTest.messaging.getPinnedMessages({
          handleId,
          recipient,
        })
        verify(mockGetPinnedMessagesUseCase.execute(anything())).once()
        const [args] = capture(mockGetPinnedMessagesUseCase.execute).first()
        expect(args).toEqual({
          handleId,
          recipient,
        })
      })
      it('returns empty list if use case result is empty list', async () => {
        when(mockGetPinnedMessagesUseCase.execute(anything())).thenResolve([])
        await expect(
          instanceUnderTest.messaging.getPinnedMessages({
            handleId: new HandleId('handleId'),
            recipient,
          }),
        ).resolves.toEqual([])
      })
      it('returns expected result', async () => {
        await expect(
          instanceUnderTest.messaging.getPinnedMessages({
            handleId: new HandleId(''),
            recipient,
          }),
        ).resolves.toEqual([APIDataFactory.message])
      })
    })

    describe('createPoll', () => {
      const handleId = new HandleId('handleId')
      const recipient = new HandleId('recipientId')
      const question = 'What is your favorite color?'
      const answers = ['Red', 'Blue', 'Green']
      const input: CreatePollInput = {
        handleId,
        recipient,
        type: PollType.DISCLOSED,
        question,
        answers,
        maxSelections: 1,
      }
      it('generates use case', async () => {
        await instanceUnderTest.messaging.createPoll(input)
        expect(JestMockCreatePollUseCase).toHaveBeenCalledTimes(1)
      })
      it('calls use case as expected', async () => {
        await instanceUnderTest.messaging.createPoll(input)
        verify(mockCreatePollUseCase.execute(anything())).once()
        const [args] = capture(mockCreatePollUseCase.execute).first()
        expect(args).toEqual(input)
      })
      it('completes successfully', async () => {
        await expect(
          instanceUnderTest.messaging.createPoll(input),
        ).resolves.not.toThrow()
      })
    })

    describe('sendPollResponse', () => {
      const handleId = new HandleId('handleId')
      const recipient = new HandleId('recipientId')
      const pollId = 'pollId'
      const answers = ['Red', 'Blue', 'Green']
      const input: SendPollResponseInput = {
        handleId,
        recipient,
        pollId,
        answers,
      }
      it('generates use case', async () => {
        await instanceUnderTest.messaging.sendPollResponse(input)
        expect(JestMockSendPollResponseUseCase).toHaveBeenCalledTimes(1)
      })
      it('calls use case as expected', async () => {
        await instanceUnderTest.messaging.sendPollResponse(input)
        verify(mockSendPollResponseUseCase.execute(anything())).once()
        const [args] = capture(mockSendPollResponseUseCase.execute).first()
        expect(args).toEqual(input)
      })
      it('completes successfully', async () => {
        await expect(
          instanceUnderTest.messaging.sendPollResponse(input),
        ).resolves.not.toThrow()
      })
    })

    describe('editPoll', () => {
      const handleId = new HandleId('handleId')
      const recipient = new HandleId('recipientId')
      const pollId = 'pollId'
      const question = 'What is your favorite programming language?'
      const answers = ['Java', 'Typescript', 'C++']
      const input: EditPollInput = {
        handleId,
        recipient,
        pollId,
        type: PollType.DISCLOSED,
        question,
        answers,
        maxSelections: 1,
      }
      it('generates use case', async () => {
        await instanceUnderTest.messaging.editPoll(input)
        expect(JestMockEditPollUseCase).toHaveBeenCalledTimes(1)
      })
      it('calls use case as expected', async () => {
        await instanceUnderTest.messaging.editPoll(input)
        verify(mockEditPollUseCase.execute(anything())).once()
        const [args] = capture(mockEditPollUseCase.execute).first()
        expect(args).toEqual(input)
      })
      it('completes successfully', async () => {
        await expect(
          instanceUnderTest.messaging.editPoll(input),
        ).resolves.not.toThrow()
      })
    })

    describe('endPoll', () => {
      const handleId = new HandleId('handleId')
      const recipient = new HandleId('recipientId')
      const pollId = 'pollId'
      const input: EndPollInput = {
        handleId,
        recipient,
        pollId,
      }
      it('generates use case', async () => {
        await instanceUnderTest.messaging.endPoll(input)
        expect(JestMockEndPollUseCase).toHaveBeenCalledTimes(1)
      })
      it('calls use case as expected', async () => {
        await instanceUnderTest.messaging.endPoll(input)
        verify(mockEndPollUseCase.execute(anything())).once()
        const [args] = capture(mockEndPollUseCase.execute).first()
        expect(args).toEqual(input)
      })
      it('completes successfully', async () => {
        await expect(
          instanceUnderTest.messaging.endPoll(input),
        ).resolves.not.toThrow()
      })
    })

    describe('getPollResponses', () => {
      const recipient = new HandleId(v4())
      const pollId = 'testPollId'
      beforeEach(() => {
        when(mockGetPollResponsesUseCase.execute(anything())).thenResolve(
          EntityDataFactory.pollResponses,
        )
      })
      it('generates use case', async () => {
        await instanceUnderTest.messaging.getPollResponses({
          handleId: new HandleId(''),
          recipient,
          pollId,
        })
        expect(JestMockGetPollResponsesUseCase).toHaveBeenCalledTimes(1)
      })
      it('calls use case as expected', async () => {
        const handleId = new HandleId('handleId')
        await instanceUnderTest.messaging.getPollResponses({
          handleId,
          recipient,
          pollId,
        })
        verify(mockGetPollResponsesUseCase.execute(anything())).once()
        const [args] = capture(mockGetPollResponsesUseCase.execute).first()
        expect(args).toEqual({
          handleId,
          recipient,
          pollId,
        })
      })
      it('returns no tallied responses if use case result is empty', async () => {
        when(mockGetPollResponsesUseCase.execute(anything())).thenResolve({
          endedAt: undefined,
          talliedAnswers: {},
          totalVotes: 0,
        })
        await expect(
          instanceUnderTest.messaging.getPollResponses({
            handleId: new HandleId('handleId'),
            recipient,
            pollId,
          }),
        ).resolves.toEqual({
          endedAt: undefined,
          talliedAnswers: {},
          totalVotes: 0,
        })
      })
      it('returns expected result', async () => {
        await expect(
          instanceUnderTest.messaging.getPollResponses({
            handleId: new HandleId(''),
            recipient,
            pollId,
          }),
        ).resolves.toEqual(APIDataFactory.pollResponses)
      })
    })
  })

  // MARK: T MediaModule

  describe('mediaModule', () => {
    describe('downloadMediaFile', () => {
      const uri = 'mxc://matrix.org/123456'
      const mediaArrayBuffer = new ArrayBuffer(0)
      beforeEach(() => {
        when(mockDownloadMediaFileUseCase.execute(anything())).thenResolve(
          mediaArrayBuffer,
        )
      })
      it('generates use case', async () => {
        await instanceUnderTest.media.downloadMediaFile({
          handleId: new HandleId(''),
          uri,
        })
        expect(JestMockDownloadMediaFileUseCase).toHaveBeenCalledTimes(1)
      })
      it('calls use case as expected', async () => {
        const handleId = new HandleId('handleId')
        await instanceUnderTest.media.downloadMediaFile({
          handleId,
          uri,
        })
        verify(mockDownloadMediaFileUseCase.execute(anything())).once()
        const [args] = capture(mockDownloadMediaFileUseCase.execute).first()
        expect(args).toEqual({
          handleId,
          uri,
        })
      })
      it('returns expected result', async () => {
        await expect(
          instanceUnderTest.media.downloadMediaFile({
            handleId: new HandleId('handleId'),
            uri,
          }),
        ).resolves.toEqual(mediaArrayBuffer)
      })
    })
  })

  // MARK: T SecurityModule

  describe('securityModule', () => {
    describe('isVerified', () => {
      beforeEach(() => {
        when(mockIsVerifiedUseCase.execute(anything())).thenResolve(true)
      })

      it('generates use case', async () => {
        await instanceUnderTest.security.isVerified({
          handleId: new HandleId('handleId'),
        })
        expect(JestMockIsVerifiedUseCase).toHaveBeenCalledTimes(1)
      })

      it('calls use case as expected', async () => {
        await instanceUnderTest.security.isVerified({
          handleId: new HandleId('handleId'),
        })
        verify(mockIsVerifiedUseCase.execute(anything())).once()
        const [args] = capture(mockIsVerifiedUseCase.execute).first()
        expect(args).toEqual({
          handleId: new HandleId('handleId'),
        })
      })

      it('returns expected result', async () => {
        when(mockIsVerifiedUseCase.execute(anything())).thenResolve(true)
        await expect(
          instanceUnderTest.security.isVerified({
            handleId: new HandleId('handleId'),
          }),
        ).resolves.toBe(true)

        when(mockIsVerifiedUseCase.execute(anything())).thenResolve(false)
        await expect(
          instanceUnderTest.security.isVerified({
            handleId: new HandleId('handleId'),
          }),
        ).resolves.toBe(false)
      })
    })

    describe('onSessionVerificationChanged', () => {
      beforeEach(() => {
        when(
          mockOnSessionVerificationChangedUseCase.execute(anything()),
        ).thenResolve()
      })

      it('generates use case', async () => {
        await instanceUnderTest.security.onSessionVerificationChanged({
          handleId: new HandleId('handleId'),
          handler: () => {},
        })
        expect(
          JestMockOnSessionVerificationChangedUseCase,
        ).toHaveBeenCalledTimes(1)
      })

      it('calls use case as expected', async () => {
        await instanceUnderTest.security.onSessionVerificationChanged({
          handleId: new HandleId('handleId'),
          handler: () => {},
        })
        verify(
          mockOnSessionVerificationChangedUseCase.execute(anything()),
        ).once()
        const [args] = capture(
          mockOnSessionVerificationChangedUseCase.execute,
        ).first()
        expect(args).toEqual({
          handleId: new HandleId('handleId'),
          handler: expect.any(Function),
        })
      })

      it('completes successfully', async () => {
        await expect(
          instanceUnderTest.security.onSessionVerificationChanged({
            handleId: new HandleId('handleId'),
            handler: () => {},
          }),
        ).resolves.not.toThrow()
      })
    })

    describe('onVerificationRequestReceived', () => {
      beforeEach(() => {
        when(
          mockOnVerificationRequestReceivedUseCase.execute(anything()),
        ).thenResolve()
      })

      it('generates use case', async () => {
        await instanceUnderTest.security.onVerificationRequestReceived({
          handleId: new HandleId('handleId'),
          handler: () => {},
        })
        expect(
          JestMockOnVerificationRequestReceivedUseCase,
        ).toHaveBeenCalledTimes(1)
      })

      it('calls use case as expected', async () => {
        await instanceUnderTest.security.onVerificationRequestReceived({
          handleId: new HandleId('handleId'),
          handler: () => {},
        })
        verify(
          mockOnVerificationRequestReceivedUseCase.execute(anything()),
        ).once()
        const [args] = capture(
          mockOnVerificationRequestReceivedUseCase.execute,
        ).first()
        expect(args).toEqual({
          handleId: new HandleId('handleId'),
          handler: expect.any(Function),
        })
      })

      it('completes successfully', async () => {
        await expect(
          instanceUnderTest.security.onVerificationRequestReceived({
            handleId: new HandleId('handleId'),
            handler: () => {},
          }),
        ).resolves.not.toThrow()
      })
    })

    describe('acceptVerificationRequest', () => {
      beforeEach(() => {
        when(mockApproveVerificationUseCase.execute(anything())).thenResolve()
      })

      it('generates use case', async () => {
        await instanceUnderTest.security.acceptVerificationRequest({
          handleId: new HandleId('handleId'),
          senderId: new HandleId('senderId'),
          flowId: 'flowId',
        })
        expect(JestMockAcceptVerificationUseCase).toHaveBeenCalledTimes(1)
      })
      it('calls use case as expected', async () => {
        await instanceUnderTest.security.acceptVerificationRequest({
          handleId: new HandleId('handleId'),
          senderId: new HandleId('senderId'),
          flowId: 'flowId',
        })
        verify(mockAcceptVerificationUseCase.execute(anything())).once()
        const [args] = capture(mockAcceptVerificationUseCase.execute).first()
        expect(args).toEqual({
          handleId: new HandleId('handleId'),
          senderId: new HandleId('senderId'),
          flowId: 'flowId',
        })
      })
      it('completes successfully', async () => {
        await expect(
          instanceUnderTest.security.acceptVerificationRequest({
            handleId: new HandleId('handleId'),
            senderId: new HandleId('senderId'),
            flowId: 'flowId',
          }),
        ).resolves.not.toThrow()
      })
    })

    describe('approveVerification', () => {
      beforeEach(() => {
        when(mockApproveVerificationUseCase.execute(anything())).thenResolve()
      })
      it('generates use case', async () => {
        await instanceUnderTest.security.approveVerification({
          handleId: new HandleId('handleId'),
        })
        expect(JestMockApproveVerificationUseCase).toHaveBeenCalledTimes(1)
      })
      it('calls use case as expected', async () => {
        await instanceUnderTest.security.approveVerification({
          handleId: new HandleId('handleId'),
        })
        verify(mockApproveVerificationUseCase.execute(anything())).once()
        const [args] = capture(mockApproveVerificationUseCase.execute).first()
        expect(args).toEqual({
          handleId: new HandleId('handleId'),
        })
      })
      it('completes successfully', async () => {
        await expect(
          instanceUnderTest.security.approveVerification({
            handleId: new HandleId('handleId'),
          }),
        ).resolves.not.toThrow()
      })
    })

    describe('cancelVerification', () => {
      it('generates use case', async () => {
        await instanceUnderTest.security.cancelVerification({
          handleId: new HandleId('handleId'),
        })
        expect(JestMockCancelVerificationUseCase).toHaveBeenCalledTimes(1)
      })
      it('calls use case as expected', async () => {
        await instanceUnderTest.security.cancelVerification({
          handleId: new HandleId('handleId'),
        })
        verify(mockCancelVerificationUseCase.execute(anything())).once()
        const [args] = capture(mockCancelVerificationUseCase.execute).first()
        expect(args).toEqual({
          handleId: new HandleId('handleId'),
        })
      })
      it('completes successfully', async () => {
        await expect(
          instanceUnderTest.security.cancelVerification({
            handleId: new HandleId('handleId'),
          }),
        ).resolves.not.toThrow()
      })
    })

    describe('createBackup', () => {
      it('generates use case', async () => {
        await instanceUnderTest.security.createBackup({
          handleId: new HandleId('handleId'),
        })
        expect(JestMockCreateBackupUseCase).toHaveBeenCalledTimes(1)
      })
      it('calls use case as expected', async () => {
        await instanceUnderTest.security.createBackup({
          handleId: new HandleId('handleId'),
        })
        verify(mockCreateBackupUseCase.execute(anything())).once()
        const [args] = capture(mockCreateBackupUseCase.execute).first()
        expect(args).toEqual({
          handleId: new HandleId('handleId'),
        })
      })
      it('completes successfully', async () => {
        await expect(
          instanceUnderTest.security.createBackup({
            handleId: new HandleId('handleId'),
          }),
        ).resolves.not.toThrow()
      })
    })

    describe('declineVerification', () => {
      it('generates use case', async () => {
        await instanceUnderTest.security.declineVerification({
          handleId: new HandleId('handleId'),
        })
        expect(JestMockDeclineVerificationUseCase).toHaveBeenCalledTimes(1)
      })
      it('calls use case as expected', async () => {
        await instanceUnderTest.security.declineVerification({
          handleId: new HandleId('handleId'),
        })
        verify(mockDeclineVerificationUseCase.execute(anything())).once()
        const [args] = capture(mockDeclineVerificationUseCase.execute).first()
        expect(args).toEqual({
          handleId: new HandleId('handleId'),
        })
      })
      it('completes successfully', async () => {
        await expect(
          instanceUnderTest.security.declineVerification({
            handleId: new HandleId('handleId'),
          }),
        ).resolves.not.toThrow()
      })
    })

    describe('getBackupState', () => {
      it('generates use case', async () => {
        await instanceUnderTest.security.getBackupState({
          handleId: new HandleId('handleId'),
        })
        expect(JestMockGetBackupStateUseCase).toHaveBeenCalledTimes(1)
      })
      it('calls use case as expected', async () => {
        await instanceUnderTest.security.getBackupState({
          handleId: new HandleId('handleId'),
        })
        verify(mockGetBackupStateUseCase.execute(anything())).once()
        const [args] = capture(mockGetBackupStateUseCase.execute).first()
        expect(args).toEqual({
          handleId: new HandleId('handleId'),
        })
      })
      it('completes successfully', async () => {
        await expect(
          instanceUnderTest.security.getBackupState({
            handleId: new HandleId('handleId'),
          }),
        ).resolves.not.toThrow()
      })
    })

    describe('recover', () => {
      it('generates use case', async () => {
        await instanceUnderTest.security.recover({
          handleId: new HandleId('handleId'),
          backupKey: 'backupKey',
        })
        expect(JestMockRecoverUseCase).toHaveBeenCalledTimes(1)
      })
      it('calls use case as expected', async () => {
        await instanceUnderTest.security.recover({
          handleId: new HandleId('handleId'),
          backupKey: 'backupKey',
        })
        verify(mockRecoverUseCase.execute(anything())).once()
        const [args] = capture(mockRecoverUseCase.execute).first()
        expect(args).toEqual({
          handleId: new HandleId('handleId'),
          backupKey: 'backupKey',
        })
      })
      it('completes successfully', async () => {
        await expect(
          instanceUnderTest.security.recover({
            handleId: new HandleId('handleId'),
            backupKey: 'backupKey',
          }),
        ).resolves.not.toThrow()
      })
    })

    describe('requestVerification', () => {
      it('generates use case', async () => {
        await instanceUnderTest.security.requestVerification({
          handleId: new HandleId('handleId'),
        })
        expect(JestMockRequestVerificationUseCase).toHaveBeenCalledTimes(1)
      })
      it('calls use case as expected', async () => {
        await instanceUnderTest.security.requestVerification({
          handleId: new HandleId('handleId'),
        })
        verify(mockRequestVerificationUseCase.execute(anything())).once()
        const [args] = capture(mockRequestVerificationUseCase.execute).first()
        expect(args).toEqual({
          handleId: new HandleId('handleId'),
        })
      })
      it('completes successfully', async () => {
        await expect(
          instanceUnderTest.security.requestVerification({
            handleId: new HandleId('handleId'),
          }),
        ).resolves.not.toThrow()
      })
    })

    describe('rotateBackupKey', () => {
      it('generates use case', async () => {
        await instanceUnderTest.security.rotateBackupKey({
          handleId: new HandleId('handleId'),
        })
        expect(JestMockRotateBackupKeyUseCase).toHaveBeenCalledTimes(1)
      })
      it('calls use case as expected', async () => {
        await instanceUnderTest.security.rotateBackupKey({
          handleId: new HandleId('handleId'),
        })
        verify(mockRotateBackupKeyUseCase.execute(anything())).once()
        const [args] = capture(mockRotateBackupKeyUseCase.execute).first()
        expect(args).toEqual({
          handleId: new HandleId('handleId'),
        })
      })
      it('completes successfully', async () => {
        await expect(
          instanceUnderTest.security.rotateBackupKey({
            handleId: new HandleId('handleId'),
          }),
        ).resolves.not.toThrow()
      })
    })

    describe('resetBackupKey', () => {
      it('generates use case', async () => {
        await instanceUnderTest.security.resetBackupKey({
          handleId: new HandleId('handleId'),
        })
        expect(JestMockResetBackupKeyUseCase).toHaveBeenCalledTimes(1)
      })
      it('calls use case as expected', async () => {
        await instanceUnderTest.security.resetBackupKey({
          handleId: new HandleId('handleId'),
        })
        verify(mockResetBackupKeyUseCase.execute(anything())).once()
        const [args] = capture(mockResetBackupKeyUseCase.execute).first()
        expect(args).toEqual({
          handleId: new HandleId('handleId'),
        })
      })
      it('completes successfully', async () => {
        await expect(
          instanceUnderTest.security.resetBackupKey({
            handleId: new HandleId('handleId'),
          }),
        ).resolves.not.toThrow()
      })
    })

    describe('startVerification', () => {
      it('generates use case', async () => {
        await instanceUnderTest.security.startVerification({
          handleId: new HandleId('handleId'),
        })
        expect(JestMockStartVerificationUseCase).toHaveBeenCalledTimes(1)
      })
      it('calls use case as expected', async () => {
        await instanceUnderTest.security.startVerification({
          handleId: new HandleId('handleId'),
        })
        verify(mockStartVerificationUseCase.execute(anything())).once()
        const [args] = capture(mockStartVerificationUseCase.execute).first()
        expect(args).toEqual({
          handleId: new HandleId('handleId'),
        })
      })
      it('completes successfully', async () => {
        await expect(
          instanceUnderTest.security.startVerification({
            handleId: new HandleId('handleId'),
          }),
        ).resolves.not.toThrow()
      })
    })
  })

  // MARK: T NotificationsModule

  describe('notificationsModule', () => {
    describe('getDecodedInfo', () => {
      beforeEach(() => {
        when(mockGetDecodedInfoUseCase.execute(anything())).thenResolve()
      })

      const input = {
        handleId: new HandleId('handleId'),
        eventId: 'eventId',
        roomId: 'roomId',
      }
      it('generates use case', async () => {
        await instanceUnderTest.notifications.getDecodedInfo(input)
        expect(JestMockGetDecodedInfoUseCase).toHaveBeenCalledTimes(1)
      })
      it('calls use case as expected', async () => {
        await instanceUnderTest.notifications.getDecodedInfo(input)
        verify(mockGetDecodedInfoUseCase.execute(anything())).once()
        const [args] = capture(mockGetDecodedInfoUseCase.execute).first()
        expect(args).toEqual(input)
      })
      it('completes successfully', async () => {
        await expect(
          instanceUnderTest.notifications.getDecodedInfo(input),
        ).resolves.not.toThrow()
      })
    })

    describe('getSettings', () => {
      const expected = {
        defaultChatRules: {
          messageLevel: MessageNotificationLevel.allMessages,
        },
        defaultEventRules: {
          invitations: true,
        },
        recipientChatRules: {},
      }

      beforeEach(() => {
        when(mockGetSettingsUseCase.execute(anything())).thenResolve(expected)
      })

      const input = {
        handleId: new HandleId('handleId'),
      }

      it('generates use case', async () => {
        await instanceUnderTest.notifications.getSettings(input)
        expect(JestMockGetSettingsUseCase).toHaveBeenCalledTimes(1)
      })

      it('calls use case as expected', async () => {
        await instanceUnderTest.notifications.getSettings(input)
        verify(mockGetSettingsUseCase.execute(anything())).once()
      })

      it('returns expected settings', async () => {
        const settings =
          await instanceUnderTest.notifications.getSettings(input)
        expect(settings).toEqual(expected)
      })
    })

    describe('setDefaultChatRules', () => {
      const input = {
        handleId: new HandleId('handleId'),
        chatRules: {
          messageLevel: MessageNotificationLevel.mentions,
        },
      }

      beforeEach(() => {
        when(mockSetDefaultChatRulesUseCase.execute(anything())).thenResolve()
      })

      it('generates use case', async () => {
        await instanceUnderTest.notifications.setDefaultChatRules(input)
        expect(JestMockSetDefaultChatRulesUseCase).toHaveBeenCalledTimes(1)
      })

      it('calls use case as expected', async () => {
        await instanceUnderTest.notifications.setDefaultChatRules(input)
        verify(mockSetDefaultChatRulesUseCase.execute(anything())).once()
        const [args] = capture(mockSetDefaultChatRulesUseCase.execute).first()
        expect(args).toEqual(input)
      })

      it('completes successfully', async () => {
        await expect(
          instanceUnderTest.notifications.setDefaultChatRules(input),
        ).resolves.not.toThrow()
      })
    })

    describe('setDefaultEventRules', () => {
      const input = {
        handleId: new HandleId('handleId'),
        eventRules: {
          invitations: true,
        },
      }

      beforeEach(() => {
        when(mockSetDefaultEventRulesUseCase.execute(anything())).thenResolve()
      })

      it('generates use case', async () => {
        await instanceUnderTest.notifications.setDefaultEventRules(input)
        expect(JestMockSetDefaultEventRulesUseCase).toHaveBeenCalledTimes(1)
      })

      it('calls use case as expected', async () => {
        await instanceUnderTest.notifications.setDefaultEventRules(input)
        verify(mockSetDefaultEventRulesUseCase.execute(anything())).once()
        const [args] = capture(mockSetDefaultEventRulesUseCase.execute).first()
        expect(args).toEqual(input)
      })

      it('completes successfully', async () => {
        await expect(
          instanceUnderTest.notifications.setDefaultEventRules(input),
        ).resolves.not.toThrow()
      })
    })

    describe('setRecipientChatRules', () => {
      const input = {
        handleId: new HandleId('handleId'),
        recipient: new HandleId('recipientId'),
        chatRules: {
          messageLevel: MessageNotificationLevel.allMessages,
        },
      }

      beforeEach(() => {
        when(mockSetRecipientChatRulesUseCase.execute(anything())).thenResolve()
      })

      it('generates use case', async () => {
        await instanceUnderTest.notifications.setRecipientChatRules(input)
        expect(JestMockSetRecipientChatRulesUseCase).toHaveBeenCalledTimes(1)
      })

      it('calls use case as expected', async () => {
        await instanceUnderTest.notifications.setRecipientChatRules(input)
        verify(mockSetRecipientChatRulesUseCase.execute(anything())).once()
        const [args] = capture(mockSetRecipientChatRulesUseCase.execute).first()
        expect(args).toEqual(input)
      })

      it('completes successfully', async () => {
        await expect(
          instanceUnderTest.notifications.setRecipientChatRules(input),
        ).resolves.not.toThrow()
      })
    })

    describe('clearRecipientChatRules', () => {
      const input = {
        handleId: new HandleId('handleId'),
        recipient: new HandleId('recipientId'),
      }

      beforeEach(() => {
        when(
          mockClearRecipientChatRulesUseCase.execute(anything()),
        ).thenResolve()
      })

      it('generates use case', async () => {
        await instanceUnderTest.notifications.clearRecipientChatRules(input)
        expect(JestMockClearRecipientChatRulesUseCase).toHaveBeenCalledTimes(1)
      })

      it('calls use case as expected', async () => {
        await instanceUnderTest.notifications.clearRecipientChatRules(input)
        verify(mockClearRecipientChatRulesUseCase.execute(anything())).once()
        const [args] = capture(
          mockClearRecipientChatRulesUseCase.execute,
        ).first()
        expect(args).toEqual(input)
      })

      it('completes successfully', async () => {
        await expect(
          instanceUnderTest.notifications.clearRecipientChatRules(input),
        ).resolves.not.toThrow()
      })
    })
  })
})
