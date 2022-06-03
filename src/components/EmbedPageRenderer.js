// Render only for an export
const { saneName } = require('../utils/saneName');
const { h } = require('../utils/format');
const { getGroupedItems, expandSecondPathItems } = require('../utils/itemsCalculator');
const { parseParams } = require('../utils/routing');
const { renderDefaultCard, renderBorderlessCard, renderFlatCard } = require('./CardRenderer');
const icons = require('../utils/icons');

module.exports.render = function({items, exportUrl}) {
  const params = parseParams(exportUrl.split('?').slice(-1)[0]);
  if (params.grouping === 'landscape') {
    items = expandSecondPathItems(items);
  }
  const groupedItems = getGroupedItems({data: items, ...params})
  const cardStyle = params.cardStyle || 'default';
  const cardFn = cardStyle === 'borderless' ? renderBorderlessCard : cardStyle === 'flat' ? renderFlatCard : renderDefaultCard;
  const linkUrl = exportUrl.replace('&embed=yes', '').replace('embed=yes', '')

  const result = `
   <div class="modal" style="display: none;">
      <div class="modal-shadow"></div>
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
    <div id="home" class="app ${cardStyle}-mode">
      <div class="app-overlay"></div>
      <div class="main-parent">
        <div class="app-overlay"></div>
        <div class="main">
          <div class="cards-section">
            <div class="column-content" >
              ${ groupedItems.map( (groupedItem) => {
                const cardElements = groupedItem.items.map( (item) => cardFn({item}));
                const header = items.length > 0 ? `
                  <div class="sh_wrapper" data-wrapper-id="${h(saneName(groupedItem.header))}">
                    <div style="font-size: 24px; padding-left: 16px; line-height: 48px; font-weight: 500;">
                      <span>${h(groupedItem.header)}</span>
                      <span class="items-cont">&nbsp;(${groupedItem.items.length})</span>
                    </div>
                  </div>` : '';
                return [ header, `<div data-section-id="${h(saneName(groupedItem.header))}">${cardElements.join('')}</div>`].join('');
              }) }
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
  return result;
};
