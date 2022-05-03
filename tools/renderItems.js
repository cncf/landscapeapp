import path from 'path';
import  { settings, projectPath } from './settings.js';
import  { projects } from './loadData.js';
import { processedLandscape } from './processedLandscape.js';
import { render } from '../src/components/ItemDialogContentRenderer.js';
import * as CardRenderer from '../src/components/CardRenderer.js';
import * as LandscapeContentRenderer from '../src/components/LandscapeContentRenderer.js';
import * as HomePageRenderer from '../src/components/HomePageRenderer.js';
import * as GuideRenderer from '../src/components/GuideRenderer.js';
import * as EmbedPageRenderer from '../src/components/EmbedPageRenderer.js';
import { getLandscapeItems } from '../src/utils/itemsCalculator.js';
import fs from 'fs/promises';

async function main() {
  await fs.mkdir('public/data/items', { recursive: true});
  await fs.mkdir(path.join(projectPath, 'dist/items'), { recursive: true});

  const payload = {};

  let guideIndex = {};
  let guideJson = null;
  try {
    guideJson = JSON.parse(await fs.readFile('public/guide.json', 'utf-8'))
    guideIndex = guideJson.filter(section => section.landscapeKey)
      .reduce((accumulator, { category, subcategory, anchor }) => {
        const key = [category, subcategory].filter(_ => _).join(' / ')
        return { ...accumulator, [key]: anchor }
      }, {});
  } catch(ex) {}

  for (let key in settings.big_picture) {
    const landscapeSettings = settings.big_picture[key];
    landscapeSettings.isMain = key === 'main';
    const landscapeItems = getLandscapeItems({
      items: projects,
      landscapeSettings: landscapeSettings,
      guideIndex
    });
    const landscapeContent = LandscapeContentRenderer.render({
      landscapeItems: landscapeItems,
      landscapeSettings: landscapeSettings
    });
    await fs.writeFile(`public/data/items/landscape-${landscapeSettings.url}.html`, landscapeContent);

    payload[ key === 'main' ? 'main' : landscapeSettings.url] = landscapeContent;

    // render a guide too
    if (key === 'main') {
      const guideContent = GuideRenderer.render({
        settings,
        landscapeSettings,
        guide: guideJson,
        entries: projects
      });
      payload.guide = guideContent;
      await fs.writeFile(`public/data/items/guide.html`, guideContent);
    }
  }



  for (let item of projects) {
    const result = render({settings, itemInfo: item, tweetsCount: processedLandscape.twitter_options.count});
    // console.info(`Rendering ${item.id}`);
    await fs.writeFile(`public/data/items/info-${item.id}.html`, result);
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

  await fs.writeFile(`public/data/items/cards-card.html`, defaultCards);
  await fs.writeFile(`public/data/items/cards-logo.html`, defaultCards);
  await fs.writeFile(`public/data/items/cards-borderless.html`, borderlessCards);
  await fs.writeFile(`public/data/items/cards-flat.html`, flatCards);

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
  const resizerScript = await fs.readFile(require.resolve('iframe-resizer/js/iframeResizer.contentWindow.min.js'));
  const renderPage = ({homePage, mode}) => {
    let result = `<style>
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

  const homePageGuide = HomePageRenderer.render({settings, guidePayload: !!payload.guide });
  await fs.writeFile('public/guide.html', renderPage({homePage: homePageGuide, mode: 'guide'}));

  const homePage = HomePageRenderer.render({settings, bigPictureKey: 'main'});
  await fs.writeFile('public/index.html', renderPage({homePage: homePage, mode: 'main'}));

  const cardsPage = HomePageRenderer.render({settings});
  await fs.writeFile('public/card-mode.html', renderPage({homePage: cardsPage, mode: 'card'}));
  await fs.writeFile('public/logo-mode.html', renderPage({homePage: cardsPage, mode: 'card'}));
  await fs.writeFile('public/flat-mode.html', renderPage({homePage: cardsPage, mode: 'card'}));
  await fs.writeFile('public/borderless-mode.html', renderPage({homePage: cardsPage, mode: 'card'}));

  for (let key in settings.big_picture) {
    const landscapeSettings = settings.big_picture[key];
    if (key !== 'main') {
      const homePage = HomePageRenderer.render({settings, bigPictureKey: landscapeSettings.url});
      await fs.writeFile(`public/${landscapeSettings.url}.html`,
        renderPage({homePage, mode: landscapeSettings.url }));
    }
  }

  // embed
  const resizerHostJs = await fs.readFile(require.resolve('iframe-resizer/js/iframeResizer.min.js'), 'utf-8');
  const resizerConfig = await fs.readFile('src/iframeResizer.js');
  await fs.writeFile('public/iframeResizer.js', resizerHostJs + "\n" + resizerConfig);
  const embed = `
    <div>
      <h1>Testing how great is that embed </h1>
      <iframe frameBorder="0" id="landscape" scrolling="no" style="width: 1px; min-width: 100%;"
        src="/card-mode?style=borderless&grouping=license&license=mit-license&embed=yes">
      </iframe>
      <script src="/iframeResizer.js"></script>
      <h2>Wow, that was a cool embed.</h2>
    </div>
  `
  await fs.writeFile('public/embed.html', embed);

  // embed page renderer
  const embeddedJs = await fs.readFile('src/embedded-script.js', 'utf-8');
  const renderEmbedPage = (page) => {
    let result = `<style>
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
    await fs.mkdir(`public/pages`, { recursive: true });
    await fs.writeFile(`public/pages/${key}.html`, renderEmbedPage(embedded));
  }


}
main();
