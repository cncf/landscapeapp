// Render only for an export
import _ from 'lodash';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import getGroupedItems  from '../utils/itemsCalculator'
import { parseParams } from '../utils/routing'
import saneName from '../utils/saneName';
import { getDefaultCard, getBorderlessCard, getFlatCard } from './CardRenderer';

export function render({settings, items, exportUrl}) {
  const params = parseParams(exportUrl.split('?').slice(-1)[0]);
  const groupedItems = getGroupedItems({data: items, ...params})
  const cardStyle = params.cardStyle || 'default';
  const cardFn = cardStyle === 'borderless' ? getBorderlessCard : cardStyle === 'flat' ? getFlatCard : getDefaultCard;
  const linkUrl = exportUrl.replace('&embed=yes', '').replace('embed=yes', '')

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
    <div id="home" className={"app " + cardStyle + "-mode" }>
      <div className="app-overlay" />
      <div className="main-parent">
        <div className="app-overlay"></div>
        <div className="main">
          <div className="cards-section">
            <div className="column-content" >
              { groupedItems.map( (groupedItem) => {
                const cardElements = groupedItem.items.map( (item) => cardFn({item}));
                const header = items.length > 0 ?
                  <div className="sh_wrapper" data-wrapper-id={saneName(groupedItem.header)}>
                    <div style={{fontSize: '24px', paddingLeft: '16px', lineHeight: '48px', fontWeight: 500}}>
                      <span>{groupedItem.header}</span>
                      <span className="items-cont">&nbsp;({groupedItem.items.length})</span>
                    </div>
                  </div> : null
                return [ header, <div data-section-id={saneName(groupedItem.header)}>{cardElements}</div>];
              })
              }
            </div>
          </div>
          <div id="embedded-footer">
            <h1 style={{ marginTop: 20, width: '100%', textAlign: 'center' }}>
              <a data-type="external" target="_blank" href={linkUrl}>View</a> the full interactive landscape
            </h1>
          </div>
        </div>
      </div>
    </div>
    </>
    return ReactDOMServer.renderToStaticMarkup(result);
};
