const path = require('path')


const env = require('@next/env')
const projectDir = process.cwd()
env.loadEnvConfig(projectDir)

// CAREFUL before adding more presets, next/babel already includes some
// see https://nextjs.org/docs/advanced-features/customizing-babel-config
module.exports = {
  ignore: [".yarn", ".pnp.js"],
  presets: ["next/babel"],
  plugins: [
    ["module-resolver", {
      alias: {
        public: path.resolve(__dirname, 'public'),
        project: process.env.PROJECT_PATH
      }
    }]
  ]
}
