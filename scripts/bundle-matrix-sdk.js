#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
// eslint-disable-next-line import/order
const esbuild = require('esbuild')

const MATRIX_SDK_DIR = path.join(
  __dirname,
  '..',
  'node_modules',
  'matrix-js-sdk',
)
const VENDOR_MATRIX_DIR = path.join(__dirname, '..', 'vendor', 'matrix-js-sdk')

const slidingSyncFile = path.join(MATRIX_SDK_DIR, 'lib', 'sliding-sync.js')
if (!fs.existsSync(slidingSyncFile)) {
  console.error('Error: matrix-js-sdk not found. Run yarn install first.')
  process.exit(1)
}

const content = fs.readFileSync(slidingSyncFile, 'utf8')
if (!content.includes('conn_id')) {
  console.error(
    'Error: Patch not applied to matrix-js-sdk. Run yarn install to apply patches.',
  )
  process.exit(1)
}

console.log('Bundling patched matrix-js-sdk...')

// Automatically discover entry points from source files
const { discoverEntryPoints } = require('./discover-matrix-entrypoints')
const entryPoints = discoverEntryPoints()
console.log(`Found ${entryPoints.length} entry points to bundle`)

// Post-process CJS files to fix import.meta.url references
function fixImportMeta(filePath) {
  let content = fs.readFileSync(filePath, 'utf8')
  let modified = false

  // Replace import.meta.url with a CJS-compatible version
  if (content.includes('import.meta.url')) {
    content = content.replace(
      /import\.meta\.url/g,
      "(typeof __filename !== 'undefined' && typeof require !== 'undefined' ? require('url').pathToFileURL(__filename).href : (typeof document !== 'undefined' ? document.currentScript?.src || '' : ''))",
    )
    modified = true
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8')
  }

  return modified
}

// Enable source maps in development, disable in production/CI
// Check multiple indicators: CI environment, NODE_ENV, or explicit flag
const isCI = process.env.CI === 'true' || process.env.CI_COMMIT_REF_NAME
const isProduction = process.env.NODE_ENV === 'production' || isCI
const enableSourceMaps =
  process.env.ENABLE_SOURCE_MAPS === 'true' ||
  (!isProduction && process.env.DISABLE_SOURCE_MAPS !== 'true')

if (enableSourceMaps) {
  console.log('Source maps enabled for matrix-js-sdk bundle')
} else {
  console.log(
    'Source maps disabled for matrix-js-sdk bundle (production/CI build)',
  )
}

const baseOptions = {
  bundle: true,
  platform: 'browser',
  target: 'es2020',
  sourcemap: enableSourceMaps,
  treeShaking: true,
  external: [
    '@matrix-org/matrix-sdk-crypto-nodejs',
    '@matrix-org/matrix-sdk-crypto-wasm',
    'matrix-encrypt-attachment',
  ],
  packages: 'bundle',
  keepNames: true,
  define: {
    'process.env.NODE_ENV': '"production"',
  },
}

async function bundleEntryPoint(entryPoint, outDir) {
  // Convert entry point path to output filename
  // e.g., "matrix-js-sdk/lib/matrix" -> "lib/matrix.js" (ESM) and "lib/matrix.cjs" (CJS)
  const relativePath = entryPoint.replace('matrix-js-sdk/', '')
  const esmPath = path.join(outDir, relativePath + '.js')
  const cjsPath = path.join(outDir, relativePath + '.cjs')
  const outputDir = path.dirname(esmPath)

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  try {
    // Bundle as ESM
    await esbuild.build({
      ...baseOptions,
      entryPoints: [entryPoint],
      format: 'esm',
      outfile: esmPath,
      allowOverwrite: true,
    })

    // Bundle as CJS
    await esbuild.build({
      ...baseOptions,
      entryPoints: [entryPoint],
      format: 'cjs',
      outfile: cjsPath,
      logLevel: 'error', // Suppress import.meta warnings
      allowOverwrite: true,
    })

    // Post-process CJS files to fix import.meta.url
    fixImportMeta(cjsPath)

    return true
  } catch (error) {
    console.error(`Failed to bundle ${entryPoint}:`, error.message)
    return false
  }
}

async function bundle() {
  try {
    // Ensure output directory exists
    if (!fs.existsSync(VENDOR_MATRIX_DIR)) {
      fs.mkdirSync(VENDOR_MATRIX_DIR, { recursive: true })
    }

    let success = true

    for (const entryPoint of entryPoints) {
      const bundled = await bundleEntryPoint(entryPoint, VENDOR_MATRIX_DIR)

      if (!bundled) {
        success = false
      } else {
        console.log(`✓ Bundled ${entryPoint}`)
      }
    }

    if (!success) {
      console.error('Failed to bundle some matrix-js-sdk modules')
      process.exit(1)
    }

    // Create package.json for proper module resolution
    // Use exports to support both ESM and CJS
    const pkgPath = path.join(VENDOR_MATRIX_DIR, 'package.json')
    const pkg = {
      type: 'module',
      main: './index.cjs', // Default to CJS for compatibility
      exports: {
        '.': {
          import: './index.js',
          require: './index.cjs',
          default: './index.js',
        },
        './*': {
          import: './*.js',
          require: './*.cjs',
          default: './*.js',
        },
      },
    }
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n')

    console.log('✓ Successfully bundled patched matrix-js-sdk')
  } catch (error) {
    console.error('Failed to bundle matrix-js-sdk:', error)
    process.exit(1)
  }
}

bundle()
