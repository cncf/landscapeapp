import _ from 'lodash';
import { h } from '../utils/format';

import fields, { sortOptions, options } from '../types/fields'
import assetPath from '../utils/assetPath';

const renderSingleSelect = ({name, options, title}) => (
  `
    <div class="select" data-type="single" data-name="${name}" data-options="${h(JSON.stringify(options))}">
      <select class="select-text" required>
        <option value="1" selected>Value</option>
      </select>
      <span class="select-highlight"></span>
      <span class="select-bar"></span>
      <label class="select-label">${h(title)}</label>
    </div>
  `
)
const renderMultiSelect = ({name, options, title}) => (
  `
    <div class="select" data-type="multi" data-name="${name}" data-options="${h(JSON.stringify(options))}">
      <select class="select-text" required>
        <option value="1" selected>Value</option>
      </select>
      <span class="select-highlight"></span>
      <span class="select-bar"></span>
      <label class="select-label">${h(title)}</label>
    </div>
  `
)

const renderGroupingSelect = function() {
  const groupingFields = ['landscape', 'relation', 'license', 'organization', 'headquarters'];
  const options = [{
    id: 'no',
    label: 'No Grouping',
  }].concat(groupingFields.map(id => ({ id: fields[id].url, label: (fields[id].groupingLabel) })))
  return renderSingleSelect({name: "grouping",  options, title: "Grouping" });
}

const renderSortBySelect = function() {
  const options = sortOptions.filter( (x) => !x.disabled).map( (x) => ({
    id: (fields[x.id] || { url: x.id}).url || x.id, label: x.label
  }))
  return renderSingleSelect({name: "sort",  options, title: "Sort By" });
}

const renderFilterCategory = function() {
  return renderMultiSelect({name:"category", options: options('landscape'), title: 'Category'});
}

const renderFilterProject = function() {
  return renderMultiSelect({name:"project", options: options('relation'), title: 'Project'});
}

const renderFilterLicense = function() {
  return renderMultiSelect({name:"license",  options: options('license'), title: "License"});
}

const renderFilterOrganization = function() {
  return renderMultiSelect({name: "organization", options: options('organization'), title: "Organization"});
}

const renderFilterHeadquarters = function() {
  return renderMultiSelect({name: "headquarters", options: options('headquarters'), title: "Headquarters"});
}

const renderFilterCompanyType = function() {
  return renderMultiSelect({name: "company-type", options: options('companyType'),  title: "Company Type"});
}

const renderFilterIndustries = function() {
  return renderMultiSelect({name: "industries", options: options('industries'), title: "Industry"});
}

export function render({settings, guidePayload, hasGuide, bigPictureKey}) {
  const mainCard = [{shortTitle: 'Card', title: 'Card Mode', mode: 'card', url: 'card-mode', tabIndex: 0}]
  const landscapes = Object.values(settings.big_picture).map(function(section) {
    return {
      url: section.url,
      title: section.name,
      shortTitle: section.short_name,
      mode: section.url === settings.big_picture.main.url ? 'main' : section.url,
      tabIndex: section.tab_index
    }
  })
  const tabs = _.orderBy(mainCard.concat(landscapes), 'tabIndex').map( item => _.pick(item, ['title', 'mode', 'shortTitle', 'url']))


  return `
    <div class="select-popup" style="display: none;">
      <div class="select-popup-body" ></div>
    </div>
    <div class="modal" style="display: none;">
      <div class="modal-shadow" ></div>
      <div class="modal-container">
        <div class="modal-body">
          <div class="modal-buttons">
            <a class="modal-close">x</a>
            <span class="modal-prev"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"></path></svg></span>
            <span class="modal-next"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"></path></svg></span>
          </div>
          <div class="modal-content"></div>
        </div>
      </div>
    </div>
    <div id="guide-page" style="display: ${guidePayload ? "" : "none"};" data-loaded="${guidePayload ? "true" : ""}">
      ${ !guidePayload ? `<div class="side-content">
                            <span class="landscape-logo">
                              <a class="nav-link" href="/">
                                <img src="${assetPath("images/left-logo.svg")}" />
                              </a>
                            </span>
                            <div class="guide-sidebar">
                              <div class="sidebar-collapse">X</div>
                              <div class="guide-toggle">
                                <span class="toggle-item "><a href="./">Landscape</a></span>
                                <span class="toggle-item active">Guide</span>
                              </div>
                            </div>
                          </div>` : ''
      }
      ${ guidePayload ? "$$guide$$" : ''}
    </div>
    <div id="home" style="display: ${guidePayload ? "none" : ""}" class="app">
      <div class="app-overlay"></div>
      <div class="main-parent">
        <button class="sidebar-show">
          <svg viewBox="0 0 24 24"><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"></path></svg>
        </button>
        <div class="header_container">
          <div  class="header">
            <span class="landscape-logo">
              <a class="nav-link" href="/">
                <img src="${assetPath("images/left-logo.svg")}" />
              </a>
            </span>
            <a rel="noopener noreferrer noopener noreferrer"
            class="landscapeapp-logo"
            title="${h(settings.global.short_name)}"
            target="_blank"
            href="${settings.global.company_url}">
              <img src="${assetPath("/images/right-logo.svg")}" title="${h(settings.global.short_name)}" />
            </a>
          </div>
        </div>
        <div class="sidebar">
          <div class="sidebar-scroll">
            <div class="sidebar-collapse">+</div>
            ${ hasGuide ? `
              <div class="guide-toggle">
                <span class="toggle-item active">Landscape</span>
                <span class="toggle-item "><a href="/guide">Guide</a></span>
              </div> ` : ''
            }
            <a class="filters-action reset-filters">
              <svg viewBox="0 0 24 24"><path d="M14 12c0-1.1-.9-2-2-2s-2 .9-2 2 .9 2 2 2 2-.9 2-2zm-2-9c-4.97 0-9 4.03-9 9H0l4 4 4-4H5c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.51 0-2.91-.49-4.06-1.3l-1.42 1.44C8.04 20.3 9.94 21 12 21c4.97 0 9-4.03 9-9s-4.03-9-9-9z"/></svg>
              <span>Reset Filters</span>
            </a>
            ${renderGroupingSelect()}
            ${renderSortBySelect()}
            ${renderFilterCategory()}
            ${renderFilterProject()}
            ${renderFilterLicense()}
            ${renderFilterOrganization()}
            ${renderFilterHeadquarters()}
            ${renderFilterCompanyType()}
            ${renderFilterIndustries()}

            <a class="filters-action export">
              <svg viewBox="0 0 24 24">
                <path d="M17 1.01L7 1c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99zM17 19H7V5h10v14zm-1-6h-3V8h-2v5H8l4 4 4-4z"></path>
              </svg>
              <span>Download as CSV</span>
            </a>

            <div class="sidebar-presets">
              <h4>Example filters</h4>
              ${ (settings.presets || []).map(preset => `
                <a data-type="internal" class="preset" href="${preset.url}">
                  ${h(preset.label)}
                </a> `
              ).join('')}
              ${ (settings.ads || []).map( (entry) => `
                  <a data-type="external" target="_blank" class="sidebar-event" href="${entry.url}" title="${h(entry.title)}">
                    <img src="${assetPath(entry.image)}" alt="${entry.title}" />
                  </a>
              `).join('') }
            </div>

          </div>
        </div>
        <div class="app-overlay"></div>

        <div class="main">
          <div class="disclaimer">
            <span> ${settings.home.header} </span>
            Please <a data-type="external" target="_blank" class="https://github.com/${settings.global.repo}">open</a> a pull request to
            correct any issues. Greyed logos are not open source. Last Updated: ${process.env.lastUpdated}
          </div>
          <h4 class="summary"></h4>
          <div class="cards-section">
            <div class="big-picture-switch big-picture-switch-normal">
              ${ tabs.map( (tab) => `
                  <a href="${tab.url}" data-mode="${tab.mode}"><div>${h(tab.title)}</div></a>
                `).join('')}
            </div>

            <div class="right-buttons">
              <div class="fullscreen-exit">
                <svg viewBox="0 0 24 24"><path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"></path></svg>
              </div>
              <div class="fullscreen-enter">
                <svg viewBox="0 0 24 24"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"></path></svg>
              </div>
              <div class="zoom-out">
                <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11H7v-2h10v2z"></path></svg>
              </div>
              <div class="zoom-reset"></div>
              <div class="zoom-in">
                <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"></path></svg>
              </div>
            </div>

            ${ tabs.filter( (x) => x.mode !== 'card').map( (tab) => `
              <div data-mode="${tab.mode}" class="landscape-flex">
                <div class="landscape-wrapper">
                  <div class="inner-landscape" style="padding: 10px; display: none;">
                    ${ bigPictureKey === tab.mode ? '$$' + bigPictureKey + '$$' : ''}
                  </div>
                </div>
              </div>
            `).join('')}

            <div class="column-content"></div>
          </div>
          <div id="footer" style="
            margin-top: 10px;
            font-size: 9pt;
            width: '100%';
            text-align: center;">
              ${h(settings.home.footer)} For more information, please see the&nbsp;
            <a data-type="external" target="_blank" eventLabel="crunchbase-terms" href="https://github.com/${settings.global.repo}/blob/HEAD/README.md#license">
                license
              </a> info.
          </div>
          <div id="embedded-footer">
            <h1 style="margin-top: 20px; width: '100%'; text-align: center;">
              <a data-type="external" target="_blank" href="url">View</a> the full interactive landscape
            </h1>
          </div>
        </div>
      </div>
    </div>
  `;
}
