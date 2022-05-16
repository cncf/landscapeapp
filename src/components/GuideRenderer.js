import { isLargeFn } from '../utils/landscapeCalculations'
import { renderItem }  from './Item.js'
import _ from 'lodash';
import { h } from '../utils/format';
import { guideIcon } from '../utils/icons';
import assetPath from '../utils/assetPath';



// landscapeSettings should be a main page
// guide is a guide index
export function render({settings, landscapeSettings, guide, entries }) {
  const title = `<h1 class="title">${settings.global.short_name} Landscape Guide</h1>`;
  const renderSubcategoryMetadata = ({ node, entries }) => {
    const orderedEntries = _.orderBy(entries,  (x) => !x.isLarge);
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
  }

  const renderNavigation = ({ nodes }) => {
    const links = nodes.filter(node => node.anchor)
    const parents = links
      .map(n => n.anchor.split('--')[0])
      .reduce((acc, n) => ({ ...acc, [n]: (acc[n] || 0) + 1}), {})

    return links
      .filter(({ title, level, anchor }) => {
        return title
      })
      .map(node => {
        const hasChildren = (parents[node.anchor] || 0) > 1
        return `
          <a href="#${node.anchor}" data-level=${node.level} class="sidebar-link expandable" style="padding-left: ${10 + level * 10} px;">
            ${h(node.title)} ${hasChildren ? `<svg viewBox="0 0 24 24"><path d="M10 17l5-5-5-5v10z"></path></svg> ` : ''}
          </a>
          ${hasChildren ? `
            <a href="#${node.anchor}" data-level=${node.level + 1} class="sidebar-link" style="padding-left: 30px;"> Overview </a>
          ` : ''}
      `}).join('');
  }

  const renderLandscapeLink = ({ landscapeKey, title }) => {
    const href = `card-mode?category=${landscapeKey}`
    return `<a href="${href}" target="_blank" class="permalink"> ${h(guideIcon)} ${h(title)} </a>`;
  }

  const renderContent = ({ nodes, enhancedEntries }) => {
    return nodes.map((node, idx) => {
      const subcategoryEntries = node.subcategory && enhancedEntries.filter(entry => entry.path.split(' / ')[1].trim() === node.title) || [];
      return `<div>
        ${ node.title ?  `<div class="section-title" id=${node.anchor}>
          <h2 data-variant=${node.level + 1}>
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

  const categories = landscapeSettings.elements.map(element => element).reduce((acc, category) => {
    return { ...acc, [category.category]: category }
  }, {})

  const enhancedEntries = entries.map(entry => {
    const categoryAttrs = categories[entry.category]
    if (!categoryAttrs) {
      return null;
    }
    const enhanced = { ...entry, categoryAttrs, isVisible: true }
    return { ...enhanced, isLarge: isLargeFn(enhanced) }
  }).filter ( (x) => !!x);

  return `
      <div class="side-content">
        <span class="landscape-logo">
          <a class="nav-link" href="/">
            <img src="${assetPath("images/left-logo.svg")} ">
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
            <button class="sidebar-show">
              <svg viewBox="0 0 24 24"><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"></path></svg>
            </button>
            <span class="landscape-logo">
              <a class="nav-link" href="/">
                <img src="${assetPath("/images/left-logo.svg")}">
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
            ${title}
            ${renderContent({nodes: guide,enhancedEntries: enhancedEntries})}
          </div>
        </div>
      </div>
    `
}
