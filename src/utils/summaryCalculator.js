import _ from 'lodash';
import { getItemsForExport, getLandscapeItems } from './itemsCalculator';
import { millify } from '../utils/format';
import formatNumber from '../utils/formatNumber';
import { findLandscapeSettings } from "./landscapeSettings";

import path from 'path';
import fs from 'fs';
import settings from 'dist/settings';

const getOrganizations = function(params) {
  const filteredItems = getItemsForExport(params);
  const result = {};
  _.each(filteredItems, function(item) {
    if (!result[item.organization]) {
      result[item.organization] = {
        name: item.organization,
        funding: item.amountKind === 'funding' ? item.amount : 0,
        marketCap: item.amountKind === 'market_cap' ? item.amount : 0
      }
    }
  });
  return _.values(result);
};

const getSummary = function(params) {
  const filteredItems = getItemsForExport(params);
  let filteredItemsByTab;
  if (params.format !== 'card') {
    const landscapeSettings = findLandscapeSettings(params.format);
    const landscapeItems = getLandscapeItems({
      items: filteredItems,
      landscapeSettings
    });
    filteredItemsByTab = landscapeItems.flatMap( (x) => x.subcategories.flatMap( (x) => x.items));
  } else {
    filteredItemsByTab = filteredItems;
  }


  const organizations = getOrganizations(params);
  const total = filteredItemsByTab.length;
  const stars = _.sum(_.map(filteredItemsByTab, (x) => _.isNumber(x.stars) ? x.stars : 0));
  const funding = settings.global.hide_funding_and_market_cap ? 0 : _.sumBy(organizations, 'funding');
  const marketCap = settings.global.hide_funding_and_market_cap ? 0 :_.sumBy(organizations, 'marketCap');
  return { total, stars, funding, marketCap };
}
export const getSummaryText = function(summary) {
  if (!summary.total) {
    return 'There are no cards matching your filters';
  }
  const cardsText = summary.total === 1 ? 'card' : 'cards';
  const startText = `You are viewing ${formatNumber(summary.total)} ${cardsText} with a total`;
  const starsSection = summary.stars ? `of ${formatNumber(summary.stars)} stars` : null;
  const marketCapSection = summary.marketCap ? `market cap of $${millify(summary.marketCap)}` : null;
  const fundingSection = summary.funding ? `funding of $${millify(summary.funding)}` : null;
  if (!marketCapSection && !fundingSection && !starsSection) {
    return `You are viewing ${formatNumber(summary.total)} ${cardsText}.`;
  }

  const parts = [starsSection, marketCapSection, fundingSection].filter( (x) => !!x);
  const startPartsText = _.slice(parts, 0, -1).join(', ');
  const lastPart = _.slice(parts, -1)[0];
  const text = [startPartsText, lastPart].filter( (x) => !!x).join(' and ');
  return `${startText} ${text}.`;

};
export default getSummary;
