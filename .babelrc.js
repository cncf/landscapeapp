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
        public: path.resolve(__dirname, 'public'),
        project: process.env.PROJECT_PATH
      }
    }]
  ]
}
