// Render only for an export
import _ from 'lodash';
import { h } from '../utils/format';
import getGroupedItems  from '../utils/itemsCalculator'
import { parseParams } from '../utils/routing'
import { renderDefaultCard, renderBorderlessCard, renderFlatCard } from './CardRenderer';

export function render({settings, items, exportUrl}) {
  const params = parseParams(exportUrl.split('?').slice(-1)[0]);
  const groupedItems = getGroupedItems({data: items, ...params})
  const cardStyle = params.cardStyle || 'default';
  const cardFn = cardStyle === 'borderless' ? renderBorderlessCard : cardStyle === 'flat' ? renderFlatCard : renderDefaultCard;
  const linkUrl = exportUrl.replace('&embed=yes', '').replace('embed=yes', '')

  const result = `
   <div class="modal" style="display: none;">
      <div class="modal-shadow" />
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
    <div id="home" class="${'app ' + cardStyle + '-mode' }">
      <div class="app-overlay" />
      <div class="main-parent">
        <div class="app-overlay"></div>
        <div class="main">
          <div class="cards-section">
            <div class="column-content" >
              ${ groupedItems.map( (groupedItem) => {
                const cardElements = groupedItem.items.map( (item) => cardFn({item}));
                const header = items.length > 0 ? `
                  <div class="sh_wrapper">
                    <div style="font-size: 24px; padding-left: 16px; line-height: 48px; font-weight: 500;">
                      <span>${h(groupedItem.header)}</span>
                      <span class="items-cont">&nbsp;(${groupedItem.items.length})</span>
                    </div>
                  </div>` : '';
                return [ header, ...cardElements].join('');
              })
              }
            </div>
          </div>
          <div id="embedded-footer">
            <h1 style="margin-top: 20px; width: 100%; text-align: center;">
              <a data-type="external" target="_blank" href="${linkUrl}">View</a> the full interactive landscape
            </h1>
          </div>
        </div>
      </div>
    </div>`;
};
