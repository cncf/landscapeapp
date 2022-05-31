const path = require('path');
const fs = require('fs/promises');
const { settings, distPath, basePath } = require('./settings.js');
const  { projects } = require('./loadData.js');
const { processedLandscape } = require('./processedLandscape.js');
const { render } = require('../src/components/ItemDialogContentRenderer.js');
const CardRenderer = require('../src/components/CardRenderer.js');
const LandscapeContentRenderer = require('../src/components/LandscapeContentRenderer.js');
const HomePageRenderer = require('../src/components/HomePageRenderer.js');
const GuideRenderer = require('../src/components/GuideRenderer.js');
const EmbedPageRenderer = require('../src/components/EmbedPageRenderer.js');
const FullscreenLandscapeRenderer = require('../src/components/FullscreenLandscapeRenderer');
const { getLandscapeItems, expandSecondPathItems } = require('../src/utils/itemsCalculator.js');
const { findLandscapeSettings } = require('../src/utils/landscapeSettings');

async function main() {
  await fs.mkdir(path.resolve(distPath, 'data/items'), { recursive: true});
  await fs.mkdir(path.resolve(distPath, 'fullscreen'), { recursive: true});
  const payload = {};
  const fullscreen = {};

  let guideIndex = {};
  let guideJson = null;
  try {
    guideJson = JSON.parse(await fs.readFile(path.resolve(distPath, 'guide.json'), 'utf-8'));
    guideIndex = guideJson.filter(section => section.landscapeKey)
      .reduce((accumulator, { category, subcategory, anchor }) => {
        const key = [category, subcategory].filter(_ => _).join(' / ')
        return { ...accumulator, [key]: anchor }
      }, {});
  } catch(ex) {}

  for (let key in settings.big_picture) {
    const landscapeSettingsEntry = settings.big_picture[key];
    const landscapeSettings = findLandscapeSettings(landscapeSettingsEntry.url);
    const expandedItems = expandSecondPathItems(projects);
    const landscapeItems = getLandscapeItems({
      items: expandedItems,
      landscapeSettings: landscapeSettings,
      guideIndex
    });
    const landscapeContent = LandscapeContentRenderer.render({
      landscapeItems: landscapeItems,
      landscapeSettings: landscapeSettings
    });

    const fullscreenContent = FullscreenLandscapeRenderer.render({
      landscapeSettings: landscapeSettings,
      landscapeContent: landscapeContent,
      version: '1.0'
    });

    fullscreen[key] = fullscreenContent;

    await fs.writeFile(path.resolve(distPath, `data/items/landscape-${landscapeSettings.url}.html`), landscapeContent);

    payload[ key === 'main' ? 'main' : landscapeSettings.url] = landscapeContent;

  }

  if (guideJson) {
    const guideContent = GuideRenderer.render({
      settings,
      guide: guideJson,
      items: projects
    });
    payload.guide = guideContent;
    await fs.writeFile(path.resolve(distPath, `data/items/guide.html`), guideContent);
  }

  let defaultCards = '';
  let borderlessCards = '';
  let flatCards = '';
  for (let item of projects) {
    const defaultCard = CardRenderer.renderDefaultCard({item});
    defaultCards += defaultCard;
    const borderlessCard = CardRenderer.renderBorderlessCard({item});
    borderlessCards += borderlessCard;
    const flatCard = CardRenderer.renderFlatCard({item});
    flatCards += flatCard;
  }

  await fs.writeFile(path.resolve(distPath, `data/items/cards-card.html`), defaultCards);
  await fs.writeFile(path.resolve(distPath, `data/items/cards-logo.html`), defaultCards);
  await fs.writeFile(path.resolve(distPath, `data/items/cards-borderless.html`), borderlessCards);
  await fs.writeFile(path.resolve(distPath, `data/items/cards-flat.html`), flatCards);

  // render an index.html
  const js = await fs.readFile('src/script.js', 'utf-8');
  const css = await fs.readFile('src/style.css', 'utf-8');
  // preprocess css media queries
  let processedCss = css;
  const match = css.match(/(--\w+-screen:\s\d+px)/g);
  for(let cssVar of match) {
    const value = cssVar.match(/(\d+px)/)[0];
    const name = cssVar.split(':')[0];
    for (let i = 0; i < 100; i++) {
      processedCss = processedCss.replace(`var(${name})`, value);
    }
  }

  const fonts = await fs.readFile('src/fonts.css', 'utf-8');
  const resizerScript = await fs.readFile(require.resolve('iframe-resizer/js/iframeResizer.contentWindow.min.js'), 'utf-8');
  const description = `${settings.global.meta.description}. Updated: ${process.env.lastUpdated}`;
  const favicon = '/favicon.png';

  const ga = `
   (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
           (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
             m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
         })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');
         ga('create', '${process.env.GA}', 'auto');
         ga('send', 'pageview');
  `

  const headers = `
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <title>${settings.global.meta.title}</title>
      <meta name="description" content="${description}" />
      <meta property="og:locale" content="en_US"/>
      <meta property="og:type" content="website"/>
      <meta property="og:title" content="${settings.global.meta.title}"/>
      <meta property="og:description" content="${description }"/>
      <meta property="og:url" content="${settings.global.website}"/>
      <meta property="og:site_name" content="${settings.global.meta.title}"/>
      <meta property="fb:admins" content="${settings.global.meta.fb_admin}"/>
      <meta property="og:image" content="${favicon}" />
      <meta property="og:image:secure_url" content="${favicon}" />
      <meta name="twitter:card" content="summary"/>
      <meta name="twitter:site" content="${settings.global.meta.twitter}"/>
      <meta name="twitter:creator" content="${settings.global.meta.twitter}"/>
      <meta name="google-site-verification" content="${settings.global.meta.google_site_verification}"/>
      <meta name="msvalidate.01" content="${settings.global.meta.ms_validate}"/>
      <link rel="icon" type="image/png" href="/favicon.png" />
  `
  const renderPage = ({homePage, mode}) => {
    let result = `
    <!DOCTYPE html>
    ${headers}
    <script>${ga}</script>
    <style>
      ${fonts}
      ${processedCss}
    </style>
    <script async defer src="//platform.twitter.com/widgets.js" charset="utf-8"></script>
    <script>
      ${resizerScript}
    </script>
    <script>
      ${js}
      CncfLandscapeApp.initialMode = '${mode}';
      CncfLandscapeApp.basePath = '${basePath}';
    </script>
    <body style="opacity: 0;">
      ${homePage}
    </body>
    `;
    for(let key in payload) {
      result = result.replace( '$$' + key + '$$', payload[key]);
    }
    return result;
  }

  for (let item of projects) {
    const result = render({settings, itemInfo: item, tweetsCount: processedLandscape.twitter_options.count});
    // console.info(`Rendering ${item.id}`);
    await fs.writeFile(path.resolve(distPath, `data/items/info-${item.id}.html`), result);
    await fs.writeFile(path.resolve(distPath, `data/items/full-${item.id}.html`), '<style>' + processedCss + '</style>' + result);
  }

  const homePageGuide = HomePageRenderer.render({settings, guidePayload: !!payload.guide, hasGuide: guideJson });
  await fs.writeFile(path.resolve(distPath, 'guide.html'), renderPage({homePage: homePageGuide, mode: 'guide'}));

  const homePage = HomePageRenderer.render({settings, bigPictureKey: 'main', hasGuide: guideJson});
  await fs.writeFile(path.resolve(distPath, 'index.html'), renderPage({homePage: homePage, mode: 'main'}));

  const cardsPage = HomePageRenderer.render({settings, hasGuide: guideJson});
  await fs.writeFile(path.resolve(distPath, 'card-mode.html'), renderPage({homePage: cardsPage, mode: 'card'}));
  await fs.writeFile(path.resolve(distPath, 'logo-mode.html'), renderPage({homePage: cardsPage, mode: 'card'}));
  await fs.writeFile(path.resolve(distPath, 'flat-mode.html'), renderPage({homePage: cardsPage, mode: 'card'}));
  await fs.writeFile(path.resolve(distPath, 'borderless-mode.html'), renderPage({homePage: cardsPage, mode: 'card'}));

  for (let key in settings.big_picture) {
    const landscapeSettingsEntry = settings.big_picture[key];
    if (key !== 'main') {
      const homePage = HomePageRenderer.render({settings, bigPictureKey: landscapeSettingsEntry.url, hasGuide: guideJson});
      await fs.writeFile(path.resolve(distPath, `${landscapeSettingsEntry.url}.html`),
        renderPage({homePage, mode: landscapeSettingsEntry.url }));
    }
    const fullscreenPage = `<style>
      ${fonts}
      ${processedCss}
    </style>
    <body>
      ${fullscreen[key]}
    </body>
    `;
    const fullscreenFile = key === 'main' ? 'index' : landscapeSettingsEntry.url;
    await fs.writeFile(path.resolve(distPath, `fullscreen/${fullscreenFile}.html`), fullscreenPage );
  }

  // embed
  const resizerHostJs = await fs.readFile(require.resolve('iframe-resizer/js/iframeResizer.min.js'), 'utf-8');
  const resizerConfig = await fs.readFile('src/iframeResizer.js');
  await fs.writeFile(path.resolve(distPath, 'iframeResizer.js'), resizerHostJs + "\n" + resizerConfig);
  const embed = `
    <!DOCTYPE html>
    <div>
      <h1>Testing how great is that embed </h1>
      <iframe frameBorder="0" id="landscape" scrolling="no" style="width: 1px; min-width: 100%;"
        src="${basePath}/card-mode?style=borderless&grouping=license&license=mit-license&embed=yes">
      </iframe>
      <script src="${basePath}/iframeResizer.js"></script>
      <h2>Wow, that was a cool embed.</h2>
    </div>
  `
  await fs.writeFile(path.resolve(distPath, 'embed.html'), embed);

  // embed page renderer
  const embeddedJs = await fs.readFile('src/embedded-script.js', 'utf-8');
  const renderEmbedPage = (page) => {
    let result = `
    <!DOCTYPE html>
    ${headers}
    <script>${ga}</script>
    <style>
      ${fonts}
      ${processedCss}
    </style>
    <script async defer src="//platform.twitter.com/widgets.js" charset="utf-8"></script>
    <script>
      ${resizerScript}
    </script>
    <script>
      ${embeddedJs}
    </script>
    <body class="embed">
      ${page}
    </body>
    `;
    return result;
  }
  for (let key in settings.prerender) {
    const url = settings.prerender[key];
    const embedded = EmbedPageRenderer.render({settings, items: projects, exportUrl: url });
    await fs.mkdir(path.resolve(distPath, `pages`), { recursive: true });
    await fs.writeFile(path.resolve(distPath, `pages/${key}.html`), renderEmbedPage(embedded));
  }


  // render acquistions


}
main();
