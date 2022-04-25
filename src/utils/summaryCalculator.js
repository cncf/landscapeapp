import settings from 'public/settings.json';
import _ from 'lodash';
import { getItemsForExport } from './itemsCalculator';

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
  const organizations = getOrganizations(params);
  const total = filteredItems.length;
  const stars = _.sum(_.map(filteredItems, (x) => _.isNumber(x.stars) ? x.stars : 0));
  const funding = settings.global.hide_funding_and_market_cap ? 0 : _.sumBy(organizations, 'funding');
  const marketCap = settings.global.hide_funding_and_market_cap ? 0 :_.sumBy(organizations, 'marketCap');
  return { total, stars, funding, marketCap };
}
export default getSummary;
