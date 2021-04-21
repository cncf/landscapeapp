// Exports next.js functions as Netlify functions
// Netlify does not allow nested directories for functions
// so if we're building the preview for landscapeapp we will prefix function names with `$landscapeName-`

import { mkdirSync, rmSync, readdirSync, renameSync } from 'fs'
import { randomBytes } from 'crypto'
import { execSync } from 'child_process'
import { zipFunctions } from '@netlify/zip-it-and-ship-it'

const { PROJECT_NAME, PROJECT_PATH } = process.env

const destFolder = [PROJECT_PATH, 'dist', PROJECT_NAME, 'functions'].filter(_ => _).join('/')
const tempFolder = `tmp/${randomBytes(16).toString('hex')}`
const srcFolder = `${tempFolder}/server/pages/api`

rmSync(destFolder, { recursive: true, force: true })
mkdirSync(destFolder, { recursive: true })

mkdirSync(tempFolder, { recursive: true })
execSync(`cp -r .next/server ${tempFolder}`)

const files = readdirSync(srcFolder)

files.forEach(file => {
  const destFile = [PROJECT_NAME, file].filter(_ => _).join('-')
  renameSync(`${srcFolder}/${file}`, `${srcFolder}/${destFile}`)
})

zipFunctions(srcFolder, destFolder, { archiveFormat: 'none' })
  .finally(_ => rmSync(tempFolder, { recursive: true, force: true }))
