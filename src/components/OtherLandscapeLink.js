const { assetPath } = require('../utils/assetPath');
const { h } = require('../utils/format');

const { stringifyParams } = require('../utils/routing');
const { categoryBorder, categoryTitleHeight, subcategoryTitleHeight } = require('../utils/landscapeCalculations');

const renderCardLink = ({ url, children }) => {
  if (url.indexOf('http') === 0) {
    return `<a data-type=external target=_blank href="${url}" style="display: flex; flex-direction: column;">${children}</a>`;
  } else {
    url = stringifyParams({ mainContentMode: url });
    return `<a data-type=tab href="${url}" style="display: flex; flex-direction: column;">${children}</a>`;
  }
};

module.exports.renderOtherLandscapeLink = function({top, left, height, width, color, title, image, url, layout}) {
  title = title || ''; //avoid undefined!
  const imageSrc = image || assetPath(`images/${url}_preview.png`);
  if (layout === 'category') {
    return `<div style="
      position: absolute;
      top: ${top}px;
      left: ${left}px;
      height: ${height}px;
      width: ${width}px;
      background: ${color};
      overflow: hidden;
      cursor: pointer;
      box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
      padding: 1px;
      display: flex;
    ">
      ${renderCardLink({url: url, children: `
        <div style="width: ${width}px;height: 30px; line-height: 28px; text-align: center; color: white; font-size: 12px;">${h(title)}</div>
        <div style="flex: 1; background: white; position: relative; display: flex; justify-content: center; align-items: center;">
            <img loading="lazy" src="${imageSrc}" style="
              width: ${width - 12}px;
              height: ${height - 42}px;
              object-fit: contain;
              background-position: center;
              background-repeat: no-repeat;" alt="${h(title)}" />
        </div>`})}
  </div>`;
  }
  if (layout === 'subcategory') {
    return `<div style="
      width: ${width}px;
      left: ${left}px;
      height: ${height}px;
      top: ${top}px;
      position: absolute;
      overflow: hidden;">
      ${renderCardLink({url: url, children: `
        <div
          style="
            position: absolute;
            background: ${color};
            top: ${subcategoryTitleHeight}px;
            bottom: 0;
            left: 0;
            right: 0;
            boxShadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.2);
            padding: ${categoryBorder}px;
            display: flex;
          "
        >
          <div style="
            width: ${categoryTitleHeight}px;
            writing-mode: vertical-rl;
            transform: rotate(180deg);
            text-align: center;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            line-height: 13px;
            color: white;
          ">
            ${h(title)}
          </div>
          <div style="
            display: flex;
            flex: 1;
            background: white;
            justify-content: center;
            align-items: center; ">
              <img loading="lazy" src="${imageSrc}" alt="${h(title)}"
                  style="width: ${width - 42}px;
                         height: ${height - 32}px;
                         object-fit: contain;
                         background-position: center;
                         background-repeat: no-repeat;" />
          </div>
        </div>`})}
    </div>`
  }
}
