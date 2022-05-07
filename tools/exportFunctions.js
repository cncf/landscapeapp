// Exports next.js functions as Netlify functions
// Netlify does not allow nested directories for functions
// so if we're building the preview for landscapeapp we will prefix function names with `$landscapeName--`

import path from 'path';
import { distPath } from './settings';
import { mkdirSync, rmSync, readdirSync, writeFileSync } from 'fs'
import ncc from '@vercel/ncc'

const { PROJECT_NAME, PROJECT_PATH } = process.env

const destFolder = path.resolve(distPath, 'functions');
const srcFolder = `${process.env.PWD}/src/api`;

rmSync(destFolder, { recursive: true, force: true })
mkdirSync(destFolder, { recursive: true })

const files = readdirSync(srcFolder)

files.forEach(file => {
  const destFile = [PROJECT_NAME, file].filter(_ => _).join('--')
  console.info("Processing: file", file);
  ncc(`${srcFolder}/${file}`).then(({ code}) => {
    writeFileSync(`${destFolder}/${destFile}`, code)
  }).catch(function(ex) {
    console.info(ex);
  })
})
