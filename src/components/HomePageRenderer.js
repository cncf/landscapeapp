import _ from 'lodash';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import fields, { sortOptions, options } from '../types/fields'
import assetPath from '../utils/assetPath';

const OutboundLink = ({to, className, children}) =>
  (<a data-type="external" target="_blank" href={to} className={className}>{children}</a>)

const SingleSelect = ({name, options, title}) => (
            <div className="select" data-type="single" data-name={name} data-options={JSON.stringify(options)}>
              <select className="select-text" required>
                <option value="1" selected>Value</option>
              </select>
              <span className="select-highlight"></span>
              <span className="select-bar"></span>
              <label className="select-label">{title}</label>
            </div>
)
const MultiSelect = ({name, options, title}) => (
            <div className="select" data-type="multi" data-name={name} data-options={JSON.stringify(options)}>
              <select className="select-text" required>
                <option value="1" selected>Value</option>
              </select>
              <span className="select-highlight"></span>
              <span className="select-bar"></span>
              <label className="select-label">{title}</label>
            </div>
)

const GroupingSelect = function() {
  const groupingFields = ['landscape', 'relation', 'license', 'organization', 'headquarters'];
  const options = [{
    id: 'no',
    label: 'No Grouping',
  }].concat(groupingFields.map(id => ({ id: fields[id].url, label: fields[id].groupingLabel })))
  return <SingleSelect name="grouping" options={options} title="Grouping" />
}

const SortBySelect = function() {
  const options = sortOptions.filter( (x) => !x.disabled).map( (x) => ({
    id: (fields[x.id] || { url: x.id}).url || x.id, label: x.label
  }))
  return <SingleSelect name="sort" options={options} title="Sort By" />
}

const FilterCategory = function() {
  return <MultiSelect name="category" options={options('landscape')} title="Category" />;
}

const FilterProject = function() {
  return <MultiSelect name="project" options={options('relation')} title="Project" />;
}

const FilterLicense = function() {
  return <MultiSelect name="license" options={options('license')} title="License" />;
}

const FilterOrganization = function() {
  return <MultiSelect name="organization" options={options('organization')} title="Organization" />;
}

const FilterHeadquarters = function() {
  return <MultiSelect name="headquarters" options={options('headquarters')} title="Headquarters" />;
}

const FilterCompanyType = function() {
  return <MultiSelect name="company-type" options={options('companyType')} title="Company Type" />;
}

const FilterIndustries = function() {
  return <MultiSelect name="industries" options={options('industries')} title="Industry" />;
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


  const result = <>
    <div className="select-popup" style={{display: "none"}}>
      <div className="select-popup-body"/>
    </div>
    <div className="modal" style={{display: "none"}}>
      <div className="modal-shadow" />
      <div className="modal-container">
        <div className="modal-body">
          <div className="modal-buttons">
            <a className="modal-close">x</a>
            <span className="modal-prev"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"></path></svg></span>
            <span className="modal-next"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"></path></svg></span>
          </div>
          <div className="modal-content"></div>
        </div>
      </div>
    </div>
    <div id="guide-page" style={{display: guidePayload ? "" : "none"}} data-loaded={guidePayload ? "true" : ""}>
      { !guidePayload && <div className="side-content">
                            <span className="landscape-logo">
                              <a className="nav-link" href="/">
                                <img src={assetPath("images/left-logo.svg")} />
                              </a>
                            </span>
                            <div className="guide-sidebar">
                              <div className="sidebar-collapse">X</div>
                              <div className="guide-toggle">
                                <span className="toggle-item "><a href="./">Landscape</a></span>
                                <span className="toggle-item active">Guide</span>
                              </div>
                            </div>
                          </div>
      }
      { guidePayload && "$$guide$$" }
    </div>
    <div id="home" style={{display: guidePayload ? "none" : ""}} className="app">
      <div className="app-overlay" />
      <div className="main-parent">
        <button className="sidebar-show">
          <svg viewBox="0 0 24 24"><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"></path></svg>
        </button>
        <div className="header_container">
          <div  className="header">
            <span className="landscape-logo">
              <a className="nav-link" href="/">
                <img src={assetPath("images/left-logo.svg")} />
              </a>
            </span>
            <a rel="noopener noreferrer noopener noreferrer"
            className="landscapeapp-logo"
            title={settings.global.short_name}
            target="_blank"
            href={settings.global.company_url}>
              <img src={assetPath("/images/right-logo.svg")} title={settings.global.short_name}/>
            </a>
          </div>
        </div>
        <div className="sidebar">
          <div className="sidebar-scroll">
            <div className="sidebar-collapse">+</div>
            { hasGuide &&
              <div className="guide-toggle">
                <span className="toggle-item active">Landscape</span>
                <span className="toggle-item "><a href="/guide">Guide</a></span>
              </div>
            }
            <a className="filters-action reset-filters">
              <svg viewBox="0 0 24 24"><path d="M14 12c0-1.1-.9-2-2-2s-2 .9-2 2 .9 2 2 2 2-.9 2-2zm-2-9c-4.97 0-9 4.03-9 9H0l4 4 4-4H5c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.51 0-2.91-.49-4.06-1.3l-1.42 1.44C8.04 20.3 9.94 21 12 21c4.97 0 9-4.03 9-9s-4.03-9-9-9z"/></svg>
              <span>Reset Filters</span>
            </a>
            <GroupingSelect />
            <SortBySelect />
            <FilterCategory />
            <FilterProject />
            <FilterLicense />
            <FilterOrganization />
            <FilterHeadquarters />
            <FilterCompanyType />
            <FilterIndustries />
            <a className="filters-action export">
              <svg viewBox="0 0 24 24">
                <path d="M17 1.01L7 1c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99zM17 19H7V5h10v14zm-1-6h-3V8h-2v5H8l4 4 4-4z" />
              </svg>
              <span>Download as CSV</span>
            </a>
            <div className="sidebar-presets">
              <h4>Example filters</h4>
              { (settings.presets || []).map(preset =>
                <a data-type="internal" className="preset" href={preset.url}>
                  {preset.label}
                </a>
              )}
              { (settings.ads || []).map( (entry) => (
                  <OutboundLink className="sidebar-event" key={entry.image} to={entry.url} title={entry.title}>
                    <img src={assetPath(entry.image)} alt={entry.title} />
                  </OutboundLink>
              )) }
            </div>

          </div>
        </div>
        <div className="app-overlay"></div>

        <div className="main">
          <div className="disclaimer">
            <span  dangerouslySetInnerHTML={{__html: settings.home.header}} />
            Please <OutboundLink to={`https://github.com/${settings.global.repo}`}>open</OutboundLink> a pull request to
            correct any issues. Greyed logos are not open source. Last Updated: {process.env.lastUpdated}
          </div>
          <h4 className="summary" />
          <div className="cards-section">

            <div className="big-picture-switch big-picture-switch-normal">
              { tabs.map( (tab) => <a href={tab.url} data-mode={tab.mode} key={tab.mode}><div>{tab.title}</div></a> )}
            </div>

            <div className="right-buttons">
              <div className="fullscreen-exit">
                <svg viewBox="0 0 24 24"><path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"></path></svg>
              </div>
              <div className="fullscreen-enter">
                <svg viewBox="0 0 24 24"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"></path></svg>
              </div>
              <div className="zoom-out">
                <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11H7v-2h10v2z"></path></svg>
              </div>
              <div className="zoom-reset"></div>
              <div className="zoom-in">
                <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"></path></svg>
              </div>
            </div>

            { tabs.filter( (x) => x.mode !== 'card').map( (tab) =>
            <div data-mode={tab.mode} className="landscape-flex">
              <div className="landscape-wrapper">
                <div className="inner-landscape" style={{padding: 10, display: "none"}} >
                  { bigPictureKey === tab.mode && '$$' + bigPictureKey + '$$'}
                </div>
              </div>
            </div>
            )}

            <div className="column-content" />
          </div>
          <div id="footer" style={{ marginTop: 10, fontSize:'9pt', width: '100%', textAlign: 'center' }}>
            {settings.home.footer} For more information, please see the&nbsp;
            <OutboundLink eventLabel="crunchbase-terms" to={`https://github.com/${settings.global.repo}/blob/HEAD/README.md#license`}>
              license
              </OutboundLink> info.
          </div>
          <div id="embedded-footer">
            <h1 style={{ marginTop: 20, width: '100%', textAlign: 'center' }}>
              <OutboundLink to="url">View</OutboundLink> the full interactive landscape
            </h1>
          </div>
        </div>
      </div>
    </div>
    </>
    return ReactDOMServer.renderToStaticMarkup(result);
};
