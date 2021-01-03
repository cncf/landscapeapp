const path = require('path')

// CAREFUL before adding more presets, next/babel already includes some
// see https://nextjs.org/docs/advanced-features/customizing-babel-config
module.exports = {
  ignore: [".yarn", ".pnp.js"],
  presets: ["next/babel"],
  plugins: [
    ["module-resolver", {
      alias: {
        "project/settings.yml": path.resolve(__dirname, 'public/settings.json'),
        "project/lookup.json": `${process.env.PROJECT_PATH}/lookup.json`
      }
    }]
  ]
}
