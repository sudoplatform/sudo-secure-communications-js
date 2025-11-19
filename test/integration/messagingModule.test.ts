/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { DefaultLogger } from '@sudoplatform/sudo-common'
import { SudoUserClient } from '@sudoplatform/sudo-user'
import { M_POLL_START } from 'matrix-js-sdk/lib/@types/polls'
import { v4 } from 'uuid'
import { delay } from '../../src/private/util/delay'
import {
  ChannelId,
  ChannelJoinRule,
  ChannelRole,
  MembershipState,
  Message,
  MessageState,
  OwnedHandle,
  PollType,
  SecureCommsClient,
} from '../../src/public'
import { APIDataFactory } from '../data-factory/api'
import { setupSecureCommsClient } from './util/secureCommsClientLifecycle'
import {
  isHandleExpectedMembershipInChannel,
  isHandleExpectedMembershipInGroup,
} from './util/util'

describe('SecureCommsClient MessagingModule Test Suite', () => {
  jest.setTimeout(240000)
  const log = new DefaultLogger('SecureCommsClientIntegrationTests')

  let client1: SecureCommsClient
  let client2: SecureCommsClient

  let userClient1: SudoUserClient
  let userClient2: SudoUserClient
  let inviterHandle: OwnedHandle
  let inviteeHandle: OwnedHandle

  let channelIdsToCleanup: ChannelId[] = []

  beforeEach(async () => {
    const client1Setup = await setupSecureCommsClient(log)
    const client2Setup = await setupSecureCommsClient(log)
    client1 = client1Setup.secureCommsClient
    client2 = client2Setup.secureCommsClient
    userClient1 = client1Setup.userClient
    userClient2 = client2Setup.userClient
  })

  afterEach(async () => {
    if (channelIdsToCleanup.length > 0) {
      await Promise.all(
        channelIdsToCleanup.map((channelId) =>
          client1.channels
            .updateChannel({
              handleId: inviterHandle.handleId,
              channelId,
              joinRule: { value: ChannelJoinRule.PRIVATE },
            })
            .catch((err) => {
              if (err.name !== 'ChannelNotFoundError') {
                console.error(
                  { err, channelId },
                  'unable to update channel to private on cleanup',
                )
              }
            })
            .then(() =>
              client1.channels
                .deleteChannel({
                  handleId: inviterHandle.handleId,
                  channelId,
                })
                .catch((err) => {
                  if (err.name !== 'ChannelNotFoundError') {
                    console.error(
                      { err, channelId },
                      'unable to delete channel on cleanup',
                    )
                  }
                }),
            ),
        ),
      )
      channelIdsToCleanup = []
    }
    await client1.reset()
    await client2.reset()
    await userClient1.reset()
    await userClient2.reset()
  })

  describe('Send Messages in Channel', () => {
    it('send and retrieve messages between two handles in a channel successfully', async () => {
      const inviterHandleName = `test_inviter_handle_${v4()}`
      inviterHandle = await client1.handles.provisionHandle({
        name: inviterHandleName,
      })
      await client1.startSyncing(inviterHandle.handleId)

      const inviteeHandleName = `test_invitee_handle_${v4()}`
      inviteeHandle = await client2.handles.provisionHandle({
        name: inviteeHandleName,
      })
      await client2.startSyncing(inviteeHandle.handleId)

      const name = `channel-${v4()}`
      const description = 'channel-description'
      const tags = ['tag-1', 'tag-2']
      const channel = await client1.channels.createChannel({
        handleId: inviterHandle.handleId,
        name,
        description,
        joinRule: ChannelJoinRule.PUBLIC,
        tags,
        invitedHandleIds: [],
        permissions: APIDataFactory.defaultChannelPermissionsInput,
        defaultMemberRole: ChannelRole.REACT_ONLY_PARTICIPANT,
      })
      expect(channel).toBeDefined()
      channelIdsToCleanup.push(channel.channelId)

      // Inviter handle sends invitation to invitee handle
      await client1.channels.sendInvitations({
        handleId: inviterHandle.handleId,
        channelId: channel.channelId,
        targetHandleIds: [inviteeHandle.handleId],
      })

      // Check if the inviter handle is joined to the channel
      await isHandleExpectedMembershipInChannel(
        client1,
        inviterHandle.handleId,
        channel.channelId,
        inviterHandle.handleId,
        MembershipState.JOINED,
      )

      // Invitee handle accepts the invitation from the inviter handle
      await client2.channels.acceptInvitation({
        handleId: inviteeHandle.handleId,
        channelId: channel.channelId,
      })

      // Check if the invitee handle is joined to the channel
      await isHandleExpectedMembershipInChannel(
        client2,
        inviteeHandle.handleId,
        channel.channelId,
        inviteeHandle.handleId,
        MembershipState.JOINED,
      )

      // Send a message from inviter to invitee in the channel
      const message = 'This is a message from inviter to invitee in a channel'
      await client1.messaging.sendMessage({
        handleId: inviterHandle.handleId,
        recipient: channel.channelId,
        message,
        mentions: [],
      })

      // Allow some time to sync messages
      await delay(5000)

      // Retrieve messages for the inviter
      const inviterMessages: Message[] = []
      let inviterNextToken: string | undefined = undefined
      do {
        const messages = await client1.messaging.getMessages({
          handleId: inviterHandle.handleId,
          recipient: channel.channelId,
          limit: 20,
          nextToken: inviterNextToken,
        })
        inviterMessages.push(...messages.items)
        inviterNextToken = messages.nextToken
      } while (inviterNextToken)
      const inviterIdx = inviterMessages.length - 1
      expect(inviterMessages.length).toEqual(4)
      expect(
        inviterMessages[inviterIdx].senderHandle.handleId.toString(),
      ).toEqual(expect.stringContaining(inviterHandle.handleId.toString()))
      expect(inviterMessages[inviterIdx].state).toEqual(MessageState.COMMITTED)
      expect(inviterMessages[inviterIdx].isOwn).toBeTruthy()
      expect(inviterMessages[inviterIdx].content).toEqual({
        type: 'm.text',
        text: message,
        isEdited: false,
      })

      // Retrieve messages for the invitee
      const inviteeMessages: Message[] = []
      let inviteeNextToken: string | undefined = undefined
      do {
        const messages = await client2.messaging.getMessages({
          handleId: inviteeHandle.handleId,
          recipient: channel.channelId,
          nextToken: inviteeNextToken,
        })
        inviteeMessages.push(...messages.items)
        inviteeNextToken = messages.nextToken
      } while (inviteeNextToken)
      inviteeMessages.sort((a, b) => a.timestamp - b.timestamp)
      const inviteeIdx = inviteeMessages.length - 1
      expect(inviteeMessages.length).toEqual(4)
      expect(
        inviteeMessages[inviteeIdx].senderHandle.handleId.toString(),
      ).toEqual(expect.stringContaining(inviterHandle.handleId.toString()))
      expect(inviteeMessages[inviteeIdx].state).toEqual(MessageState.COMMITTED)
      expect(inviteeMessages[inviteeIdx].isOwn).toBeFalsy()
      expect(inviteeMessages[inviteeIdx].content).toEqual({
        type: 'm.text',
        text: message,
        isEdited: false,
      })
    })

    it('send and retrieve multiple messages between two handles in a channel successfully', async () => {
      const inviterHandleName = `test_inviter_handle_${v4()}`
      inviterHandle = await client1.handles.provisionHandle({
        name: inviterHandleName,
      })
      await client1.startSyncing(inviterHandle.handleId)

      const inviteeHandleName = `test_invitee_handle_${v4()}`
      inviteeHandle = await client2.handles.provisionHandle({
        name: inviteeHandleName,
      })
      await client2.startSyncing(inviteeHandle.handleId)

      const name = `channel-${v4()}`
      const description = 'channel-description'
      const tags = ['tag-1', 'tag-2']
      const channel = await client1.channels.createChannel({
        handleId: inviterHandle.handleId,
        name,
        description,
        joinRule: ChannelJoinRule.PUBLIC,
        tags,
        invitedHandleIds: [],
        permissions: APIDataFactory.defaultChannelPermissionsInput,
        defaultMemberRole: ChannelRole.PARTICIPANT,
      })
      expect(channel).toBeDefined()
      channelIdsToCleanup.push(channel.channelId)

      await delay(5000)

      // Inviter handle sends invitation to invitee handle
      await client1.channels.sendInvitations({
        handleId: inviterHandle.handleId,
        channelId: channel.channelId,
        targetHandleIds: [inviteeHandle.handleId],
      })

      // Check if the inviter handle is joined to the channel
      await isHandleExpectedMembershipInChannel(
        client1,
        inviterHandle.handleId,
        channel.channelId,
        inviterHandle.handleId,
        MembershipState.JOINED,
      )

      // Invitee handle accepts the invitation from the inviter handle
      await client2.channels.acceptInvitation({
        handleId: inviteeHandle.handleId,
        channelId: channel.channelId,
      })

      await delay(5000)

      // Check if the invitee handle is joined to the channel
      await isHandleExpectedMembershipInChannel(
        client2,
        inviteeHandle.handleId,
        channel.channelId,
        inviteeHandle.handleId,
        MembershipState.JOINED,
      )

      // Send a message from inviter to invitee in the channel
      let message = 'This is a message from inviter to invitee in a channel'
      await client1.messaging.sendMessage({
        handleId: inviterHandle.handleId,
        recipient: channel.channelId,
        message,
        mentions: [],
      })

      // Send a message from invitee to inviter in the channel
      message = 'Hey inviter, this is invitee responding to you'
      await client2.messaging.sendMessage({
        handleId: inviteeHandle.handleId,
        recipient: channel.channelId,
        message,
        mentions: [],
      })

      // Send another message from invitee to inviter in the channel
      message = 'Inviter?, this is invitee, are you there?'
      await client2.messaging.sendMessage({
        handleId: inviteeHandle.handleId,
        recipient: channel.channelId,
        message,
        mentions: [],
      })

      // Send a message from inviter to invitee in the channel
      message = 'Hey invitee, I am here!'
      await client1.messaging.sendMessage({
        handleId: inviterHandle.handleId,
        recipient: channel.channelId,
        message,
        mentions: [],
      })

      // Send another message from inviter to invitee in the channel
      message = 'Invitee? I am trying to respond to you.'
      await client1.messaging.sendMessage({
        handleId: inviterHandle.handleId,
        recipient: channel.channelId,
        message,
        mentions: [],
      })

      // Send final message from invitee to inviter in the channel
      message = 'Yes! Responding to you now inviter.'
      await client2.messaging.sendMessage({
        handleId: inviteeHandle.handleId,
        recipient: channel.channelId,
        message,
        mentions: [],
      })

      // Allow some time to sync messages
      await delay(5000)

      // Retrieve messages for the inviter
      const inviterMessages: Message[] = []
      let inviterNextToken: string | undefined = undefined
      do {
        const messages = await client1.messaging.getMessages({
          handleId: inviterHandle.handleId,
          recipient: channel.channelId,
          limit: 20,
          nextToken: inviterNextToken,
        })
        inviterMessages.push(...messages.items)
        inviterNextToken = messages.nextToken
      } while (inviterNextToken)
      // Includes messages sent and membership state change messages
      const inviterTextMsgs = inviterMessages.filter(
        (item) => item.content.type === 'm.text',
      )
      expect(inviterTextMsgs.length).toEqual(6)
      expect(
        inviterMessages.every((item, index, arr) => {
          if (index === 0) return true
          return item.timestamp >= arr[index - 1].timestamp
        }),
      ).toBe(true)

      // Retrieve messages for the invitee
      const inviteeMessages: Message[] = []
      let inviteeNextToken: string | undefined = undefined
      do {
        const messages = await client2.messaging.getMessages({
          handleId: inviteeHandle.handleId,
          recipient: channel.channelId,
          limit: 20,
          nextToken: inviteeNextToken,
        })
        inviteeMessages.push(...messages.items)
        inviteeNextToken = messages.nextToken
      } while (inviteeNextToken)
      // Includes messages sent and membership state change messages
      const inviteeTextMsgs = inviteeMessages.filter(
        (item) => item.content.type === 'm.text',
      )
      expect(inviteeTextMsgs.length).toEqual(6)
      expect(
        inviteeMessages.every((item, index, arr) => {
          if (index === 0) return true
          return item.timestamp >= arr[index - 1].timestamp
        }),
      ).toBe(true)

      // Search messages based on the search term 'invitee'
      let searchResult = await client1.messaging.searchMessages({
        handleId: inviterHandle.handleId,
        searchText: 'invitee',
      })
      expect(searchResult.items.length).toEqual(5)
    })

    describe('pinMessage, unpinMessage and getPinnedMessages', () => {
      it('pin and unpin message in a channel successfully', async () => {
        const inviterHandleName = `test_inviter_handle_${v4()}`
        inviterHandle = await client1.handles.provisionHandle({
          name: inviterHandleName,
        })
        await client1.startSyncing(inviterHandle.handleId)

        const inviteeHandleName = `test_invitee_handle_${v4()}`
        inviteeHandle = await client2.handles.provisionHandle({
          name: inviteeHandleName,
        })
        await client2.startSyncing(inviteeHandle.handleId)

        const name = `channel-${v4()}`
        const description = 'channel-description'
        const tags = ['tag-1', 'tag-2']
        const channel = await client1.channels.createChannel({
          handleId: inviterHandle.handleId,
          name,
          description,
          joinRule: ChannelJoinRule.PUBLIC,
          tags,
          invitedHandleIds: [],
          permissions: APIDataFactory.defaultChannelPermissionsInput,
          defaultMemberRole: ChannelRole.PARTICIPANT,
        })
        expect(channel).toBeDefined()
        channelIdsToCleanup.push(channel.channelId)

        await delay(5000)

        // Inviter handle sends invitation to invitee handle
        await client1.channels.sendInvitations({
          handleId: inviterHandle.handleId,
          channelId: channel.channelId,
          targetHandleIds: [inviteeHandle.handleId],
        })

        // Check if the inviter handle is joined to the channel
        await isHandleExpectedMembershipInChannel(
          client1,
          inviterHandle.handleId,
          channel.channelId,
          inviterHandle.handleId,
          MembershipState.JOINED,
        )

        // Invitee handle accepts the invitation from the inviter handle
        await client2.channels.acceptInvitation({
          handleId: inviteeHandle.handleId,
          channelId: channel.channelId,
        })

        await delay(5000)

        // Check if the invitee handle is joined to the channel
        await isHandleExpectedMembershipInChannel(
          client2,
          inviteeHandle.handleId,
          channel.channelId,
          inviteeHandle.handleId,
          MembershipState.JOINED,
        )

        // Send a message from inviter to invitee in the channel
        let message = 'This is a message from inviter to invitee in a channel'
        await client1.messaging.sendMessage({
          handleId: inviterHandle.handleId,
          recipient: channel.channelId,
          message,
          mentions: [],
        })

        // Send a message from invitee to inviter in the channel
        message = 'Hey inviter, this is invitee responding to you'
        await client2.messaging.sendMessage({
          handleId: inviteeHandle.handleId,
          recipient: channel.channelId,
          message,
          mentions: [],
        })

        // Allow some time to sync messages
        await delay(5000)

        // Retrieve messages for the inviter
        const inviterMessages = await client1.messaging.getMessages({
          handleId: inviterHandle.handleId,
          recipient: channel.channelId,
        })
        // Includes messages sent and membership state change messages
        const inviterTextMsgs = inviterMessages.items.filter(
          (item) => item.content.type === 'm.text',
        )
        expect(inviterTextMsgs.length).toEqual(2)

        // Pin inviter's message
        await client1.messaging.pinMessage({
          handleId: inviterHandle.handleId,
          recipient: channel.channelId,
          messageId: inviterTextMsgs[0].messageId,
        })

        // Check if list of pinned messages contains inviter's message
        let pinnedMessages = await client1.messaging.getPinnedMessages({
          handleId: inviterHandle.handleId,
          recipient: channel.channelId,
        })
        expect(pinnedMessages.length).toEqual(1)
        expect(
          pinnedMessages.some(
            (message) => message.messageId === inviterTextMsgs[0].messageId,
          ),
        ).toBe(true)

        // Pin invitee's message
        await client1.messaging.pinMessage({
          handleId: inviterHandle.handleId,
          recipient: channel.channelId,
          messageId: inviterTextMsgs[1].messageId,
        })

        // Check if list of pinned messages contains both messages
        pinnedMessages = await client1.messaging.getPinnedMessages({
          handleId: inviterHandle.handleId,
          recipient: channel.channelId,
        })
        expect(pinnedMessages.length).toEqual(2)
        expect(
          [inviterTextMsgs[0].messageId, inviterTextMsgs[1].messageId].every(
            (id) => pinnedMessages.some((message) => message.messageId === id),
          ),
        ).toBe(true)

        // Unpin invitee's message
        await client1.messaging.unpinMessage({
          handleId: inviterHandle.handleId,
          recipient: channel.channelId,
          messageId: inviterTextMsgs[1].messageId,
        })

        // Check if invitee's message has been unpinned and inviter's message is still pinned
        pinnedMessages = await client1.messaging.getPinnedMessages({
          handleId: inviterHandle.handleId,
          recipient: channel.channelId,
        })
        expect(pinnedMessages.length).toEqual(1)
        expect(
          pinnedMessages.some(
            (message) => message.messageId === inviterTextMsgs[0].messageId,
          ),
        ).toBe(true)
      })
    })

    describe('createPoll, sendPollResponse, editPoll, endPoll and getPollResponses', () => {
      it('create poll, submit and tally answers in a channel successfully', async () => {
        const inviterHandleName = `test_inviter_handle_${v4()}`
        inviterHandle = await client1.handles.provisionHandle({
          name: inviterHandleName,
        })
        await client1.startSyncing(inviterHandle.handleId)

        const inviteeHandleName = `test_invitee_handle_${v4()}`
        inviteeHandle = await client2.handles.provisionHandle({
          name: inviteeHandleName,
        })
        await client2.startSyncing(inviteeHandle.handleId)

        const name = `channel-${v4()}`
        const description = 'channel-description'
        const tags = ['tag-1', 'tag-2']
        const channel = await client1.channels.createChannel({
          handleId: inviterHandle.handleId,
          name,
          description,
          joinRule: ChannelJoinRule.PUBLIC,
          tags,
          invitedHandleIds: [],
          permissions: APIDataFactory.defaultChannelPermissionsInput,
          defaultMemberRole: ChannelRole.PARTICIPANT,
        })
        expect(channel).toBeDefined()
        channelIdsToCleanup.push(channel.channelId)

        await delay(5000)

        // Inviter handle sends invitation to invitee handle
        await client1.channels.sendInvitations({
          handleId: inviterHandle.handleId,
          channelId: channel.channelId,
          targetHandleIds: [inviteeHandle.handleId],
        })

        // Check if the inviter handle is joined to the channel
        await isHandleExpectedMembershipInChannel(
          client1,
          inviterHandle.handleId,
          channel.channelId,
          inviterHandle.handleId,
          MembershipState.JOINED,
        )

        // Invitee handle accepts the invitation from the inviter handle
        await client2.channels.acceptInvitation({
          handleId: inviteeHandle.handleId,
          channelId: channel.channelId,
        })

        await delay(5000)

        // Check if the invitee handle is joined to the channel
        await isHandleExpectedMembershipInChannel(
          client2,
          inviteeHandle.handleId,
          channel.channelId,
          inviteeHandle.handleId,
          MembershipState.JOINED,
        )

        // Inviter creates a poll in a channel
        await client1.messaging.createPoll({
          handleId: inviterHandle.handleId,
          recipient: channel.channelId,
          type: PollType.DISCLOSED,
          question: 'What is your favorite programming language?',
          answers: ['TypeScript', 'Python', 'Java', 'C++'],
          maxSelections: 1,
        })

        const pollMessage = (
          await client1.messaging.getMessages({
            handleId: inviterHandle.handleId,
            recipient: channel.channelId,
          })
        ).items.find((msg) => msg.content.type === M_POLL_START.name)
        expect(pollMessage).toBeDefined()

        // Inviter submits a response to the poll
        await client1.messaging.sendPollResponse({
          handleId: inviterHandle.handleId,
          recipient: channel.channelId,
          pollId: pollMessage?.messageId ?? '',
          answers: ['TypeScript'],
        })

        // Invitee submits a response to the poll
        await client2.messaging.sendPollResponse({
          handleId: inviteeHandle.handleId,
          recipient: channel.channelId,
          pollId: pollMessage?.messageId ?? '',
          answers: ['Java'],
        })

        // Allow some time to sync submissions
        await delay(5000)

        // Inviter ends the poll
        await client1.messaging.endPoll({
          handleId: inviterHandle.handleId,
          recipient: channel.channelId,
          pollId: pollMessage?.messageId ?? '',
        })

        // Inviter tallies up the poll responses
        const pollResponses = await client1.messaging.getPollResponses({
          handleId: inviterHandle.handleId,
          recipient: channel.channelId,
          pollId: pollMessage?.messageId ?? '',
        })
        expect(pollResponses).toEqual({
          talliedAnswers: { TypeScript: 1, Java: 1 },
          totalVotes: 2,
          endedAt: expect.any(Number),
        })
      })

      it('update existing poll, submit and tally answers in a channel successfully', async () => {
        const inviterHandleName = `test_inviter_handle_${v4()}`
        inviterHandle = await client1.handles.provisionHandle({
          name: inviterHandleName,
        })
        await client1.startSyncing(inviterHandle.handleId)

        const inviteeHandleName = `test_invitee_handle_${v4()}`
        inviteeHandle = await client2.handles.provisionHandle({
          name: inviteeHandleName,
        })
        await client2.startSyncing(inviteeHandle.handleId)

        const name = `channel-${v4()}`
        const description = 'channel-description'
        const tags = ['tag-1', 'tag-2']
        const channel = await client1.channels.createChannel({
          handleId: inviterHandle.handleId,
          name,
          description,
          joinRule: ChannelJoinRule.PUBLIC,
          tags,
          invitedHandleIds: [],
          permissions: APIDataFactory.defaultChannelPermissionsInput,
          defaultMemberRole: ChannelRole.PARTICIPANT,
        })
        expect(channel).toBeDefined()
        channelIdsToCleanup.push(channel.channelId)

        await delay(5000)

        // Inviter handle sends invitation to invitee handle
        await client1.channels.sendInvitations({
          handleId: inviterHandle.handleId,
          channelId: channel.channelId,
          targetHandleIds: [inviteeHandle.handleId],
        })

        // Check if the inviter handle is joined to the channel
        await isHandleExpectedMembershipInChannel(
          client1,
          inviterHandle.handleId,
          channel.channelId,
          inviterHandle.handleId,
          MembershipState.JOINED,
        )

        // Invitee handle accepts the invitation from the inviter handle
        await client2.channels.acceptInvitation({
          handleId: inviteeHandle.handleId,
          channelId: channel.channelId,
        })

        await delay(5000)

        // Check if the invitee handle is joined to the channel
        await isHandleExpectedMembershipInChannel(
          client2,
          inviteeHandle.handleId,
          channel.channelId,
          inviteeHandle.handleId,
          MembershipState.JOINED,
        )

        // Inviter creates a poll in a channel
        await client1.messaging.createPoll({
          handleId: inviterHandle.handleId,
          recipient: channel.channelId,
          type: PollType.DISCLOSED,
          question: 'What is your favorite programming language?',
          answers: ['TypeScript', 'Python', 'Java', 'C++'],
          maxSelections: 1,
        })

        const pollMessage = (
          await client1.messaging.getMessages({
            handleId: inviterHandle.handleId,
            recipient: channel.channelId,
          })
        ).items.find((msg) => msg.content.type === M_POLL_START.name)
        expect(pollMessage).toBeDefined()

        // Inviter edits the existing poll in the channel
        await client1.messaging.editPoll({
          handleId: inviterHandle.handleId,
          recipient: channel.channelId,
          pollId: pollMessage?.messageId ?? '',
          type: PollType.DISCLOSED,
          question: 'What is your favorite sport?',
          answers: ['Football', 'Basketball', 'Tennis', 'Hockey'],
          maxSelections: 2,
        })
        const editedPollMessage = (
          await client1.messaging.getMessages({
            handleId: inviterHandle.handleId,
            recipient: channel.channelId,
          })
        ).items
          .slice()
          .reverse()
          .find((msg) => msg.content.type === M_POLL_START.name)
        expect(editedPollMessage).toBeDefined()

        // Inviter submits a response to the poll
        await client1.messaging.sendPollResponse({
          handleId: inviterHandle.handleId,
          recipient: channel.channelId,
          pollId: editedPollMessage?.messageId ?? '',
          answers: ['Football', 'Tennis'],
        })

        // Invitee submits a response to the poll
        await client2.messaging.sendPollResponse({
          handleId: inviteeHandle.handleId,
          recipient: channel.channelId,
          pollId: editedPollMessage?.messageId ?? '',
          answers: ['Football'],
        })

        // Allow some time to sync submissions
        await delay(5000)

        // Inviter tallies up the poll responses
        const pollResponses = await client1.messaging.getPollResponses({
          handleId: inviterHandle.handleId,
          recipient: channel.channelId,
          pollId: editedPollMessage?.messageId ?? '',
        })
        expect(pollResponses).toEqual({
          talliedAnswers: { Football: 2, Tennis: 1 },
          totalVotes: 3,
          endedAt: undefined,
        })

        // Inviter ends the poll
        await client1.messaging.endPoll({
          handleId: inviterHandle.handleId,
          recipient: channel.channelId,
          pollId: editedPollMessage?.messageId ?? '',
        })
      })
    })
  })

  // TODO: Renable once the StorageModule is implemented with rust crypto initialization
  describe.skip('Send Messages in Group', () => {
    it('send and retrieve messages between two handles in a group successfully', async () => {
      const inviterHandleName = `test_inviter_handle_${v4()}`
      inviterHandle = await client1.handles.provisionHandle({
        name: inviterHandleName,
      })
      await client1.startSyncing(inviterHandle.handleId)

      const inviteeHandleName = `test_invitee_handle_${v4()}`
      inviteeHandle = await client2.handles.provisionHandle({
        name: inviteeHandleName,
      })
      await client2.startSyncing(inviteeHandle.handleId)

      const name = `group-${v4()}`
      const description = 'group-description'
      const group = await client1.groups.createGroup({
        handleId: inviterHandle.handleId,
        name,
        description,
        avatar: undefined,
        invitedHandleIds: [],
      })
      expect(group).toBeDefined()

      // Inviter handle sends invitation to invitee handle
      await client1.groups.sendInvitations({
        handleId: inviterHandle.handleId,
        groupId: group.groupId,
        targetHandleIds: [inviteeHandle.handleId],
      })

      // Check if the inviter handle is joined to the group
      await isHandleExpectedMembershipInGroup(
        client1,
        inviterHandle.handleId,
        group.groupId,
        inviterHandle.handleId,
        MembershipState.JOINED,
      )

      // Invitee handle accepts the invitation from the inviter handle
      await client2.groups.acceptInvitation({
        handleId: inviteeHandle.handleId,
        groupId: group.groupId,
      })

      // Check if the invitee handle is joined to the group
      await isHandleExpectedMembershipInGroup(
        client2,
        inviteeHandle.handleId,
        group.groupId,
        inviteeHandle.handleId,
        MembershipState.JOINED,
      )

      // Send a message from inviter to invitee in the group
      let message = 'This is a message from inviter to invitee in a group'
      await client1.messaging.sendMessage({
        handleId: inviterHandle.handleId,
        recipient: group.groupId,
        message,
        mentions: [],
      })

      // Send a message from invitee to inviter in the group
      message = 'Hey inviter, this is invitee responding to you'
      await client2.messaging.sendMessage({
        handleId: inviteeHandle.handleId,
        recipient: group.groupId,
        message,
        mentions: [],
      })

      // Send another message from invitee to inviter in the group
      message = 'Inviter?, this is invitee, are you there?'
      await client2.messaging.sendMessage({
        handleId: inviteeHandle.handleId,
        recipient: group.groupId,
        message,
        mentions: [],
      })

      // Send a message from inviter to invitee in the group
      message = 'Hey invitee, I am here!'
      await client1.messaging.sendMessage({
        handleId: inviterHandle.handleId,
        recipient: group.groupId,
        message,
        mentions: [],
      })

      // Allow some time to sync messages
      await delay(5000)

      // Retrieve messages for the inviter
      const inviterMessages = await client1.messaging.getMessages({
        handleId: inviterHandle.handleId,
        recipient: group.groupId,
      })
      expect(inviterMessages.items.length).toEqual(4)
      expect(
        inviterMessages.items.every((item, index, arr) => {
          if (index === 0) return true
          return item.timestamp <= arr[index - 1].timestamp
        }),
      ).toBe(true)

      // Retrieve messages for the invitee
      let inviteeMessages = await client2.messaging.getMessages({
        handleId: inviteeHandle.handleId,
        recipient: group.groupId,
      })
      expect(inviteeMessages.items.length).toEqual(4)
      expect(
        inviteeMessages.items.every((item, index, arr) => {
          if (index === 0) return true
          return item.timestamp <= arr[index - 1].timestamp
        }),
      ).toBe(true)
    })
  })
})
