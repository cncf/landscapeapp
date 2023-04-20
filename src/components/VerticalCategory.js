const { renderItem } = require("./Item");
const { h } = require('../utils/format');

const {
  calculateVerticalCategory,
  categoryTitleHeight,
  itemMargin, smallItemWidth,
  subcategoryMargin
} = require("../utils/landscapeCalculations");
const { renderSubcategoryInfo } = require( './SubcategoryInfo');
const { renderCategoryHeader } = require('./CategoryHeader');

module.exports.renderVerticalCategory = function({header, guideInfo, subcategories, top, left, width, height, color, href, fitWidth}) {
  const subcategoriesWithCalculations = calculateVerticalCategory({ subcategories, fitWidth, width });
  return `<div>
    <div style="
      position: absolute;
      top: ${top}px;
      left: ${left}px;
      height: ${height}px;
      width: ${width}px;
      background: ${color};
      box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.2);
      padding: 0px;
      display: flex;
      flex-direction: column;
    " class="big-picture-section">
      <div style="height: ${categoryTitleHeight}px; width: 100%; display: flex;">
        ${renderCategoryHeader({href: href, label: header, guideAnchor: guideInfo, background: color})}
      </div>
      <div style="
        width: 100%;
        position: relative;
        flex: 1;
        padding: ${subcategoryMargin}px 0;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        background: white
      ">
        ${subcategoriesWithCalculations.map(subcategory => {
          const { guideInfo, width, columns, name } = subcategory;
          const style = `
            display: grid;
            grid-template-columns: repeat(${columns}, ${smallItemWidth}px);
          `;
          const extraStyle = fitWidth ? `justify-content: space-evenly; flex: 1;` : `grid-gap: ${itemMargin}px; `

          return `<div style="
            position: relative;
            flex-grow: ${subcategory.rows};
            display: flex;
            flex-direction: column;">
              <div style="line-height: 15px; text-align: center;">
                <a data-type=internal href="${subcategory.href}">${h(name)}</a>
              </div>
            <div style="width: ${width}px; overflow: hidden; margin: 0 auto; ${style} ${extraStyle}">
              ${subcategory.allItems.map(renderItem).join('')}
              ${guideInfo ? renderSubcategoryInfo({label: name, anchor: guideInfo, column: columns}) : ''}
            </div>
          </div>`
        }).join('')}
      </div>
    </div>
  </div>`;
}
