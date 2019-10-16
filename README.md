# Landscapeapp

[![CII Best Practices](https://bestpractices.coreinfrastructure.org/projects/2434/badge)](https://bestpractices.coreinfrastructure.org/projects/2434) [![npm version](https://img.shields.io/npm/v/interactive-landscape.svg)](https://www.npmjs.com/package/interactive-landscape) [![Dependency Status](https://img.shields.io/david/cncf/landscapeapp.svg?style=flat-square)](https://david-dm.org/cncf/landscapeapp) [![Netlify Status](https://api.netlify.com/api/v1/badges/50d760a8-5b21-4319-aa01-2ad54e453fd6/deploy-status)](https://app.netlify.com/sites/landscapeapp/deploys)

The landscapeapp is an upstream NPM [module](https://www.npmjs.com/package/interactive-landscape) that supports building interactive landscape websites such as the [CNCF Cloud Native Landscape](https://landscape.cncf.io) ([source](https://github.com/cncf/landscape)) and the [LF Artificial Intelligence Landscape](https://landscape.lfai.foundation) ([source](https://github.com/lfai/lfai-landscape)). The application has been developed by [Andrey Kozlov](https://github.com/ZeusTheTrueGod) and [Dan Kohn](https://www.dankohn.com) of [CNCF](https://www.cncf.io).

In addition to creating fully interactive sites, the landscapeapp builds static images on each update. See examples in [ADOPTERS.md](ADOPTERS.md)

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
1. Note ahead of time that the hardest part of building a landscape is getting hi-res images for every project. You *cannot* convert from a PNG or JPEG into an SVG. You need to get an SVG, AI, or EPS file. When those aren't available, you will  need a graphic designer to recreate several images. Don't just use an auto-tracer to try to convert PNG to SVG because there is some artistry involved in making it look good. Please review this [primer](https://www.cncf.io/blog/2019/07/17/what-image-formats-should-you-be-using-in-2019/) on image formats. 
1. Create a repo `youracronym-landscape` so it's distinct from other landscapes stored in the same directory. From inside your new directory, copy over files from a simpler landscape like https://github.com/graphql/graphql-landscape with `cp -r ../graphql-landscape/* ../graphql-landscape/.github ../graphql-landscape/.gitignore ../graphql-landscape/.npmrc .`.
2. If you're working with the [LF](https://www.linuxfoundation.org/), give admin privileges to the new repo to [dankohn](https://github.com/dankohn), [AndreyKozlov1984](https://github.com/AndreyKozlov1984), [jordinl83](https://github.com/jordinl83), and [CNCF-Bot](https://github.com/CNCF-Bot) and ping me after creating an account at [slack.cncf.io](https://slack.cncf.io). Alex Contini and I are available there to help you recreate SVGs based on a PNG or the company's logo, if necessary, and to fix other problems.
2. Set the repo to only support merge commits and turn off DCO support, since it doesn't work well with the GitHub web interface:
![image](https://user-images.githubusercontent.com/3083270/66166276-dd62ad00-e604-11e9-87db-fd9ae7a80d1a.png)
3. For LF projects, I'll set you up in Netlify to build on every commit. Build command is `npm install -g npm && npm ci && npm run build` and publish directory is `dist`. Environment variables that need to be set are `CRUNCHBASE_KEY`, `GITHUB_KEY`, and `TWITTER_KEYS`. I recommend these notifications:
![image](https://user-images.githubusercontent.com/3083270/62425480-87c36000-b6a8-11e9-9882-e84c4e2cdfb4.png)
5. Edit `settings.yml` and `landscape.yml` for your topic.
6. [Generate](https://ventipix.com/designer-qr-code-generator.php) a QR code, setting colors to black. Save as EPS, convert to SVG using cloudconvert.com and overwrite images/qr.svg with the SVG (the SVGs it generates have invalid headers).
7. Run `y reset-tweet-count` to start the count of tweets mentioning your landscape at zero.

## API Keys

You want to add the following to your `~/.bash_profile`. If you're with the LF, ask Dan Kohn on CNCF [Slack](https://slack.cncf.io) for the Crunchbase and Twitter keys.

For the GitHub key, please go to https://github.com/settings/tokens and create a key (you can call it `personal landscape`) with *no* permissions. That is, don't click any checkboxes, because you only need to access public repos.

```sh
export CRUNCHBASE_KEY="key-here"
export TWITTER_KEYS=keys-here
export GITHUB_KEY=key-here
```

## Bash Shortcuts

If you are working with more than one landscape, there's a trick to run the standard landscapeapp `package.json` functions. Add the following to your `~/.bash_profile`:

```sh
function y { PROJECT_PATH=$PWD npm explore interactive-landscape -- npm run "$@"; }
export -f y
# yf does a normal build and full test run
alias yf='y fetch'
alias yl='y check-links'
alias yq='y remove-quotes'
# yp does a build and then opens up the landscape in your browser ( can view the PDF and PNG files )
alias yp='y build && y open:dist'
# yo does a quick build and opens up the landscape in your browser
alias yo='y open:src'
# yc does a full clean out of the local npm modules and the yf. Use only if you are getting weird errors on yf
alias yc='PROJECT_PATH=$PWD rm -rf node_modules && npm install && yf'
```

Reload with `. ~/.bash_profile` and then use `y open:src`, `yf`, etc. to run functions on the landscape in your current directory.

If you want to fetch updates to the landscapeapp and both the CNCF and LFAI landscapes and update packages on all three, this alias for your `~/.bash_profile` will do so:

```sh
alias all='for path in /Users/your-username/dev/{landscapeapp,landscape,lfai-landscape}; do git -C $path pull -p; npm --prefix $path run latest; done;'

```

If you're making a change to `landscapeapp` (and in that directory), and you have a sibling directory of `cdf-landscape`, you can run the code you're changing on `cdf-landscape` with:

```sh
PROJECT_PATH=../cdf-landscape npm run build
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


## Adding to a google search console
  Go to the google search console, add a new property, enter the url of the
  given project, for example, https://landscape.cncf.io

  Next, google will want to verify that it is your site, thus you need to choose
  an `html tag verification` option and copy a secret code from it and put it to
  the `settings.yml` of a given landscape project. Then commit the change to the master branch and
  wait till Netlify deploys the master branch. The key is named `google_site_veryfication` and it is
  somewhere around line 14 in settings.yml. After netlify succesfully deploys
  that dashbaord, verify the html tag in a google console. Do not forget to add
  Dan@linuxfoundation.org as someone who has a full access from a `Settings`
  menu for a given search console.

## Vulnerability reporting

Please open an [issue](https://github.com/cncf/landscapeapp/issues/new) or, for sensitive information, email info@cncf.io.

## Continuous Integration and NPM Publishing

On every commit, Netlify builds landscapeapp, clones the CNCF and LFAI repos, and builds their landscapes and verifies that their tests pass with the updated landscapeapp. When that succeeds, it [generates](./full_build.sh) and pushes an updated NPM module.

## Keeping Project Up to Date
We have an issue #75, where we update all out packages. This is how an update
is usually done:
1. Create a new folder like 75-update-2019-10-16
2. Run `ncu -u` which is same as `node-check-updates -u`, do not forget to
   isntall `npm install -g node-check-updates`
3. Run `npm install` , commit and push and make a PR
4. Check that everything runs locally, i.e. `npm run open:src should still work
   well`
5. Check that there are no layout issues on generated landscapes
6. Do not forget to read README about those npm packages, which are mentioned in
   a red color, i.e. have a major update. They may require to implement certain
   changes in our code.

# Embed landscape in a web site

You can embed the landscape in a website in a few different ways...

- If you want just a full visual of the landscape in landscape mode, you can do:

```
<!-- Embed ASWF landscape as a PNG -->
<img src="https://landscape.aswf.io/images/landscape.png" alt="">
```

- If you want to embed the card mode for listing a category of entries ( for example members in a foundation or entries in a certain program ), you can do:

```
<!-- Embed list of all Open Mainframe Project members -->  
<iframe src="https://landscape.openmainframeproject.org/category=open-mainframe-project-member-company&amp;format=logo-mode&amp;grouping=category&amp;embed=yes" frameborder="0" id="landscape" scrolling="no" style="width: 1px; min-width: 100%; opacity: 1; visibility: visible; overflow: hidden; height: 1717px;"></iframe>
```
