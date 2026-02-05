#!/usr/bin/env node

/**
 * Injects SUDO_PLATFORM_SCS_SDK_VERSION at build time.
 * - In GitLab CI: uses CI_COMMIT_TAG (with leading 'v' stripped) or CI_COMMIT_SHORT_SHA
 * - Locally: uses 'development'
 * Writes src/gen/sdkVersion.ts so the rest of the build can import the version.
 */

const fs = require('fs')
const path = require('path')

const isCI = process.env.CI === 'true'
const tag = process.env.CI_COMMIT_TAG
const shortSha = process.env.CI_COMMIT_SHORT_SHA

let version
if (isCI) {
  if (tag && tag.length > 0) {
    version = tag.replace(/^v/, '')
  } else if (shortSha && shortSha.length > 0) {
    version = shortSha
  } else {
    version = 'development'
  }
} else {
  version = 'development'
}

const genDir = path.join(__dirname, '..', 'src', 'gen')
const outPath = path.join(genDir, 'sdkVersion.ts')
const content = `// Generated at build time by scripts/inject-sdk-version.js. Do not edit.

export const SUDO_PLATFORM_SCS_SDK_VERSION: string = '${version}'
`

if (!fs.existsSync(genDir)) {
  fs.mkdirSync(genDir, { recursive: true })
}
fs.writeFileSync(outPath, content, 'utf8')
