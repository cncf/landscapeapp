import React from 'react';
import ReactDOMServer from 'react-dom/server';
import _ from 'lodash';
import assetPath from '../utils/assetPath';
import { millify } from '../utils/format';
import fields from '../types/fields';

function getRelationStyle(relation) {
  const relationInfo = fields.relation.valuesMap[relation]
  if (relationInfo && relationInfo.color) {
    return {
      border: '4px solid ' + relationInfo.color
    };
  } else {
    return {};
  }
}

export function renderDefaultCard({item}) {
  return ReactDOMServer.renderToStaticMarkup(getDefaultCard({item}));
}

export function getDefaultCard({item}) {
  const card = (
          <div data-id={item.id} className="mosaic-wrap" key={item.id}>
            <div className={`mosaic ${item.oss ? '' : 'nonoss' }`} style={getRelationStyle(item.relation)}>
              <div className="logo_wrapper">
                <img loading="lazy" src={assetPath(item.href)} className='logo' max-height='100%' max-width='100%' alt={item.name} />
              </div>
              <div className="mosaic-info">
                <div className="mosaic-title">
                  <h5>{item.name}</h5>
                  {item.organization}
                </div>
                <div className="mosaic-stars">
                  { _.isNumber(item.stars) && item.stars &&
                      <div>
                        <span>★</span>
                        <span style={{position: 'relative', top: -3}}>{item.starsAsText}</span>
                      </div>
                  }
                  { Number.isInteger(item.amount) &&
                      <div className="mosaic-funding">{item.amountKind === 'funding' ? 'Funding: ': 'MCap: '} {'$'+ millify( item.amount )}</div>
                  }
                </div>
              </div>
            </div>
          </div>
  );
  return card;
}

export function renderFlatCard({item}) {
  return ReactDOMServer.renderToStaticMarkup(getFlatCard({item}));
}

export function getFlatCard({item}) {
  const card = (
            <div data-id={item.id} className="mosaic-wrap" key={item.id} >
              <div className="mosaic">
                <img loading="lazy" src={assetPath(item.href)} className='logo' alt={item.name} />
                <div className="separator"/>
                <h5>{item.flatName}</h5>
              </div>
            </div>
  );
  return card;
}

export function renderBorderlessCard({item}) {
  return ReactDOMServer.renderToStaticMarkup(getBorderlessCard({item}));
}

export function getBorderlessCard({item}) {
  const card = (
            <div data-id={item.id} className="mosaic-wrap" key={item.id}>
              <div className="mosaic">
                <img loading="lazy" src={assetPath(item.href)} className='logo' alt={item.name} />
              </div>
            </div>
  );
  return card;
}
