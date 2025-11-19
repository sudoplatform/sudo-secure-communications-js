#!/usr/bin/env node

/**
 * Automatically discovers all matrix-js-sdk entry points by scanning source files.
 * This ensures we bundle all modules that are actually imported.
 */

const fs = require('fs')
const path = require('path')

const SRC_DIR = path.join(__dirname, '..', 'src')

function findTsFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir)

  files.forEach((file) => {
    const filePath = path.join(dir, file)
    const stat = fs.statSync(filePath)

    if (stat.isDirectory()) {
      findTsFiles(filePath, fileList)
    } else if (file.endsWith('.ts')) {
      fileList.push(filePath)
    }
  })

  return fileList
}

function discoverEntryPoints() {
  const files = findTsFiles(SRC_DIR)
  // eslint-disable-next-line no-undef
  const entryPoints = new Set()

  // Patterns to match matrix-js-sdk imports
  const importPatterns = [
    // Match: from 'matrix-js-sdk' or from "matrix-js-sdk"
    /from\s+['"]matrix-js-sdk['"]/g,
    // Match: from 'matrix-js-sdk/lib/...' or from "matrix-js-sdk/lib/..."
    /from\s+['"]matrix-js-sdk\/([^'"]+)['"]/g,
    // Match: require('matrix-js-sdk') or require("matrix-js-sdk")
    /require\s*\(\s*['"]matrix-js-sdk['"]\s*\)/g,
    // Match: require('matrix-js-sdk/lib/...') or require("matrix-js-sdk/lib/...")
    /require\s*\(\s*['"]matrix-js-sdk\/([^'"]+)['"]\s*\)/g,
  ]

  files.forEach((file) => {
    const content = fs.readFileSync(file, 'utf8')

    // Check for root import
    if (importPatterns[0].test(content) || importPatterns[2].test(content)) {
      entryPoints.add('matrix-js-sdk')
    }

    // Check for sub-path imports
    const subPathMatches = [
      ...content.matchAll(importPatterns[1]),
      ...content.matchAll(importPatterns[3]),
    ]

    subPathMatches.forEach((match) => {
      if (match[1]) {
        // Remove .js/.ts extension if present, and normalize path
        const importPath = match[1].replace(/\.(js|ts)$/, '')
        entryPoints.add(`matrix-js-sdk/${importPath}`)
      }
    })
  })

  // Sort for consistent output
  return Array.from(entryPoints).sort()
}

if (require.main === module) {
  const entryPoints = discoverEntryPoints()
  console.log('Discovered matrix-js-sdk entry points:')
  entryPoints.forEach((ep) => console.log(`  - ${ep}`))
  console.log(`\nTotal: ${entryPoints.length} entry points`)
}

module.exports = { discoverEntryPoints }
