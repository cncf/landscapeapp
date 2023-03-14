const { assetPath }  = require('../utils/assetPath');
const { fields } = require("../types/fields");
const { h } = require('../utils/format');

const { readJsonFromDist } = require('../utils/readJson');
const settings = readJsonFromDist('settings');

const largeItem = function(item, alternativeLayout) {
  const relationInfo = fields.relation.valuesMap[item.relation]
  if (!relationInfo) {
    console.error(`no map for ${item.relation} on ${item.name}`);
  }
  const color = relationInfo.big_picture_color;
  const label = (relationInfo.big_picture_label_type.toLowerCase() === "item")
              ? item.display_name || item.name
              : relationInfo.big_picture_label;
  const label_color = relationInfo.big_picture_label_color || "white";
  const textHeight = label ? 10 : 0
  const padding = alternativeLayout ? 1 : 2

  const isMultiline = h(label).length > 20;
  const formattedLabel = isMultiline ? h(label).replace(' - ', '<br>') : h(label);

  return `
    <div data-id="${item.id}" class="large-item item" style="background: ${color}">
      <img loading="lazy" src="${assetPath(item.href)}" alt="${item.name}" style="
            width: calc(100% - ${2 * padding}px);
            height: calc(100% - ${2 * padding + textHeight}px);
            padding: 5px;
            margin: ${padding}px ${padding}px 0 ${padding}px;
      "/>
      <div class="label" style="
            position: absolute;
            bottom: 0;
            width: 100%;
            height: ${textHeight + padding + (isMultiline ? 6 : 0) }px;
            text-align: center;
            vertical-align: middle;
            background: ${color};
            color: ${label_color};
            font-size: ${alternativeLayout ? "12px" : "6.7px"};
            line-height: ${isMultiline ? 9 : 13 }px;
      ">${ formattedLabel }</div>
    </div>`;
}

const smallItem = function(item) {
  const isMember = item.category === settings.global.membership;
  return `
    <img data-id="${item.id}"
          loading="lazy"
          class="item small-item"
          src="${assetPath(item.href)}"
          alt="${h(item.name)}"
          style="border-color: ${isMember ? 'white' : ''};"
    />`
}

module.exports.renderItem =  function (item, alternativeLayout) {
  const {isLarge, category, oss, categoryAttrs } = item;
  const isMember = category === settings.global.membership;
  const ossClass = isMember || oss || (categoryAttrs.isLarge && !settings.global.flags?.gray_large_items) ? 'oss' : 'nonoss';
  const isLargeClass = isLarge ? 'wrapper-large' : '';

  return `<div class="${isLargeClass + ' item-wrapper ' + ossClass}">
    ${isLarge ? largeItem({isMember, ...item}, alternativeLayout) : smallItem({...item})}
  </div>`;
}
