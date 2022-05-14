# Landscapeapp

[![CII Best Practices](https://bestpractices.coreinfrastructure.org/projects/2434/badge)](https://bestpractices.coreinfrastructure.org/projects/2434) [![npm version](https://img.shields.io/npm/v/interactive-landscape.svg)](https://www.npmjs.com/package/interactive-landscape) [![Dependency Status](https://img.shields.io/david/cncf/landscapeapp.svg?style=flat-square)](https://david-dm.org/cncf/landscapeapp) [![Netlify Status](https://api.netlify.com/api/v1/badges/50d760a8-5b21-4319-aa01-2ad54e453fd6/deploy-status)](https://app.netlify.com/sites/landscapeapp/deploys)

- [Adding and managing landscape entries](#adding-and-managing-landscape-entries)
  - [Logos](#logos)
      - [SVGs Can't Include Text](#svgs-cant-include-text)
        - [CloudConvert](#cloudconvert)
        - [Adobe Illustrator](#adobe-illustrator)
        - [Inkscape](#inkscape)
    - [Crunchbase Requirement](#crunchbase-requirement)
- [External Data](#external-data)
- [Creating a New Landscape](#creating-a-new-landscape)
  - [API Keys](#api-keys)
  - [Installing Locally](#installing-locally)
  - [Adding to a google search console](#adding-to-a-google-search-console)
- [Vulnerability reporting](#vulnerability-reporting)
- [Continuous Integration and NPM Publishing](#continuous-integration-and-npm-publishing)
  - [Building an individual landscape](#building-an-individual-landscape)
    - [Running "remotely" on our build server (fast and by default)](#running-remotely-on-our-build-server-fast-and-by-default)
    - [Running "locally" on Netlify instances (if the remote server is broken)](#running-locally-on-netlify-instances-if-the-remote-server-is-broken)
  - [Building this repo, `landscapeapp` on a Netlify](#building-this-repo-landscapeapp-on-a-netlify)
  - [Setting up our build server to speed up Netlify builds](#setting-up-our-build-server-to-speed-up-netlify-builds)
- [Keeping Project Up to Date](#keeping-project-up-to-date)
- [Embed landscape in a web site](#embed-landscape-in-a-web-site)
- [Generating a Guide](#generating-a-guide)


The landscapeapp is an upstream NPM [module](https://www.npmjs.com/package/interactive-landscape) that supports building interactive landscape websites such as the [CNCF Cloud Native Landscape](https://landscape.cncf.io) ([source](https://github.com/cncf/landscape)) and the [LF Artificial Intelligence Landscape](https://landscape.lfai.foundation) ([source](https://github.com/lfai/lfai-landscape)). The application is under active development by [Andrey Kozlov](https://github.com/AndreyKozlov1984) and [Jordi Noguera](https://jordinl.com).

In addition to creating fully interactive sites, the landscapeapp builds static images on each update. See examples in [ADOPTERS.md](ADOPTERS.md). All current [Linux Foundation](https://linuxfoundation.org) landscapes are listed in [landscapes.yml](landscapes.yml).

## Adding and managing landscape entries

When creating new entries, the only 4 required fields are `name`, `homepage_url`, `logo`, and `crunchbase`. 

```yaml
- item:
  name: <entry name>
  homepage_url: <website for entry>
  # filename in hosted_logos folder. Put the svg file into the hosted_logos
  folder and reference its name.
  logo: <logo for entry> 
  crunchbase: <twitter for entry>
```  

Additional keys that can be set are defined below:

```yaml
  # url for the Twitter account; Only add if the value in Crunchbase is incorrect
  twitter: 
  # url to the repo for the project; will fetch stats if it starts with https://github.com/. If you add a `repo_url` the card will be white instead of grey. 
  repo_url: 
  # url to the GitHub organization for the project; when using `repo_url`, `project_org` can be set pointing to an organization on GitHub, this will have the effect of pulling the information for all the repos belonging to that organization but using `repo_url` for information regarding license and best practices.
  project_org: 
  # additional repos for the project; will fetch stats if they start with https://github.com/
  additional_repos: 
  # Stock Ticker for the organization of the project/entry; normally pulls from Crunchbase but can be overridden here. For delisted and many foreign countries, you'll need to add `stock_ticker` with the value to look up on Yahoo Finance to find the market cap.
  stock_ticker: 
  # description of the entry; if not set pulls from the GitHub repo description
  description: 
  # default branch to reference if not the main one for the repo
  branch: 
  # if the entry is a project hosted by the project, let's you set the maturity level. Should be a value in relations.values.children.id in settings.yml
  project: 
  # url for the CII Best Practices entry if it's not directly mapped to the repo_url
  url_for_bestpractices: 
  # set to false if a repo_url is given but the entry is a project that isn't open source
  open_source: 
  # allows multiple entries with the same repo_url; set for each instance
  allow_duplicate_repo: 
  # set to true if you are using an anonymous organization. You will also need anonymous_organization set in settings.yml
  unnamed_organization: 
```

For some of the key, there is some guidance as listed below.

### Logos

The most challenging part of creating a new landscape is finding SVG images for all projects and companies. These landscapes represent a valuable resource to a community in assembling all related projects, creating a taxonomy, and providing up-to-date logos, and unfortunately, there are no shortcuts.

Do *not* try to convert PNGs to SVGs. You can't automatically go from a low-res to a high-res format, and you'll just waste time and come up with a substandard result. Instead, invest your time finding SVGs and then (when necessary) having a graphic designer recreate images when high res ones are not available.

Tips for finding high quality images:

- Google images is often the best way to find a good version of the logo (but ensure it's the up-to-date version). Search for [grpc logo filetype:svg](https://www.google.com/search?q=grpc+logo&tbs=ift:svg,imgo:1&tbm=isch) but substitute your project or product name for grpc. 
- Wikipedia also is a good source for high quality logos ( search in either the main [Wikipedia](https://en.wikipedia.org/w/index.php?sort=relevance&search=svg&title=Special%3ASearch&profile=advanced&fulltext=1&advancedSearch-current=%7B%7D&ns6=1) or [Wikipedia Commons](https://commons.wikimedia.org/w/index.php?sort=relevance&search=svg&title=Special%3ASearch&profile=advanced&fulltext=1&advancedSearch-current=%7B%7D&ns0=1&ns6=1&ns12=1&ns14=1&ns100=1&ns106=1) ).
- VectorLogoZone ( https://www.vectorlogo.zone/ )
- Also search for 'svg' in the GitHub for the project, as sometimes projects will embed them there.

For new landscapes of any size, you will probably need a graphic artist to rebuild some of the logos for you. 

If the project is hosted/sponsored by an organization but doesn't have a logo, best practice is to use that organization's logo with the title of the project underneath ( [example](https://landscape.cncf.io/selected=netflix-eureka) ). You can use a tool such as [Inkscape](https://inkscape.org/) to add the text.

If you get an error with the image that it has a PNG embedded, you will need to find a different SVG that doesn't include a PNG or work with a graphic artist to rebuild the logo.

#### SVGs Can't Include Text

SVGs need to not rely on external fonts so that they will render correctly in any web browser, whether or not the correct fonts are installed. That means that all embedded text and tspan elements need to be converted to objects. Use of SVGs with embedded text will fail with an error. You can convert the SVGs as using one of the tools below.

##### CloudConvert

1. Go to https://cloudconvert.com/, and click 'Select File' and select the SVG file.
2. Next to 'Convert to', click the dropdown and select 'SVG'
3. There will be wrench icon that appears. Click that.
4. For the option 'Text To Path', select 'Yes' and then click 'Okay'
5. Click 'Convert' to do the conversion and the download the converted file.

##### Adobe Illustrator

1. Select all text
1. With the text selected, go to Object > Expand in the top menu
1. Export file by going to File > Export > Export As in top menu
1. Select SVG from the format drop down and make sure that "Use Artboards" is checked
1. This will open a SVG options box, make sure to set Decimal to 5 (that is the highest possible, so to ensure that sufficient detail is preserved)
1. Click Okay to export

##### Inkscape

1. Select the text
1. Ctrl+K (path combine)
1. Ctrl+J (dynamic offset)
1. Save

### Crunchbase Requirement

We require all landscape entries to include a [Crunchbase](https://www.crunchbase.com/) url. We use the Crunchbase API to fetch the backing organization and headquarters location and (if they exist), Twitter, LinkedIn, funding, parent organization, and stock ticker. For open source, non-affiliated projects, we will just create a nonprofit organization representing the project (if one doesn't already exist), and set the location to the lead developer.

Using an external source for this info saves effort in most cases, because most organizations are already listed. Going forward, the data is being independently maintained and updated over time.

If for certain reason Crunchbase should not be used - we rely on `organization: { name: 'My Organization Name' }` instead of a `crunchbase` field

#### Overriding industries from Crunchbase

To override industries returned from Crunchbase for a specific Crunchbase entry, add it to an `crunchbase_overrides` top-level entry on `landscape.yml`. For instance, the following will set `industries` for Linux Foundation to Linux and Cloud Computing:

```yaml
crunchbase_overrides:
  https://www.crunchbase.com/organization/linux-foundation:
    industries:
      - Linux
      - Cloud Computing
```

`crunchbase_overrides` must be a top-level key on `landscape.yml`, so it should be a sibling of `landscape`. That's to prevent having to override multiple items that share the same Crunchbase URL.

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
2. Create a repo `youracronym-landscape` so it's distinct from other landscapes stored in the same directory. From inside your new directory, copy over files from a simpler landscape like https://github.com/graphql/graphql-landscape with `cp -r ../graphql-landscape/* ../graphql-landscape/.github ../graphql-landscape/.gitignore ../graphql-landscape/.npmrc ../graphql-landscape/.nvmrc .`.
3. If you're working with the [LF](https://www.linuxfoundation.org/), give admin privileges to the new repo to [dankohn](https://github.com/dankohn) and write privileges to [AndreyKozlov1984](https://github.com/AndreyKozlov1984), [jordinl83](https://github.com/jordinl83), and [CNCF-Bot](https://github.com/CNCF-Bot) and ping Dan after creating an account at [slack.cncf.io](https://slack.cncf.io). Alex Contini and Dan are available there to help you recreate SVGs based on a PNG of the company's logo, if necessary, and to fix other problems.
4. Set the repo to only support merge commits and turn off DCO support, since it doesn't work well with the GitHub web interface:
![image](https://user-images.githubusercontent.com/3083270/66166276-dd62ad00-e604-11e9-87db-fd9ae7a80d1a.png)
5. Edit `settings.yml` and `landscape.yml` for your topic.
6. [Generate](https://www.qrcode-monkey.com) a QR code, setting colors to black. Save as SVG and overwrite images/qr.svg.
7. Run `y reset-tweet-count` to start the count of tweets mentioning your landscape at zero.
8. Edit [landscapes.yml](landscapes.yml) to add your project.

### API Keys

You want to add the following to your `~/.bash_profile`. If you're with the LF, ask someone on CNCF [Slack](https://slack.cncf.io) for the Crunchbase and Twitter keys.

For the GitHub key, please go to https://github.com/settings/tokens and create a key (you can call it `personal landscape`) with *no* permissions. That is, don't click any checkboxes, because you only need to access public repos.

```sh
export CRUNCHBASE_KEY_4="key-here"
export TWITTER_KEYS=keys-here
export GITHUB_KEY=key-here
```

### Installing Locally

You can administer a landscape without ever needing to install the software locally. However, a local install is helpful for rapid development, as it reduces the 5 minute build time on Netlify to 10 seconds or less locally. In particular, you want a local install when you're reconfiguring the layout. We recommend installing one or more landscapes as sibling directories to the landscapeapp. Then, you want to install the npm modules for landscapeapp but not for any of the landscapes. Here are the [install](INSTALL.md) directions.

So, if you're in a directory called `dev`, you would do:
```sh
dev$ git clone git@github.com:cncf/landscapeapp.git
dev$ git clone git@github.com:cdfoundation/cdf-landscape.git
dev$ cd landscapeapp
dev$ npm install -g yarn@latest
dev$ yarn
```

### Adding to a google search console
  Go to the google search console, add a new property, enter the url of the
  given project, for example, https://landscape.cncf.io

  Next, google will want to verify that it is your site, thus you need to choose
  an `html tag verification` option and copy a secret code from it and put it to
  the `settings.yml` of a given landscape project. Then commit the change to the default branch and
  wait till Netlify deploys the default branch. The key is named `google_site_veryfication` and it is
  somewhere around line 14 in settings.yml. After netlify successfully deploys
  that dashboard, verify the html tag in a google console. Do not forget to add
  Dan@linuxfoundation.org as someone who has a full access from a `Settings`
  menu for a given search console.

## Vulnerability reporting

Please open an [issue](https://github.com/cncf/landscapeapp/issues/new) or, for sensitive information, email info@cncf.io.

## Continuous Integration and NPM Publishing

We have a sophisticated build system.
We build this landscapeapp repo together with every landscape after each commit
to the landscapeapp. A list of landscapes is stored in the landscapes.yml
An individual landscape is built on a PR to that landscape.

Details about building a repo on netlify:

### Building an individual landscape

To build an individual landscape, we use Netlify. Netlify has certain
issues with the performance and their caching algorithm is ineffective, thus in 
order to produce the fastest build, these steps are done

Note, that script `netlify/landscape.js` from THIS repo is used to run an
individual build on every landscape.

A file netlify.toml specifies which commands are used and how to make a build.
We start from the `netlify` folder and then download the landscape.js script from the default branch
of a landscapeapp repo and then run a `node netlify/landscape.js`
script because otherwise, Netlify will run an unnecessary `npm install`
In order to make a build as fast as possible, we designed a way to run it on our
own build server. The problem is that Netlify uses very slow and cheap amazon
virtual machines, while our build server has a lot of CPUs and enough of RAM, that
allows further parallelization during build steps.

#### Running "remotely" on our build server (fast and by default)

When an environment variable BUILD_SERVER is set, the following steps will occur:
  - the interactive-landscape package of the latest version is downloaded from npm
  - a current checkout of an individual landscape with a `landscapeapp` in a
  `package` folder is rsynced and sent to our build server
  - we use a hash of .nvmrc + package.json + npm-shrinkwrap.json from the
  `landscapeapp` repo as a key to cache `node_modules`, `~/.nvm` and `~/.npm` folders,
  this way if the hash has not changed - we reuse existing node_modules without any
  setup
  - if a hash is different, we install node_modules and cache `~/.nvm`,
  `~/.npm` and `node_modules` for further usage
  - finally, we run a build on our remote server via ssh, and when the build is
  done, the output is returned via rsync

Those extra steps allow us to run a build faster because we avoid an `npm install` step
almost every time and extra RAM and CPU allow running npm tasks `renderLandscape`,
       `checkLandscape` and `jest` in parallel.

Still, if for certain reasons, remote solution stopped to work and we need to
restore the Netlify build process as soon as possible, BUILD_SERVER variable
should be set to empty in either a given landscape or in a shared variables
section. Usually, the build will fail for all the landscapes, thus renaming the
variable to BUILD_SERVER_1 in shared variables is the most efficient way.

One of the possible issues why remote builds would stop to work,
    although let's hope that will never change, would be that a cache folder is broken, therefore 
`ssh root@${BUILD_SERVER}` and then calling `rm -rf /root/build` on our build server will clear all the caches used for node_modules.
 Then you need to trigger a Netlify build again.

#### Running "locally" on Netlify instances (if the remote server is broken)

Without BUILD_SERVER variable, the following steps are done, from a file netlify/netlify.sh
  - the interactive-landscape package of the latest version is downloaded from npm
  - we go to that folder
  - we install node_modules via `npm install`
  - we run `PROJECT_PATH=.. npm run` build from the interactive-landscape package

### Building this repo, `landscapeapp` on a Netlify

  We want to ensure that we are making builds of all the landscapes, defined in
  `landscapes.yml`
  Netlify parameters are stored in the `notilfy.toml` file, and it runs the 
  `node netlify/landscapeapp.js` from the `netlify` folder.

  First, we check if the hash of `.nvmrc`, `package.json` and `npm-shrinkwrap`
  file already exists as a key of our cache on our remote server.
  If it does exist, it means we can use this folder for `node_modules`, `.npm`
  and `.nvm` folders for every individual landscape.
  Then we use rsync to send the current checkout of a repo to our remote server
  Then for every individual landscape, we run a `build.sh` file on a remote
  server, in each own docker container for every landscape. That is done in parallel. The file `build.sh` checks out the
  default branch of a given landscape and then runs `npm run build` with a
  PROJECT_PATH pointed to the given landscape

  When all builds had been finished, the output is returned to the `dist/${landscape.name}`
  subfolder and logs are shown.
  Then _redirects and _headers files are generated to allow us to view
  individual landscapes from a Netlify build.

  This repo is built only on our build server because Netlify has a 30 minutes timeout and we can not build individual landscapes there in parallel. Still,
  if every build fails and there are no obvious reasons, it may help to clear a
  node_modules cache: `ssh root@${BUILD_SERVER}` and then calling `rm -rf /root/build` and then running a new build on Netlify again
### Setting up our build server to speed up Netlify builds
  If for some reasons our current server is lost or wiped, or we have to rent a different build server, these are required steps
  1. Install docker on a new server. Just the latest docker, nothing else is
     required
  2. Generate a new pair of ssh keys, and add a public key to the
     `/root/.ssh/authorized_keys` file
  3. Take a private key without first and last lines, replace \n with space, and
     add as a BUILDBOT_KEY variable to the shared variable on a Netlify website
  4. Update the BUILD_SERVER shared variable on a Netlify website and provide
     the IP address of the new build server

  To just check that all is fine, go to the `netlify` folder on your computer, 
  checkout any branch you want or even make local changes, and run `node
  landscapeapp.js`, do not forget to set all required variables, including the
  BUILDBOT_KEY and BUILD_SERVER. The build should finish with the success and
  copy generated files and folders to the `dist` folder in the root of the repo checkout
  

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

## Embed landscape in a web site

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

## Generating a Guide

A Guide can be generated by adding a file `guide.md`. `guide.md` will be mostly regular markdown with some custom behavior:

### No headings level 1 allowed

No [Headings](https://www.markdownguide.org/basic-syntax/#headings) level 1 allowed, use level 2 or higher.

### Linking a category from the landscape to a section on the guide

If a section on the guide refers to a category on the landscape, an info icon will be added on the category on the landscape and such icon will redirect to the entry on the guide for that category.

In order to associate the category and the section on the guide, the section on the guide should be wrapped between `<section data-category="$categoryId">` and `</section>`, where `$categoryId` is the id of the category. 

Don't include a title for the section, a level 2 heading will be automatically generated using the name of the category.

### Linking a subcategory from the landscape to a section on the guide

If a section on the guide refers to a subcategory on the landscape, an info icon will be added on the subcategory on the landscape and such icon will redirect to the entry on the guide for that subcategory.

In order to associate the subcategory and the section on the guide, the section on the guide should be wrapped between `<section data-subcategory="$subcategoryId" data-buzzwords="$buzzword1,$buzzword2">` and `</section>`, where `$subcategoryId` is the id of the subcategory. Buzzwords is a comma-separated list of words that describe the subcategory, a table will be automatically generated at the bottom of the section including those buzzwords and the list of projects hosted by the organization. The cards with all the logos for that subcategory will also be included at the bottom of the section.

Don't include a title for the section, level 3 heading will be automatically generated using the name of the subcategory.

### Automatic generation of guide navigation

The guide will include a side-navigation generated automatically from all the headings levels 2 and 3 found on the guide. Level 3 headings will be nested under the closest level 2 heading above. 
