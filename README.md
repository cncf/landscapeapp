# Landscapeapp

[![CII Best Practices](https://bestpractices.coreinfrastructure.org/projects/2434/badge)](https://bestpractices.coreinfrastructure.org/projects/2434) [![npm version](https://img.shields.io/npm/v/interactive-landscape.svg)](https://www.npmjs.com/package/interactive-landscape) [![Dependency Status](https://img.shields.io/david/cncf/landscapeapp.svg?style=flat-square)](https://david-dm.org/cncf/landscapeapp) [![Netlify Status](https://api.netlify.com/api/v1/badges/50d760a8-5b21-4319-aa01-2ad54e453fd6/deploy-status)](https://app.netlify.com/sites/landscapeapp/deploys)

The landscapeapp is an upstream NPM [module](https://www.npmjs.com/package/interactive-landscape) that supports building interactive landscape websites such as the [CNCF Cloud Native Landscape](https://landscape.cncf.io) ([source](https://github.com/cncf/landscape)) and the [LF Deep Learning Foundation Landscape](https://landscape.lfdl.io) ([source](https://github.com/LFDLFoundation/lfdl-landscape)). The application has been developed by [Andrey Kozlov](https://github.com/ZeusTheTrueGod) and [Dan Kohn](https://www.dankohn.com) of [CNCF](https://www.cncf.io).

If you want to create an interactive landscape for your project or organization, the easiest process is to fork the [LFDL landscape](https://github.com/LFDLFoundation/lfdl-landscape), since it only has a single landscape image. Edit `settings.yml`, `landscape.yml`, and `members.yml` for your topic. Then create a Netlify account (or similar) to automatically build and publish the static site on every commit.

In addition to creating fully interactive sites, the landscapeapp builds static images on each update:

## Cloud Native Landscape

[![Cloud Native Landscape](https://landscape.cncf.io/images/landscape.png)](https://landscape.cncf.io/images/landscape.png)

## Serverless Landscape

[![CNCF Serverless Landscape](https://landscape.cncf.io/images/serverless.png)](https://landscape.cncf.io/images/serverless.png)

## LF Deep Learning Landscape

[![LF Deep Learning Landscape](https://landscape.lfdl.io/images/landscape.png)](https://landscape.lfdl.io/images/landscape.png)

## Images

The most challenging parts of creating a new landscape are pulling together the data for `landscape.yml` and finding svg images for all logos.

Google images is often the best way to find a good version of the logo (but ensure it's the up-to-date version). Search for [grpc logo filetype:svg](https://www.google.com/search?q=grpc+logo&tbs=ift:svg,imgo:1&tbm=isch) but substitute your project or product name for grpc. For new landscapes of any size, you will probably need a graphic artist to rebuild some of the logos for you, especially if you (as recommended) ensure that the project name is included in the logo.

## External Data

The canonical source for all data is `landscape.yml`. Once a day, the landscapeapp update_server pulls data for projects and companies from the following sources:

* Project info from GitHub
* Funding info from [Crunchbase](https://www.crunchbase.com/)
* Market cap data from Yahoo Finance
* CII Best Practices Badge [data](https://bestpractices.coreinfrastructure.org/)

The update server enhances the source data with the fetched data and saves the result in `processed_landscape.yml` and as `data.json`, the latter of which is what the app loads to display data.

## Bash shortcuts

If you are working with more than one landscape, there's a trick to run the standard landscapeapp `package.json` functions. Add the following to your `~/.bash_profile`:

```sh
function y { PROJECT_PATH=$PWD npm explore interactive-landscape -- npm run "$@"; }
export -f y
alias yf='y fetch'
alias yl='y check-links'
alias yq='y remove-quotes'
```

Reload with `. ~/.bash_profile` and then use `y open:src`, `yf`, etc. to run functions on the landscape in your current directory.

If you want to fetch updates to the landscapeapp and both the CNCF and LFDL landscapes and update packages on all three, this alias for your `~/.bash_profile` will do so:

```sh
alias all='for path in /Users/your-username/dev/{landscapeapp,landscape,lfdl-landscape}; do git -C $path pull -p; npm run latest; done;'

```

## Vulnerability reporting

Please open an [issue](https://github.com/cncf/landscapeapp/issues/new) or, for sensitive information, email info@cncf.io.

## Continuous Integration and NPM Publishing

On every commit, Netlify builds landscapeapp, clones the CNCF and LFDL repos, and builds their landscapes and verifies that their tests pass with the updated landscapeapp. When that succeeds, it [generates](./full_build.sh) and pushes an updated NPM module.
