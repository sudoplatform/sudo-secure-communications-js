/*
 * Copyright © 2025 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Core entity representation of tallied poll responses for a given poll.
 *
 * @interface PollResponsesEntity
 * @property {Record<string, number>} talliedAnswers A record of all submitted answers and their corresponding
 *  number of votes.
 * @property {number} totalVotes The total number of votes for the poll.
 * @property {number} endedAt The timestamp in which the poll ended. Will be `undefined` if the poll is still active.
 */
export interface PollResponsesEntity {
  talliedAnswers: Record<string, number>
  totalVotes: number
  endedAt?: number
}

/**
 * The type of poll. Determines whether or not the poll participants can see the poll results.
 *
 * @property DISCLOSED: A poll where participants can see the poll results.
 * @property UNDISCLOSED: A poll where participants cannot see the poll results.
 *
 * @enum
 */
export enum PollTypeEntity {
  DISCLOSED = 'DISCLOSED',
  UNDISCLOSED = 'UNDISCLOSED',
}
