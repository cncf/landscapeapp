import createSelector from '../utils/createSelector';
import _ from 'lodash';
import fields, { filterFn, getGroupingValue } from '../types/fields';
import groupingLabel from '../utils/groupingLabel';
import groupingOrder from '../utils/groupingOrder';
import formatAmount from '../utils/formatAmount';
import formatNumber from 'format-number';
import { filtersToUrl } from '../utils/syncToUrl';
import stringOrSpecial from '../utils/stringOrSpecial';
import { getLandscapeCategories } from './sharedItemsCalculator';
import { findLandscapeSettings } from "./landscapeSettings";

const landscape = fields.landscape.values;

export const getFilteredItems = createSelector(
  [(state) => state.main.data,
    (state) => state.main.filters,
    (state) => state.main.mainContentMode
  ],
  function(data, filters, mainContentMode) {
    var filterHostedProject = filterFn({field: 'relation', filters});
    var filterByLicense = filterFn({field: 'license', filters});
    var filterByOrganization = filterFn({field: 'organization', filters});
    var filterByHeadquarters = filterFn({field: 'headquarters', filters});
    var filterByLandscape = mainContentMode === 'card' ? filterFn({field: 'landscape', filters}) : (x) => true;
    var filterByBestPractices = filterFn({field: 'bestPracticeBadgeId', filters});
    var filterByEnduser = filterFn({field: 'enduser', filters});
    var filterByParent = filterFn({field: 'parents', filters});
    var filterByLanguage = filterFn({field: 'language', filters});
    return data.filter(function(x) {
      return filterHostedProject(x) && filterByLicense(x) && filterByOrganization(x) && filterByHeadquarters(x) && filterByLandscape(x) && filterByBestPractices(x) && filterByEnduser(x) && filterByParent(x) && filterByLanguage(x);
    });
  }
);

const addExtraFields = function(data) {
    return _.map(data, function(data) {
      const hasStars = data.stars !== 'N/A' && data.stars !== 'Not Entered Yet';
      const hasMarketCap = data.amount !== 'N/A' && data.amount !== 'Not Entered Yet';
      return { ...data,
        starsPresent: hasStars ,
        starsAsText: hasStars ? formatNumber({integerSeparator: ','})(data.stars) : '',
        marketCapPresent: hasMarketCap,
        marketCapAsText: formatAmount(data.amount)
      };
    });
}

const getFilteredItemsForBigPicture = createSelector(
  [(state) => state.main.data,
  (state) => state.main.filters
  ],
  function(data, filters) {
    var filterHostedProject = filterFn({field: 'relation', filters});
    var filterByLicense = filterFn({field: 'license', filters});
    var filterByOrganization = filterFn({field: 'organization', filters});
    var filterByHeadquarters = filterFn({field: 'headquarters', filters});
    var filterByBestPractices = filterFn({field: 'bestPracticeBadgeId', filters});
    var filterByEnduser = filterFn({field: 'enduser', filters});
    var filterByParent = filterFn({field: 'parents', filters});
    var filterByLanguage = filterFn({field: 'language', filters});
    return addExtraFields(data.filter(function(x) {
      return filterHostedProject(x) && filterByLicense(x) && filterByOrganization(x) && filterByHeadquarters(x) && filterByBestPractices(x) && filterByEnduser(x) && filterByParent(x) && filterByLanguage(x);
    }));
  }
);

const getExtraFields = createSelector(
  [ getFilteredItems ], addExtraFields
);

const getSortedItems = createSelector(
  [
  getExtraFields,
  (state) => state.main.sortField,
  (state) => state.main.sortDirection
  ],
  function(data, sortField, sortDirection) {
    const fieldInfo = fields[sortField];
    const nonPublic = (x) => (x.name || '').toString().indexOf('Non-Public Organization') === 0;
    const emptyItemsNA = data.filter(function(x) {
      return x[sortField] === 'N/A';
    }).filter( (x) => !nonPublic(x));
    const emptyItemsNotEnteredYet = data.filter(function(x) {
      return x[sortField] === 'Not Entered Yet';
    }).filter( (x) => !nonPublic(x));
    const emptyItemsUndefined = data.filter(function(x) {
      return _.isUndefined(x[sortField]);
    }).filter( (x) => !nonPublic(x));
    const nonPublicOrganization = data.filter(nonPublic);
    const normalItems = data.filter(function(x) {
      return x[sortField] !== 'N/A' && x[sortField] !== 'Not Entered Yet' && !_.isUndefined(x[sortField]) && (x.name || '').toString().indexOf('Non-Public Organization') !== 0;
    });
    const sortedViaMainSort =  _.orderBy(normalItems, [function(x) {
      var result = x[sortField];
      if (fieldInfo && fieldInfo.orderFn) {
        result = fieldInfo.orderFn(result);
      }
      if (_.isString(result)) {
        result = result.toLowerCase();
      }
      return result;
    }, (x) => x.name.toLowerCase()],[sortDirection, 'asc']);
    const sortedViaName1 = _.orderBy(emptyItemsNA, function(x) {
      return x.name.toLowerCase();
    });
    const sortedViaName2 = _.orderBy(emptyItemsNotEnteredYet, function(x) {
      return x.name.toLowerCase();
    });
    const sortedViaName3 = _.orderBy(emptyItemsUndefined, function(x) {
      return x.name.toLowerCase();
    });
    const sortedViaName4 = _.orderBy(nonPublicOrganization, function(x) {
      return x.name.toLowerCase();
    });

    return sortedViaMainSort.concat(sortedViaName1).concat(sortedViaName2).concat(sortedViaName3).concat(sortedViaName4);
  }
);

const getGroupedItems = createSelector(
  [
  getSortedItems,
  (state) => state.main.grouping,
  (state) => state.main.filters,
  (state) => state.main.sortField
  ],
  function(items, grouping, filters, sortField) {
    if (grouping === 'no') {
      return [{
        key: 'key',
        header: 'No Grouping',
        items: items
      }]
    }

    let grouped = _.groupBy(items, function(item) {
      return getGroupingValue({item, grouping, filters});
    });

    const fieldInfo = fields[grouping];
    return _.orderBy(_.map(grouped, function(value, key) {
      const properKey = stringOrSpecial(key);
      const newFilters = {...filters, [grouping]: fieldInfo.isArray ? [properKey] : properKey};
      return {
        key: properKey,
        header: groupingLabel(grouping, properKey),
        items: value,
        href: filtersToUrl({filters: newFilters, grouping, sortField})
      }
    }), (group) => groupingOrder(grouping)(group.key));
  }
);

const bigPictureSortOrder = [
  function orderByProjectKind(item) {
    const result = _.find(fields.relation.values, {id: item.project});
    if (!result) {
      return 99;
    }
    return result.big_picture_order || 99;
  },
  function orderByAnimal(item) {
    return item.name.indexOf('Non-Public Organization ');
  },
  function orderByProjectName(item) {
    return item.name.toLowerCase();
  }
];

export const getGroupedItemsForBigPicture = function(state, landscapeSettings = null) {
  if (!landscapeSettings) {
    landscapeSettings = findLandscapeSettings(state.main.mainContentMode);
  }
  if (state.main.mainContentMode === 'card') {
    return [];
  } else if (landscapeSettings.url === 'landscape') {
    return getGroupedItemsForMainLandscape(state, landscapeSettings);
  } else {
    return getGroupedItemsForAdditionalLandscape(state, landscapeSettings)
  }
}

const getGroupedItemsForMainLandscape = createSelector(
  [ getFilteredItemsForBigPicture,
    (state) => state.main.data,
    (state) => state.main.grouping,
    (state) => state.main.filters,
    (state) => state.main.sortField,
    (state, landscapeSettings) => landscapeSettings
  ],
  function(items, allItems, grouping, filters, sortField, landscapeSettings) {
    const categories = getLandscapeCategories({landscapeSettings, landscape });
    return categories.map(function(category) {
      const newFilters = {...filters, landscape: category.id };
      return {
        key: stringOrSpecial(category.label),
        header: category.label,
        href: filtersToUrl({filters: newFilters, grouping: 'landscape', sortField, mainContentMode: 'card'}),
        subcategories: landscape.filter( (l) => l.parentId === category.id).map(function(subcategory) {
          const newFilters = {...filters, landscape: subcategory.id };
          return {
            name: subcategory.label,
            href: filtersToUrl({filters: newFilters, grouping: 'landscape', sortField, mainContentMode: 'card'}),
            items: _.orderBy(items.filter(function(item) {
              return item.landscape ===  subcategory.id
            }), bigPictureSortOrder),
            allItems: _.orderBy(allItems.filter(function(item) {
              return item.landscape ===  subcategory.id
            }), bigPictureSortOrder)
          };
        })
      };
    });
  }
);

const getGroupedItemsForAdditionalLandscape = createSelector([
     getFilteredItemsForBigPicture,
    (state) => state.main.data,
    (state) => state.main.grouping,
    (state) => state.main.filters,
    (state) => state.main.sortField,
    (state, landscapeSettings) => landscapeSettings
  ],
  function(items, allItems, grouping, filters, sortField, landscapeSettings) {
    const category = getLandscapeCategories({landscapeSettings, landscape})[0];
    const subcategories = landscape.filter(({ parentId }) => parentId === category.id);

    const itemsFrom = function(subcategoryId) {
      return _.orderBy(items.filter((item) => item.landscape ===  subcategoryId), bigPictureSortOrder)
    };

    const allItemsFrom = function(subcategoryId) {
      return _.orderBy(allItems.filter((item) => item.landscape ===  subcategoryId), bigPictureSortOrder)
    };

    const result = subcategories.map(function(subcategory) {
      const newFilters = {...filters, landscape: subcategory.id };
      return {
        key: stringOrSpecial(subcategory.label),
        header: subcategory.label,
        href: filtersToUrl({filters: newFilters, grouping: 'landscape', sortField, mainContentMode: 'card'}),
        subcategories: [
          {
            name: '',
            href: '',
            items: itemsFrom(subcategory.id),
            allItems: allItemsFrom(subcategory.id)
          }
        ]
      };
    });

    return result;
  }
);

export function getItemsForExport(state) {
  return _.flatten(getGroupedItems(state).map((x) => x.items));
}

export default getGroupedItems;
