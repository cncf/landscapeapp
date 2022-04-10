import React from 'react';
import ReactDOMServer from 'react-dom/server';

const OutboundLink = ({to, className, children}) =>
  (<a data-type="external" href={to} className={className}>{children}</a>)

export function render({settings}) {
  const result = <>
    <div className="modal" style={{display: "none"}}>
      <div className="modal-shadow" />
      <div className="modal-container">
        <div className="modal-body">
          <div className="modal-buttons">
            <a className="modal-close">×</a>
            <span className="modal-prev"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"></path></svg></span>
            <span className="modal-next"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"></path></svg></span>
          </div>
          <div className="modal-content"></div>
        </div>
      </div>
    </div>
    <div id="home" className="app">
      <div className="main-parent">
        <div className="sidebar">
          <div className="sidebar-scroll">
            Filters, Grouping, Examples, CsvExport, AD
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
            <span>Tabs</span>
            <div className="right-buttons">

            </div>
            <div className="landscape-flex">
              <div className="landscape-wrapper">
                <div className="inner-landscape" />
              </div>
            </div>

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
