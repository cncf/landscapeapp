import _ from 'lodash';
import fields, { filterFn, getGroupingValue } from '../types/fields';
import groupingLabel from '../utils/groupingLabel';
import groupingOrder from '../utils/groupingOrder';
import formatAmount from '../utils/formatAmount';
import formatNumber from 'format-number';
import stringOrSpecial from '../utils/stringOrSpecial';
import { getLandscapeCategories } from './sharedItemsCalculator';
import { findLandscapeSettings } from "./landscapeSettings";
import { stringifyParams } from './routing'

const landscape = fields.landscape.values;

const groupAndSort = (items, sortCriteria) => {
  return _.groupBy(_.orderBy(items, sortCriteria), 'landscape')
}

export const getFilteredItems = function({data, filters}) {
    var filterHostedProject = filterFn({field: 'relation', filters});
    var filterByLicense = filterFn({field: 'license', filters});
    var filterByOrganization = filterFn({field: 'organization', filters});
    var filterByHeadquarters = filterFn({field: 'headquarters', filters});
    var filterByLandscape = filterFn({field: 'landscape', filters});
    var filterByBestPractices = filterFn({field: 'bestPracticePercentage', filters});
    var filterByEnduser = filterFn({field: 'enduser', filters});
    var filterByParent = filterFn({field: 'parents', filters});
    var filterByLanguage = filterFn({field: 'language', filters});
    var filterByCompanyType = filterFn({field: 'companyType', filters});
    var filterByIndustries = filterFn({field: 'industries', filters});
    return data.filter(function(x) {
      return filterHostedProject(x) && filterByLicense(x) && filterByOrganization(x) && filterByHeadquarters(x) && filterByLandscape(x) && filterByBestPractices(x) && filterByEnduser(x) && filterByParent(x) && filterByLanguage(x) && filterByCompanyType(x) && filterByIndustries(x);
    });
}

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

const getExtraFields = function({data, filters}) {
  const filtered = getFilteredItems({data, filters});
  return addExtraFields(filtered);
}

const getSortedItems = function({data, filters, sortField, sortDirection}) {
  data = getExtraFields({data, filters });

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

const getGroupedItems = function({ data, filters, sortField, sortDirection, grouping }) {
  const items = getSortedItems({ data, filters, sortField, sortDirection });

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
      href: stringifyParams({filters: newFilters, grouping, sortField})
    }
  }), (group) => groupingOrder(grouping)(group.key));
}

const bigPictureSortOrder = [
  function orderByProjectKind(item) {
    const result = fields.relation.valuesMap[item.project]
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

export function getLandscapeItems({landscapeSettings, items, guideIndex = {}}) {
  if (landscapeSettings.isMain) {
    const categories = getLandscapeCategories({landscapeSettings, landscape });
    const itemsMap = groupAndSort(items, bigPictureSortOrder);

    return categories.map(function(category) {
      const newFilters = { landscape: category.id };
      return {
        key: stringOrSpecial(category.label),
        header: category.label,
        guideInfo: guideIndex[category.label],
        href: stringifyParams({
          filters: newFilters,
          grouping: 'landscape',
          mainContentMode: 'card-mode'
        }),
        subcategories: landscape.filter( (l) => l.parentId === category.id).map(function(subcategory) {
          const newFilters = { landscape: subcategory.id };
          return {
            name: subcategory.label,
            guideInfo: guideIndex[[category.label, subcategory.label].join(' / ')],
            href: stringifyParams({
              filters: newFilters,
              grouping: 'landscape',
              mainContentMode: 'card-mode'
            }),
            items: itemsMap[subcategory.id] || [],
            allItems: itemsMap[subcategory.id] || []
          };
        })
      };
    });
  } else {
    const category = getLandscapeCategories({landscapeSettings, landscape})[0];
    const subcategories = landscape.filter(({ parentId }) => parentId === category.id);

    const itemsMap = groupAndSort(items, bigPictureSortOrder)

    const result = subcategories.map(function(subcategory) {
      const newFilters = { landscape: subcategory.id };
      return {
        key: stringOrSpecial(subcategory.label),
        header: subcategory.label,
        href: stringifyParams({filters: newFilters, grouping: 'landscape', mainContentMode: 'card'}),
        subcategories: [
          {
            name: '',
            href: '',
            items: itemsMap[subcategory.id] || [],
            allItems: itemsMap[subcategory.id]
          }
        ]
      };
    });

    return result;
  }
}

export const flattenItems = groupedItems => {
  return groupedItems.flatMap(group => {
    const { items, subcategories } = group
    return group.hasOwnProperty('items') ? items : subcategories.flatMap(({ items }) => items)
  })
}

export function getItemsForExport(params) {
  return _.flatten(getGroupedItems(params).map((x) => x.items));
}

export default getGroupedItems;
