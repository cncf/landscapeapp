import settings from 'project/settings.yml';
import createSelector from '../utils/createSelector';
import _ from 'lodash';
import { getItemsForExport } from './itemsCalculator';

const getOrganizations = createSelector(
  [ getItemsForExport ],
  function(filteredItems) {
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
  }
);

const getSummary = createSelector(
  [ getItemsForExport, getOrganizations],
  function(filteredItems, organizations) {
    const total = filteredItems.length;
    const stars = _.sum(_.map(filteredItems, (x) => _.isNumber(x.stars) ? x.stars : 0));
    const funding = settings.global.hide_funding_and_market_cap ? 0 : _.sumBy(organizations, 'funding');
    const marketCap = settings.global.hide_funding_and_market_cap ? 0 :_.sumBy(organizations, 'marketCap');
    return { total, stars, funding, marketCap };
  }
);
export default getSummary;
