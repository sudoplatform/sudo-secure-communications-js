/*
 * Copyright © 2024 Anonyome Labs, Inc. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { bootstrap } from 'global-agent'
import { TextDecoder, TextEncoder } from 'util'
import waitForExpect from 'wait-for-expect'

bootstrap()

require('dotenv').config()
// Workaround for `jsdom` test environment not providing TextEncoder and
// TextDecoder.
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder as typeof global.TextDecoder
waitForExpect.defaults.interval = 500
waitForExpect.defaults.timeout = 30000

beforeAll(() => {
  // Substrings to filter out from console. These warnings are expected due to integration
  // tests frequently intializing and tearing down clients and connections.
  const filteredPatterns = [
    'SlidingSync: resetting connection info',
    "ExtensionE2EE: invalidating all device lists due to missing 'pos'",
  ]

  const shouldFilter = (args: unknown[]): boolean => {
    return args.some(
      (arg) =>
        typeof arg === 'string' &&
        filteredPatterns.some((pattern) => arg.includes(pattern)),
    )
  }

  const originalWarn = console.warn
  const originalDebug = console.debug
  jest.spyOn(console, 'warn').mockImplementation((...args: unknown[]) => {
    if (!shouldFilter(args)) {
      originalWarn(...args)
    }
  })
  jest.spyOn(console, 'debug').mockImplementation((...args: unknown[]) => {
    if (!shouldFilter(args)) {
      originalDebug(...args)
    }
  })
})

afterAll(() => {
  jest.restoreAllMocks()
})
