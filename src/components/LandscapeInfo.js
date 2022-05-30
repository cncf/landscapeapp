const { h } = require('../utils/format');
const { assetPath } = require('../utils/assetPath');

module.exports.renderLandscapeInfo = function({width, height, top, left, children}) {
  children = children.map(function(info) {
    const positionStyle = `
        position: absolute;
        top: ${info.top}px;
        left: ${info.left}px;
        right: ${info.right}px;
        bottom: ${info.bottom}px;
        width: ${info.width}px;
        height: ${info.height}px;
    `;
    if (info.type === 'text') {
      return `<div key='text' style="
          ${positionStyle}
          font-size: ${info.font_size * 4}px;
          font-style: italic;
          text-align: justify;
          z-index: 1;
        "><div style="
          position: absolute;
          left: 0;
          top: 0;
          width: 400%;
          height: 100%;
          transform: scale(0.25);
          transform-origin: left;
        "> ${h(info.text)} </div></div>`;
    }
    if (info.type === 'title') {
      return `<div key='title' style="
        ${positionStyle}
        font-size: ${info.font_size}px;
        color: #666;
      ">${h(info.title)}</div>`;
    }
    if (info.type === 'image') {
      return `<img src="${assetPath(`images/${info.image}`)}" style="${positionStyle}" alt="${info.title || info.image}" />`;
    }
  }).join('');

  return `<div style="
    position: absolute;
    width: ${width}px;
    height: ${height - 20}px;
    top: ${top}px;
    left: ${left}px;
    border: 1px solid black;
    background: white;
    border-radius: 10px;
    margin-top: 20px;
    box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
  ">${children}</div>`
}
