import { exec } from 'child_process'
import path from 'path'
import { watch } from 'chokidar'

const projectPath = process.env.PROJECT_PATH || path.resolve('../..')
const port = process.env.PORT || 3000;

let ready = false
let changedAt = null

const prepareLandscape = () => {
  return new Promise((resolve, reject) => {
    console.log('Preparing Landscape')
    const prepareProcess = exec('yarn prepare-landscape')
    prepareProcess.stdout.pipe(process.stdout);
    prepareProcess.stderr.pipe(process.stderr);
    prepareProcess.on('exit', code => {
      if  (code === 0) {
        console.log('Landscape Prepared Successfully!')
        resolve()
      } else {
        console.log('FAILED To Prepare Landscape!')
        resolve()
      }
    })
  })
}

const onChange = ts => {
  changedAt = ts
  setTimeout(() => {
    if (ts === changedAt) {
      prepareLandscape()
    }
  }, 100)
}

watch([`${projectPath}/*.yml`, `${projectPath}/guide.md`, `${projectPath}/cached_logos`])
  .on('all', (event, path) => {
    if (ready) {
      console.log(event, path)
      onChange(new Date())
    }
  })
  .on('ready', _ => {
    prepareLandscape()
      .then(() => {
        const nextProcess = exec(`next dev -p ${port}`);
        nextProcess.stdout.pipe(process.stdout)
        nextProcess.stderr.pipe(process.stderr)
        ready = true
      })
  })
