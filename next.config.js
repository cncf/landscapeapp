const path = require('path')
const { readFileSync } = require('fs')
const { load } = require('js-yaml')
const bundleAnalyzerPlugin = require('@next/bundle-analyzer')

const withBundleAnalyzer = bundleAnalyzerPlugin({ enabled: !!process.env.ANALYZE })

const projectPath = process.env.PROJECT_PATH

const lastUpdated = new Date().toISOString().substring(0, 19).replace('T', ' ') + 'Z'

const processedLandscape =  load(readFileSync(path.resolve(projectPath, 'processed_landscape.yml')));
const tweets = (processedLandscape.twitter_options || {}).count || 0

const GA = process.env.GA

module.exports = withBundleAnalyzer({
  env: { lastUpdated, tweets, GA },
  webpack: (config, options) => {
    // CAREFUL before adding more presets, next/babel already includes some
    // see https://nextjs.org/docs/advanced-features/customizing-babel-config

    config.externals = [
      ...config.externals,
      { moment: 'moment' }
    ]

    return config
  },
})
