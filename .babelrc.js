const path = require('path')

module.exports = {
  ignore: [".yarn", ".pnp.js"],
  presets: [
    "next/babel",
    ["babel-preset-latest-node", { target: "current" }],
    ["@babel/preset-env", { modules: false }]
  ],
  plugins: [
    ["module-resolver", {
      alias: {
        "project/settings.yml": path.resolve(__dirname, 'public/settings.json'),
        "project/lookup.json": `${process.env.PROJECT_PATH}/lookup.json`
      }
    }]
  ]
}
