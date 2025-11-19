#!/usr/bin/env node

/**
 * Rewrites matrix-js-sdk imports in compiled output to point to bundled version.
 * This runs after TypeScript compilation.
 */

const fs = require('fs')
const path = require('path')

const LIB_DIR = path.join(__dirname, '..', 'lib')
const CJS_DIR = path.join(__dirname, '..', 'cjs')
const VENDOR_DIR = path.join(__dirname, '..', 'vendor')

function calculateRelativePath(fromFile, toPath) {
  const fromDir = path.dirname(fromFile)
  // Both lib and cjs are at the same level as vendor, so relative path is the same
  const matrixSdkDir = path.join(VENDOR_DIR, 'matrix-js-sdk')
  const targetPath = path.join(matrixSdkDir, toPath)
  const relative = path.relative(fromDir, targetPath)
  // Normalize path separators for imports
  return relative.replace(/\\/g, '/')
}

function rewriteImports(filePath) {
  let content = fs.readFileSync(filePath, 'utf8')
  let modified = false
  const isCJS = filePath.startsWith(CJS_DIR)

  // Match: from 'matrix-js-sdk/lib/...'
  content = content.replace(
    /from\s+['"]matrix-js-sdk\/(lib\/[^'"]+)['"]/g,
    (match, libPath) => {
      modified = true
      const relPath = calculateRelativePath(
        filePath,
        libPath + (isCJS ? '.cjs' : '.js'),
      )
      return `from '${relPath}'`
    },
  )

  // Match: from 'matrix-js-sdk'
  content = content.replace(/from\s+['"]matrix-js-sdk['"]/g, () => {
    modified = true
    const relPath = calculateRelativePath(
      filePath,
      isCJS ? 'index.cjs' : 'index.js',
    )
    return `from '${relPath}'`
  })

  // Match: require('matrix-js-sdk/lib/...')
  content = content.replace(
    /require\s*\(\s*['"]matrix-js-sdk\/(lib\/[^'"]+)['"]\s*\)/g,
    (match, libPath) => {
      modified = true
      const relPath = calculateRelativePath(filePath, libPath + '.cjs')
      return `require('${relPath}')`
    },
  )

  // Match: require('matrix-js-sdk')
  content = content.replace(
    /require\s*\(\s*['"]matrix-js-sdk['"]\s*\)/g,
    () => {
      modified = true
      const relPath = calculateRelativePath(filePath, 'index.cjs')
      return `require('${relPath}')`
    },
  )

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8')
    return true
  }

  return false
}

function findJsFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir)

  files.forEach((file) => {
    const filePath = path.join(dir, file)
    const stat = fs.statSync(filePath)

    if (stat.isDirectory()) {
      findJsFiles(filePath, fileList)
    } else if (file.endsWith('.js')) {
      fileList.push(filePath)
    }
  })

  return fileList
}

function rewriteAll() {
  console.log('Rewriting matrix-js-sdk imports...')

  const files = [...findJsFiles(LIB_DIR), ...findJsFiles(CJS_DIR)]

  let count = 0
  for (const file of files) {
    // Skip the bundled matrix-js-sdk files themselves
    if (file.includes('matrix-js-sdk')) {
      continue
    }

    if (rewriteImports(file)) {
      count++
    }
  }

  console.log(`✓ Rewrote imports in ${count} files`)
}

try {
  rewriteAll()
} catch (error) {
  console.error('Failed to rewrite imports:', error)
  process.exit(1)
}
