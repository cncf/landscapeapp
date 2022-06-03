const { renderItem } = require("./Item");
const { h } = require('../utils/format');
const {
  calculateHorizontalCategory,
  categoryBorder,
  categoryTitleHeight,
  dividerWidth,
  itemMargin,
  smallItemWidth,
  smallItemHeight,
  subcategoryMargin,
  subcategoryTitleHeight
} = require("../utils/landscapeCalculations");
const { renderSubcategoryInfo } = require('./SubcategoryInfo');
const { renderCategoryHeader } = require('./CategoryHeader');

const renderDivider = (color) => {
  const width = dividerWidth;
  const marginTop = 2 * subcategoryMargin;
  const height = `calc(100% - ${2 * marginTop}px)`;

  return `<div style="
    width: ${width}px;
    margin-top: ${marginTop}px;
    height: ${height};
    border-left: ${width}px solid ${color}
    "></div>`;
}

module.exports.renderHorizontalCategory = function({ header, guideInfo, subcategories, width, height, top, left, color, href, fitWidth }) {
  const addInfoIcon = !!guideInfo;
  const subcategoriesWithCalculations = calculateHorizontalCategory({ height, width, subcategories, fitWidth, addInfoIcon })
  const totalRows = Math.max(...subcategoriesWithCalculations.map(({ rows }) => rows))

  return `
    <div style="
      width: ${width}px;
      left: ${left}px;
      height: ${height}px;
      top: ${top}px;
      position: absolute;
      " class="big-picture-section">
      <div
        style="
          position: absolute;
          background: ${color};
          top: ${subcategoryTitleHeight}px;
          bottom: 0;
          left: 0;
          right: 0;
          box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.2);
          padding: ${categoryBorder}px;
        "
      >
        <div style="
          top: 0;
          bottom: 0;
          left: 0;
          width: ${categoryTitleHeight}px;
          position: absolute;
          writing-mode: vertical-rl;
          transform: rotate(180deg);
          text-align: center;
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          ${renderCategoryHeader({href, label: header, guideAnchor: guideInfo, background: color,rotate: true})}
        </div>
        <div style="
          margin-left: 30px;
          height: 100%;
          display: flex;
          justify-content: space-evenly;
          background: white;
        ">
          ${subcategoriesWithCalculations.map((subcategory, index) => {
            const lastSubcategory = index !== subcategories.length - 1
            const { allItems, guideInfo, columns, width, name, href } = subcategory
            const padding = fitWidth ? 0 : `${subcategoryMargin}px 0`;
            const style = `
              display: grid;
              height: 100%;
              grid-template-columns: repeat(${columns}, ${smallItemWidth}px);
              grid-auto-rows: ${smallItemHeight}px;
            `;
            const extraStyle = fitWidth ? `justify-content: space-evenly; align-content: space-evenly;` : `grid-gap: ${itemMargin}px;`;
            return `
              <div style="
                width: ${width}px;
                position: relative;
                overflow: visible;
                padding: ${padding};
                box-sizing: border-box;
              ">
                <div style="
                  position: absolute;
                  top: ${-1 * categoryTitleHeight}px;
                  left: 0;
                  right: 0;
                  height: ${categoryTitleHeight}px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  text-align: center;
                ">
                  <a data-type="internal" href="${href}" class="white-link">${h(name)}</a>
                </div>
                <div style="${style} ${extraStyle}">
                  ${allItems.map(renderItem).join('')}
                  ${guideInfo ? renderSubcategoryInfo({label: name, anchor: guideInfo,column: columns, row:totalRows}) : ''}
                </div>
              </div>
              ${lastSubcategory ? renderDivider(color) : ''}
              `
          }).join('')}
        </div>
      </div>
    </div>`;
}
