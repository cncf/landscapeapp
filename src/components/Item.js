const path = require('path');
const fs = require('fs');
const { assetPath }  = require('../utils/assetPath');
const { fields } = require("../types/fields");
const { h } = require('../utils/format');
const { projectPath } = require('../../tools/settings');

const { readJsonFromDist } = require('../utils/readJson');
const settings = readJsonFromDist('settings');

const largeItem = function(item) {
  const relationInfo = fields.relation.valuesMap[item.relation]
  const color = relationInfo.big_picture_color;
  const label = relationInfo.big_picture_label;
  const textHeight = label ? 10 : 0
  const padding = 2

  const filePath = path.join(projectPath, item.href.replace('logos', 'cached_logos'));
  const fileContent = fs.readFileSync(filePath, 'base64');

  return `
    <div data-id="${item.id}" class="large-item item" style="background: ${color}">
      <img loading="lazy" src="data:image/svg+xml;base64,${fileContent}" style="
            width: calc(100% - ${2 * padding}px);
            height: calc(100% - ${2 * padding + textHeight}px);
            padding: 5px;
            margin: ${padding}px ${padding}px 0 ${padding}px;
      "/>
      <div class="label" style="
            position: absolute;
            bottom: 0;
            width: 100%;
            height: ${textHeight + padding}px;
            text-align: center;
            vertical-align: middle;
            background: ${color};
            color: white;
            font-size: 6.7px;
            line-height: 13px;
      ">${h(label)}</div>
    </div>`;
}

const smallItem = function(item) {
  const isMember = item.category === settings.global.membership;
  const filePath = path.join(projectPath, item.href.replace('logos', 'cached_logos'));
  const fileContent = fs.readFileSync(filePath, 'base64');
  return `
    <img data-id="${item.id}"
          loading="lazy"
          class="item small-item"
          src="data:image/svg+xml;base64,${fileContent}"
          alt="${h(item.name)}"
          style="border-color: ${isMember ? 'white' : ''};"
    />`
}

module.exports.renderItem =  function (item) {
  const {isLarge, category, oss, categoryAttrs } = item;
  const isMember = category === settings.global.membership;
  const ossClass = isMember || oss || categoryAttrs.isLarge ? 'oss' : 'nonoss';
  const isLargeClass = isLarge ? 'wrapper-large' : '';

  return `<div class="${isLargeClass + ' item-wrapper ' + ossClass}">
    ${isLarge ? largeItem({isMember, ...item}) : smallItem({...item})}
  </div>`;
}
