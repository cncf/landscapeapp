import _ from 'lodash';
import React from 'react';
import ReactDOMServer from 'react-dom/server';

const OutboundLink = ({to, className, children}) =>
  (<a data-type="external" href={to} className={className}>{children}</a>)

export function render({settings, guidePayload, bigPictureKey}) {

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
                                <img src="images/left-logo.svg" />
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
      <div className="main-parent">
        <div className="header_container">
          <div  className="header">
            <span className="landscape-logo">
              <a className="nav-link" href="/">
                <img src="/images/left-logo.svg" />
              </a>
            </span>
            <a rel="noopener noreferrer noopener noreferrer"
            className="landscapeapp-logo"
            title={settings.global.short_name}
            target="_blank"
            href={settings.global.company_url}>
              <img src="/images/right-logo.svg" title={settings.global.short_name}/>
            </a>
          </div>
        </div>
        <div className="sidebar">
          <div className="sidebar-scroll">
            <div className="guide-toggle">
              <span className="toggle-item active">Landscape</span>
              <span className="toggle-item "><a href="/guide">Guide</a></span>
            </div>

            Filters, Grouping, Examples, CsvExport, AD
            <div className="sidebar-presets">
              { (settings.presets || []).map(preset =>
                <a data-type="internal" className="preset" href={preset.url}>
                  {preset.label}
                </a>
              )}
              { (settings.ads || []).map( (entry) => (
                  <OutboundLink className="sidebar-event" key={entry.image} to={entry.url} title={entry.title}>
                    <img src={entry.image} alt={entry.title} />
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
          <div id="summary" />
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
                <div className="inner-landscape" style={{padding: 10}} >
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
