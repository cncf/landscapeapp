const _ = require('lodash');
const { h } = require('../utils/format');
const { fields, sortOptions, options } = require('../types/fields');
const { assetPath } = require('../utils/assetPath');
const icons = require('../utils/icons');

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

module.exports.render = function({settings, guidePayload, hasGuide, bigPictureKey}) {
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
            <span class="modal-prev">${icons.prev}</span>
            <span class="modal-next">${icons.next}</span>
          </div>
          <div class="modal-content"></div>
        </div>
      </div>
    </div>
    <div id="guide-page" style="display: ${guidePayload ? "" : "none"};" data-loaded="${guidePayload ? "true" : ""}">
      ${ !guidePayload ? `<div class="side-content">
                            <span class="landscape-logo">
                              <a aria-label="reset filters" class="nav-link" href="/">
                                <img alt="landscape logo" src="${assetPath("images/left-logo.svg")}" />
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
        <button class="sidebar-show" role="none" aria-label="show sidebar">${icons.sidebar}</button>
        <div class="header_container">
          <div  class="header">
            <span class="landscape-logo">
              <a aria-label="reset filters" class="nav-link" href="/">
                <img alt="landscape logo" src="${assetPath("images/left-logo.svg")}" />
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
            <a class="filters-action reset-filters">${icons.reset}<span>Reset Filters</span>
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
              ${icons.export}
              <span>Download as CSV</span>
            </a>

            <div class="sidebar-presets">
              <h4>Example filters</h4>
              ${ (settings.presets || []).map(preset => `
                <a data-type="internal" class="preset" href="${preset.url}">
                  ${h(preset.label)}
                </a> `
              ).join('')}
            </div>
            ${ (settings.ads || []).map( (entry) => `
                <a data-type="external" target="_blank" class="sidebar-event" href="${entry.url}" title="${h(entry.title)}">
                  <img src="${assetPath(entry.image)}" alt="${entry.title}" />
                </a>
            `).join('') }

          </div>
        </div>
        <div class="app-overlay"></div>

        <div class="main">
          <div class="disclaimer">
            <span> ${settings.home.header} </span>
            Please <a data-type="external" target="_blank" href="${(settings.global.self_hosted_repo || false) ? "" : "https://github.com/"}${settings.global.repo}">open</a> a pull request to
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
              <div class="fullscreen-exit">${icons.fullscreenExit}</div>
              <div class="fullscreen-enter">${icons.fullscreenEnter}</div>
              <div class="zoom-out">${icons.zoomOut}</div>
              <div class="zoom-reset"></div>
              <div class="zoom-in">${icons.zoomIn}</div>
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
            width: 100%;
            text-align: center;">
              ${h(settings.home.footer)} For more information, please see the&nbsp;
            <a data-type="external" target="_blank" eventLabel="crunchbase-terms" href="${(settings.global.self_hosted_repo || false) ? "" : "https://github.com/"}${settings.global.repo}/blob/HEAD/README.md#license">
                license
              </a> info.
          </div>
          <div id="embedded-footer">
            <h1 style="margin-top: 20px; width: 100%; text-align: center;">
              <a data-type="external" target="_blank" href="url">View</a> the full interactive landscape
            </h1>
          </div>
        </div>
      </div>
    </div>
  `;
}
