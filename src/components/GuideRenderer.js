const _ = require('lodash');

const { sizeFn } = require('../utils/landscapeCalculations');
const { renderItem } = require('./Item.js');
const { h } = require('../utils/format');
const { assetPath } = require('../utils/assetPath');
const icons = require('../utils/icons');



// guide is a guide index
module.exports.render = function({settings, items, guide}) {
  const currentBranch = require('child_process').execSync(`git rev-parse --abbrev-ref HEAD`, {
    cwd: require('../../tools/settings').projectPath
  }).toString().trim();


  const title = `<h1 className="title" style="margin-top: -5px;">${h(settings.global.short_name)} Landscape Guide</h1>`;
  const renderSubcategoryMetadata = ({ node, entries }) => {
    const orderedEntries = _.orderBy(entries,  (x) => -x.size);
    const projectEntries = entries.filter(entry => entry.project)
    return `
      ${ (node.buzzwords.length > 0 || projectEntries.length > 0) ? `<div class="metadata">
        <div class="header">
        <div>Buzzwords</div>
        <div>${h(settings.global.short_name)} Projects</div>
        </div>
        <div class="body">
          <div>
            <ul>
              ${ node.buzzwords.map(str => `<li>${h(str)}</li>`).join('') }
            </ul>
          </div>
          <div>
            <ul>
              ${ projectEntries.map(entry => `<li>${h(entry.name)} (${h(entry.project)})</li>`).join('') }
            </ul>
          </div>
        </div>
        </div> ` : '' }

      <div class="items">
        ${ orderedEntries.map(entry => renderItem(entry)).join('') }
      </div>
      `;
  };

  const renderNavigation = ({ nodes }) => {
    const links = nodes.filter(node => node.anchor)
    const parents = links
      .map(n => n.anchor.split('--')[0])
      .reduce((acc, n) => ({ ...acc, [n]: (acc[n] || 0) + 1}), {})

    return links
      .filter(({ title }) => {
        return title
      })
      .map(node => {
        const hasChildren = (parents[node.anchor] || 0) > 1
        return `
          <a href="#${node.anchor}" data-level="${node.level}" class="sidebar-link expandable" style="padding-left: ${10 + node.level * 10}px;">
            ${h(node.title)} ${hasChildren ? icons.expand : ''}
          </a>
          ${hasChildren ? `
            <a href="#${node.anchor}" data-level=${node.level + 1} class="sidebar-link" style="padding-left: 30px;"> Overview </a>
          ` : ''}
      `}).join('');
  }

  const renderLandscapeLink = ({ landscapeKey, title }) => {
    const href = `card-mode?category=${landscapeKey}`
    return `<a href="${href}" target="_blank" class="permalink">${icons.guide} ${h(title)} </a>`;
  }

  const renderContent = ({ nodes, enhancedEntries }) => {
    return nodes.map((node) => {
      const subcategoryEntries = node.subcategory && enhancedEntries.filter(entry => entry.path.split(' / ')[1].trim() === node.title) || [];
      return `<div>
        ${ node.title ?  `<div class="section-title" id="${h(node.anchor)}">
          <h2 data-variant="${node.level + 1}">
            ${ node.landscapeKey
                ? renderLandscapeLink({landscapeKey: node.landscapeKey, title: node.title})
                : h(node.title)
            }
          </h2>
        </div>
        ` : ''}
        ${ node.content ? `<div class="guide-content">${node.content}</div>` : ''}
        ${ node.subcategory ? renderSubcategoryMetadata({entries: subcategoryEntries,node:node}) : '' }
        </div>`;
    }).join('');
  }

  const enhancedEntries = items.map( (entry) => {
    let subcategory = entry.path.split(' / ')[1];
    let categoryAttrs = null;
    for (let key in settings.big_picture) {
      let page = settings.big_picture[key];
      for (let element of page.elements) {
        if (!page.category && element.category === entry.category) {
          categoryAttrs = element;
        }
        if (page.category === entry.category && element.category === subcategory) {
          categoryAttrs = element;
        }
      }
    }

    if (!categoryAttrs) {
      return null;
    }
    const enhanced = { ...entry, categoryAttrs }
    return { ...enhanced, size: sizeFn(enhanced) }
  }).filter( (x) => !!x);

  return `
      <div class="links">
        <div>
          <a href="${(settings.global.self_hosted_repo || false) ? "" : "https://github.com/"}${settings.global.repo}/edit/${currentBranch}/guide.md" target="_blank">
          ${icons.edit}
          Edit this page</a>
        </div>
        <div style="height: 5px;"></div>
          <div>
          <a href="${(settings.global.self_hosted_repo || false) ? "" : "https://github.com/"}${settings.global.repo}/issues/new?title=Guide Issue" target="_blank">
            ${icons.github}
          Report issue</a>
        </div>
      </div>
      <div class="side-content">
        <span class="landscape-logo">
          <a aria-label="reset filters" class="nav-link" href="/">
            <img alt="landscape logo" src="${assetPath("images/left-logo.svg")} ">
          </a>
        </span>
        <div class="guide-sidebar">
          <div class="sidebar-collapse">+</div>
          <div class="guide-toggle">
            <span class="toggle-item "><a href="./">Landscape</a></span>
            <span class="toggle-item active">Guide</span>
          </div>
          ${renderNavigation({nodes: guide})}
        </div>
      </div>

      <div class="guide-header">
        <div class="container">
          <div class="content">
            <button class="sidebar-show" role="none" aria-label="show sidebar">${icons.sidebar}</button>
            <span class="landscape-logo">
              <a aria-label="reset filters" class="nav-link" href="/">
                <img alt="landscape logo" src="${assetPath("/images/left-logo.svg")}">
              </a>
            </span>
            ${title}
          </div>
        </div>
        <a rel="noopener noreferrer noopener noreferrer"
          class="landscapeapp-logo"
          title="${h(settings.global.short_name)}"
          target="_blank"
          href="${settings.global.company_url}">
          <img src="${assetPath("images/right-logo.svg")}" title="${settings.global.short_name}">
        </a>
      </div>

      <div class="main-content">
        <div class="container">
          <div class="content">
            ${renderContent({nodes: guide,enhancedEntries: enhancedEntries})}
          </div>
        </div>
      </div>
    `;
}
