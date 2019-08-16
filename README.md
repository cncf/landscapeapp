# Landscapeapp

[![CII Best Practices](https://bestpractices.coreinfrastructure.org/projects/2434/badge)](https://bestpractices.coreinfrastructure.org/projects/2434) [![npm version](https://img.shields.io/npm/v/interactive-landscape.svg)](https://www.npmjs.com/package/interactive-landscape) [![Dependency Status](https://img.shields.io/david/cncf/landscapeapp.svg?style=flat-square)](https://david-dm.org/cncf/landscapeapp) [![Netlify Status](https://api.netlify.com/api/v1/badges/50d760a8-5b21-4319-aa01-2ad54e453fd6/deploy-status)](https://app.netlify.com/sites/landscapeapp/deploys)

The landscapeapp is an upstream NPM [module](https://www.npmjs.com/package/interactive-landscape) that supports building interactive landscape websites such as the [CNCF Cloud Native Landscape](https://landscape.cncf.io) ([source](https://github.com/cncf/landscape)) and the [LF Artificial Intelligence Landscape](https://landscape.lfai.foundation) ([source](https://github.com/lfai/lfai-landscape)). The application has been developed by [Andrey Kozlov](https://github.com/ZeusTheTrueGod) and [Dan Kohn](https://www.dankohn.com) of [CNCF](https://www.cncf.io).

In addition to creating fully interactive sites, the landscapeapp builds static images on each update:

## Cloud Native Landscape

[![Cloud Native Landscape](https://landscape.cncf.io/images/landscape.png)](https://landscape.cncf.io/images/landscape.png)

## Serverless Landscape

[![CNCF Serverless Landscape](https://landscape.cncf.io/images/serverless.png)](https://landscape.cncf.io/images/serverless.png)

## CNCF Member Landscape

[![CNCF Member Landscape](https://landscape.cncf.io/images/members.png)](https://landscape.cncf.io/images/members.png)

## LF Artificial Intelligence Landscape

[![LF Artificial Intelligence Landscape](https://landscape.lfai.foundation/images/landscape.png)](https://landscape.lfai.foundation/images/landscape.png)

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

## Creating a New Landscape

If you want to create an interactive landscape for your project or organization:
1. Copy the files from [LFAI landscape](https://github.com/lfai/lfai-landscape), since it is relatively simple (it only has a single landscape image) into a new repo.
2. If you're working with the [LF](https://www.linuxfoundation.org/), give [dankohn](https://github.com/dankohn) admin privleges to the site and ping me after creating an account at [slack.cncf.io](https://slack.cncf.io).
3. For LF projects, I'll set you up in Netlify to build on every commit. Build command is `npm install -g npm && npm ci && npm run build` and publish directory is `dist`. Environment variables that need to be set are `CRUNCHBASE_KEY`, `GITHUB_KEY`, and `TWITTER_KEYS`. I recommend these notifications:
![image](https://user-images.githubusercontent.com/3083270/62425480-87c36000-b6a8-11e9-9882-e84c4e2cdfb4.png)
5. Edit `settings.yml`, `landscape.yml`, and `members.yml` for your topic.
6. [Generate](https://ventipix.com/designer-qr-code-generator.php) a QR code, setting colors to black and embedding the LF Landscape [icon](https://github.com/lf-edge/artwork/blob/master/lfedge-landscape/icon/color/lfedge-landscape-icon-color.png). Save as SVG and overwrite images/qr.svg with it.

## Bash Shortcuts

If you are working with more than one landscape, there's a trick to run the standard landscapeapp `package.json` functions. Add the following to your `~/.bash_profile`:

```sh
function y { PROJECT_PATH=$PWD npm explore interactive-landscape -- npm run "$@"; }
export -f y
alias yf='y fetch'
alias yl='y check-links'
alias yq='y remove-quotes'
```

Reload with `. ~/.bash_profile` and then use `y open:src`, `yf`, etc. to run functions on the landscape in your current directory.

If you want to fetch updates to the landscapeapp and both the CNCF and LFAI landscapes and update packages on all three, this alias for your `~/.bash_profile` will do so:

```sh
alias all='for path in /Users/your-username/dev/{landscapeapp,landscape,lfdl-landscape}; do git -C $path pull -p; npm --prefix $path run latest; done;'

```

## Adding a new landscape to the autoupdater.
So, we have an https://github.com/AcademySoftwareFoundation/aswf-landscape repo and we want to set up automatic updates for it
1. Lets guess that landscapeapp is exctracted to the ~/Documents/landscapeapp, and we will clone that new https://github.com/AcademySoftwareFoundation/aswf-landscape to ~/Documents/aswf-landscape
2. go to the ~/Documents/landscapeapp and add `export PROJECT_PATH=../aswf-landscape` so all further commands will use that one
3. run `./node_modules/.bin/babel-node tools/setupServer
4  ssh into our setup server (root@147.75.106.211) and then ensure that `ls`
shows a new `ASWF.settings as well as ASWF.settings.private`. Now you need to
fill in ASWF.settings.private, usually, copy everything and change the slack
channel from the CNCF.settings.private. You can a slack channel id the
netlify project configuration, Build&Deploy, slack notifications in post processing.
5. that is all we need, you can run `update.sh` manually to ensure that it will pick up the settings files and build that repo too. Log is stored in the update.ASWF.settings.log

Absolutely exact steps are used for a GraphQL project.

## Vulnerability reporting

Please open an [issue](https://github.com/cncf/landscapeapp/issues/new) or, for sensitive information, email info@cncf.io.

## Continuous Integration and NPM Publishing

On every commit, Netlify builds landscapeapp, clones the CNCF and LFAI repos, and builds their landscapes and verifies that their tests pass with the updated landscapeapp. When that succeeds, it [generates](./full_build.sh) and pushes an updated NPM module.
