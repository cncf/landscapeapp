const path = require('path')
module.exports = {
  ignore: [".yarn", ".pnp.js"],
  presets: ['@babel/preset-env'],
  plugins: [
    ["@babel/plugin-transform-react-jsx", {
      "runtime": "automatic"
    }],
    ["module-resolver", {
      alias: {
        project: process.env.PROJECT_PATH
      }
    }]
  ]
}
