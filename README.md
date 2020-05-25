# Landscapeapp

[![CII Best Practices](https://bestpractices.coreinfrastructure.org/projects/2434/badge)](https://bestpractices.coreinfrastructure.org/projects/2434) [![npm version](https://img.shields.io/npm/v/interactive-landscape.svg)](https://www.npmjs.com/package/interactive-landscape) [![Dependency Status](https://img.shields.io/david/cncf/landscapeapp.svg?style=flat-square)](https://david-dm.org/cncf/landscapeapp) [![Netlify Status](https://api.netlify.com/api/v1/badges/50d760a8-5b21-4319-aa01-2ad54e453fd6/deploy-status)](https://app.netlify.com/sites/landscapeapp/deploys)

The landscapeapp is an upstream NPM [module](https://www.npmjs.com/package/interactive-landscape) that supports building interactive landscape websites such as the [CNCF Cloud Native Landscape](https://landscape.cncf.io) ([source](https://github.com/cncf/landscape)) and the [LF Artificial Intelligence Landscape](https://landscape.lfai.foundation) ([source](https://github.com/lfai/lfai-landscape)). The application is managed by [Dan Kohn](https://www.dankohn.com) of [CNCF](https://www.cncf.io) and is under active development by [Andrey Kozlov](https://github.com/ZeusTheTrueGod) (who did most of the development to date) and [Jordi Noguera](https://jordinl.com).

In addition to creating fully interactive sites, the landscapeapp builds static images on each update. See examples in [ADOPTERS.md](ADOPTERS.md). All current [Linux Foundation](https://linuxfoundation.org) landscapes are listed in [landscapes.yml](landscapes.yml).

## Images

The most challenging part of creating a new landscape is finding SVG images for all projects and companies. These landscapes represent a valuable resource to a community in assembling all related projects, creating a taxonomy, and providing the up-to-date logos, and unfortunately, there are no shortcuts.

Do *not* try to convert PNGs to SVGs. You can't automatically go from a low-res to a high-res format, and you'll just waste time and come up with a substandard result. Instead, invest your time finding SVGs and then (when necessary) having a graphic designer recreate images when high res ones are not available.

Tips for finding high quality images:

- Google images is often the best way to find a good version of the logo (but ensure it's the up-to-date version). Search for [grpc logo filetype:svg](https://www.google.com/search?q=grpc+logo&tbs=ift:svg,imgo:1&tbm=isch) but substitute your project or product name for grpc. 
- Wikipedia also is a good source for high quality logos ( search in either the main [Wikipedia](https://en.wikipedia.org/w/index.php?sort=relevance&search=svg&title=Special%3ASearch&profile=advanced&fulltext=1&advancedSearch-current=%7B%7D&ns6=1) or [Wikipedia Commons](https://commons.wikimedia.org/w/index.php?sort=relevance&search=svg&title=Special%3ASearch&profile=advanced&fulltext=1&advancedSearch-current=%7B%7D&ns0=1&ns6=1&ns12=1&ns14=1&ns100=1&ns106=1) ).
- Also search for 'svg' in the GitHub for the project, as sometimes projects will embed them there.

For new landscapes of any size, you will probably need a graphic artist to rebuild some of the logos for you. 

If the project is hosted/sponsored by an organization but doesn't have a logo, best practice is to use that organization's logo with the title of the project underneath ( [example](https://landscape.cncf.io/selected=netflix-eureka) ). You can use a tool such as [Inkscape](https://inkscape.org/) to add the text.

If you get an error with the image that it has a PNG embeded, you will need to find a different SVG that doesn't include a PNG or work with a graphic artist to rebuild the logo.

## SVGs Can't Include Text

SVGs need to not rely on external fonts so that they will render correctly in any web browser, whether or not the correct fonts are installed. That means that all embedded text and tspan elements need to be converted to objects. Use of SVGs with embedded text will fail with an error. You can convert the SVGs as follows:

Here are the steps in Adobe Illustrator to create convert text to objects:

1. Select all text
1. With the text selected, go to Object > Expand in the top menu
1. Export file by going to File > Export > Export As in top menu
1. Select SVG from the format drop down and make sure that "Use Artboards" is checked
1. This will open a SVG options box, make sure to set Decimal to 5 (that is the highest possible, so to ensure that sufficient detail is preserved)
1. Click Okay to export

Here are the steps for Inkscape:

1. Select the text
1. Ctrl+K (path combine)
1. Ctrl+J (dynamic offset)
1. Save

## New Entries

When creating new entries, the only 4 required fields are `name`, `homepage_url`, `logo`, and `crunchbase`. It's generally easier to have the landscape fetch an SVG by adding it's URL rather than saving it yourself in the `hosted_logos` folder. Only add a `twitter` if the value in Crunchbase is incorrect. For delisted and many foreign countries, you'll need to add `stock_ticker` with the value to look up on Yahoo Finance to find the market cap. If you add a `repo_url` the card will be white instead of grey.

## Crunchbase Requirement

We require all landscape entries to include a [Crunchbase](https://www.crunchbase.com/) url. We use the Crunchbase API to fetch the backing organization and headquarters location and (if they exist), Twitter, LinkedIn, funding, parent organization, and stock ticker. For open source, non-affiliated projects, we will just create a nonprofit organization representing the project (if one doesn't already exist), and set the location to the lead developer.

Using an external source for this info saves effort in most cases, because most organizations are already listed. Going forward, the data is being independently maintained and updated over time.

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
1. Create a repo `youracronym-landscape` so it's distinct from other landscapes stored in the same directory. From inside your new directory, copy over files from a simpler landscape like https://github.com/graphql/graphql-landscape with `cp -r ../graphql-landscape/* ../graphql-landscape/.github ../graphql-landscape/.gitignore ../graphql-landscape/.npmrc ../graphql-landscape/.nvmrc .`.
2. If you're working with the [LF](https://www.linuxfoundation.org/), give admin privileges to the new repo to [dankohn](https://github.com/dankohn) and write privleges to [AndreyKozlov1984](https://github.com/AndreyKozlov1984), [jordinl83](https://github.com/jordinl83), and [CNCF-Bot](https://github.com/CNCF-Bot) and ping Dan after creating an account at [slack.cncf.io](https://slack.cncf.io). Alex Contini and Dan are available there to help you recreate SVGs based on a PNG of the company's logo, if necessary, and to fix other problems.
2. Set the repo to only support merge commits and turn off DCO support, since it doesn't work well with the GitHub web interface:
![image](https://user-images.githubusercontent.com/3083270/66166276-dd62ad00-e604-11e9-87db-fd9ae7a80d1a.png)
3. For LF projects, Dan will set you up in Netlify to build on every commit. Build command is `npm install -g npm && npm ci && npm run build` and publish directory is `dist`. Environment variables that need to be set are `CRUNCHBASE_KEY`, `GITHUB_KEY`, `GITHUB_TOKEN`, and `TWITTER_KEYS`. Dan recommends these notifications:
![image](https://user-images.githubusercontent.com/3083270/62425480-87c36000-b6a8-11e9-9882-e84c4e2cdfb4.png)
5. Edit `settings.yml` and `landscape.yml` for your topic.
6. [Generate](https://www.qrcode-monkey.com) a QR code, setting colors to black. Save as SVG and overwrite images/qr.svg.
7. Run `y reset-tweet-count` to start the count of tweets mentioning your landscape at zero.
8. Edit [landscapes.yml](landscapes.yml) to add your project.

## API Keys

You want to add the following to your `~/.bash_profile`. If you're with the LF, ask Dan Kohn on CNCF [Slack](https://slack.cncf.io) for the Crunchbase and Twitter keys.

For the GitHub key, please go to https://github.com/settings/tokens and create a key (you can call it `personal landscape`) with *no* permissions. That is, don't click any checkboxes, because you only need to access public repos.

```sh
export CRUNCHBASE_KEY_4="key-here"
export TWITTER_KEYS=keys-here
export GITHUB_KEY=key-here
```

## Installing Locally

You can administer a landscape without ever needing to install the software locally. However, a local install is helpful for rapid development, as it reduces the 5 minute build time on Netlify to 10 seconds or less locally. In particular, you want a local install when you're reconfiguring the layout. We recommend installing one or more landscapes as sibling directories to the landscapeapp. Then, you want to install the npm modules for landscapeapp but not for any of the landscapes. Here are the [install](INSTALL.md) directions.

So, if you're in a directory called `dev`, you would do:
```sh
dev$ git clone git@github.com:cncf/landscapeapp.git
dev$ git clone git@github.com:cdfoundation/cdf-landscape.git
dev$ cd landscapeapp
dev$ npm install
```
Now, to use the local landscapeapp you can add the following to your `~/.bash_profile`:
```sh
function y { PROJECT_PATH=`pwd` npm run --prefix ../landscapeapp "$@"; }
export -f y
# yf does a normal build and full test run
alias yf='y fetch'
alias yl='y check-links'
alias yq='y remove-quotes'
# yp does a build and then opens up the landscape in your browser ( can view the PDF and PNG files )
alias yp='y build && y open:dist'
# yo does a quick build and opens up the landscape in your browser
alias yo='y open:src'
alias a='for path in /Users/your-username/dev/{landscapeapp,cdf-landscape,lfai-landscape}; do echo $path; git -C $path pull -p; done; npm --prefix /Users/your-username/dev/landscapeapp update;'

```
Reload with `. ~/.bash_profile` and then use `yo`, `yf`, etc. to run functions on the landscape in your landscape directory. `a` will do a git pull on each of the project directories you specify and install any necessary node modules for landscapeapp.

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

On every commit, Netlify builds landscapeapp, clones the 10 LF repos, and builds their landscapes and verifies that their tests pass with the updated landscapeapp. When that succeeds, it [generates](./full_build.sh) and pushes an updated NPM module.

## Keeping Project Up to Date
We have an issue #75, where we update all out packages. This is how an update
is usually done:
1. Create a new folder like 75-update-2019-10-16
2. Run `ncu -u` which is same as `npm-check-updates -u`, do not forget to
   install `npm install -g npm-check-updates`
3. Run `npm install` , commit and push and make a PR
4. Check that everything runs locally, i.e. `npm run open:src should still work
   well`
5. Check that there are no layout issues on generated landscapes
6. Do not forget to read README about those npm packages, which are mentioned in
   a red color, i.e. have a major update. They may require to implement certain
   changes in our code.

# Embed landscape in a web site

You can embed the landscape in a website in a few different ways...

- If you want just a full static image of the landscape in landscape mode, you can do:

```
<!-- Embed ASWF landscape as a PNG -->
<img src="https://landscape.aswf.io/images/landscape.png" alt="Academy Software Foundation Landscape Image">
```

- If you want to embed the card mode for listing a category of entries ( for example members in a foundation or entries in a certain program ), you can do:

```
<!-- Embed list of all Open Mainframe Project members -->  
<iframe src="https://landscape.openmainframeproject.org/category=open-mainframe-project-member-company&amp;format=logo-mode&amp;grouping=category&amp;embed=yes" frameborder="0" id="landscape" scrolling="no" style="width: 1px; min-width: 100%; opacity: 1; visibility: visible; overflow: hidden; height: 1717px;"></iframe>
<script src="https://landscape.openmainframeproject.org/iframeResizer.js"></script>
```
