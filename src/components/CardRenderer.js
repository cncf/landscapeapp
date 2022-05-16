import _ from 'lodash';
import assetPath from '../utils/assetPath';
import { millify, h } from '../utils/format';
import fields from '../types/fields';

function getRelationStyle(relation) {
  const relationInfo = fields.relation.valuesMap[relation]
  if (relationInfo && relationInfo.color) {
    return `border: '4px solid ${relationInfo.color};`;
  } else {
    return '';
  }
}

export function renderDefaultCard({item}) {
  return `
          <div data-id="${h(item.id)}" class="mosaic-wrap">
            <div class="mosaic ${item.oss ? '' : 'nonoss' }" style="${getRelationStyle(item.relation)}">
              <div class="logo_wrapper">
                <img loading="lazy" src="${assetPath(item.href)}" class="logo" max-height="100%" max-width="100%" alt="${h(item.name)}" />
              </div>
              <div class="mosaic-info">
                <div class="mosaic-title">
                  <h5>${h(item.name)}</h5>
                  ${h(item.organization)}
                </div>
                <div class="mosaic-stars">
                  ${_.isNumber(item.stars) && item.stars ?
                      `<div>
                        <span>★</span>
                        <span style="position: relative; top: -3;">${h(item.starsAsText)}</span>
                      </div>` : ''
                  }
                  ${Number.isInteger(item.amount) ?
                      `<div class="mosaic-funding">${item.amountKind === 'funding' ? 'Funding: ': 'MCap: '} ${'$'+ h(millify(item.amount))}</div>` : ''
                  }
                </div>
              </div>
            </div>
          </div>
  `;
}

export function renderFlatCard({item}) {
  return `
            <div data-id="${item.id}" class="mosaic-wrap">
              <div class="mosaic">
                <img loading="lazy" src="${assetPath(item.href)}" class="logo" alt="${h(item.name)}" />
                <div class="separator"/>
                <h5>${h(item.flatName)}</h5>
              </div>
            </div>
  `;
}

export function renderBorderlessCard({item}) {
  return `
            <div data-id="${item.id}" class="mosaic-wrap">
              <div class="mosaic">
                <img loading="lazy" src="${assetPath(item.href)}" class="logo" alt="${h(item.name)}" />
              </div>
            </div>
  `;
}
