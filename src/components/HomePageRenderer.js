import React from 'react';

const OutboundLink = ({to, className, children}) =>
  (<a data-type="external" href={to} className={className}>{children}</a>)

export function render({settings}) {
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
};
