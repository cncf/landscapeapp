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

Tips for finding high quality images:

- Google images is often the best way to find a good version of the logo (but ensure it's the up-to-date version). Search for [grpc logo filetype:svg](https://www.google.com/search?q=grpc+logo&tbs=ift:svg,imgo:1&tbm=isch) but substitute your project or product name for grpc. 
- Wikipedia also is a good source for high quality logos ( search in either the main [Wikipedia](https://en.wikipedia.org/w/index.php?sort=relevance&search=svg&title=Special%3ASearch&profile=advanced&fulltext=1&advancedSearch-current=%7B%7D&ns6=1) or [Wikipedia Commons](https://commons.wikimedia.org/w/index.php?sort=relevance&search=svg&title=Special%3ASearch&profile=advanced&fulltext=1&advancedSearch-current=%7B%7D&ns0=1&ns6=1&ns12=1&ns14=1&ns100=1&ns106=1) ).
- Also search for 'svg' in the GitHub for the project, as often projects will embed them there.

For new landscapes of any size, you will probably need a graphic artist to rebuild some of the logos for you, especially if you (as recommended) ensure that the project name is included in the logo. 

If the project is hosted/sponsored by an organization but doesn't have a logo, best practice is to use that organization's logo with the title of the project underneath ( [example](https://landscape.cncf.io/selected=netflix-eureka) ). You can use a tool such as [Inkscape](https://inkscape.org/) to add the text.

Tips for common issues with images:

- If you get an error with the image that it has a PNG embeded, you will need to work with a graphic artist to rebuild the logo.
- If the SVG has a 'text' element tag within it, you will get an error. You can use Inkscape to convert the text tag to a glyph ( select the text, then Ctrl+K (path combine), then Ctrl+J (dynamic offset) ) or [CloudConvert](https://cloudconvert.com) ( click the wrench icon and then checkbox 'Convert text to path' ).
- If you get an error about the size being too large, use [svg-autocrop](https://github.com/cncf/svg-autocrop) on the image to automatically fix it.

## External Data

The canonical source for all data is `landscape.yml`. Once a day, the landscapeapp update_server pulls data for projects and companies from the following sources:

* Project info from GitHub
* Funding info from [Crunchbase](https://www.crunchbase.com/)
* Market cap data from Yahoo Finance
* CII Best Practices Badge [data](https://bestpractices.coreinfrastructure.org/)

The update server enhances the source data with the fetched data and saves the result in `processed_landscape.yml` and as `data.json`, the latter of which is what the app loads to display data.

## Creating a New Landscape

If you want to create an interactive landscape for your project or organization:
1. Note ahead of time that the hardest part of building a landscape is getting hi-res images for every project. You *cannot* convert from a PNG or JPEG into an SVG. You need to get an SVG, AI, or EPS file. Please review this [primer](https://www.cncf.io/blog/2019/07/17/what-image-formats-should-you-be-using-in-2019/) on image formats. 
1. Copy the files from [LFAI landscape](https://github.com/lfai/lfai-landscape), since it is relatively simple (it only has a single landscape image) into a new repo. Call the repo `youracronym-landscape` so it's distinct from other landscapes stored in the same directory.
2. If you're working with the [LF](https://www.linuxfoundation.org/), give [dankohn](https://github.com/dankohn) admin privleges to the new repo and ping me after creating an account at [slack.cncf.io](https://slack.cncf.io). Alex Contini and I are available there to help you recreate SVGs based on a PNG or the company's logo, if necessary, and to fix other problems.
3. For LF projects, I'll set you up in Netlify to build on every commit. Build command is `npm install -g npm && npm ci && npm run build` and publish directory is `dist`. Environment variables that need to be set are `CRUNCHBASE_KEY`, `GITHUB_KEY`, and `TWITTER_KEYS`. I recommend these notifications:
![image](https://user-images.githubusercontent.com/3083270/62425480-87c36000-b6a8-11e9-9882-e84c4e2cdfb4.png)
5. Edit `settings.yml`, `landscape.yml`, and `members.yml` for your topic.
6. [Generate](https://ventipix.com/designer-qr-code-generator.php) a QR code, setting colors to black and embedding the LF Landscape [icon](https://github.com/lf-edge/artwork/blob/master/lfedge-landscape/icon/color/lfedge-landscape-icon-color.png). Save as SVG and overwrite images/qr.svg with it. Note if you are having trouble with the SVG being generated being valid, save as an EPS file and convert to an SVG.

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

## Vulnerability reporting

Please open an [issue](https://github.com/cncf/landscapeapp/issues/new) or, for sensitive information, email info@cncf.io.

## Continuous Integration and NPM Publishing

On every commit, Netlify builds landscapeapp, clones the CNCF and LFAI repos, and builds their landscapes and verifies that their tests pass with the updated landscapeapp. When that succeeds, it [generates](./full_build.sh) and pushes an updated NPM module.
