// struture:
// url: a name how the field appears in the url
// label: a header to the field in a select header
// groupingLabel(label by default): a name of the field in the grouping selector
// values: a list of possible values, strucutre:
//     id: value id for the select field
//     label: text in the select combo
//     groupingLabel(label by default): text in the grouping header
//     url(id by default): how the value is stored in the url
//     sortOrder(element index by default): sort order when grouping
//     match: function
const _ = require('lodash');

const { isParent } = require('../utils/isParent');
const { readJsonFromProject, readJsonFromDist } = require('../utils/readJson');

const lookups = readJsonFromProject('lookup');
const settings = readJsonFromDist('settings');

const relationField = (function() {
  const additionalRelations = settings.relation.values.flatMap(({ children }) => children || [])
    .reduce((obj, { id, additional_relation }) => {
      obj[id] = additional_relation;
      return obj;
    }, {});
  const rootEntry = {
    id: 'relation',
    url: 'project',
    label: settings.relation.label,
    isArray: true,
    filterFn: (filter, value) => {
      return filter.length === 0 || filter.includes(value) || filter.includes(additionalRelations[value]);
    },
    groupFn: ({ item, filters }) => {
      const { relation } = item;
      if ((filters.relation && filters.relation.includes(relation)) || !additionalRelations[relation]) {
        return relation;
      } else {
        return additionalRelations[relation];
      }
    }
  }
  const firstEntry = settings.relation.values[0];
  if (!firstEntry.children) {
    throw new Error('First entry of relation settings should have children!');
  }
  const options = [{
    id: firstEntry.id,
    label: firstEntry.label,
    tag: firstEntry.tag,
    url: firstEntry.url || firstEntry.id,
    level: 1,
    children: firstEntry.children.map( (x) => x.id)
  }].concat(firstEntry.children.map(function(child) {
    return {
      ...child,
      url: child.url || child.id,
      level: 2,
      parentId: firstEntry.id
    };
  })).concat(settings.relation.values.slice(1).map(function(entry) {
    return {
      ...entry,
      url: entry.url || entry.id,
      level: 1,
      children: []
    }
  }));

  return {
    ...rootEntry,
    values: options,
    processValuesBeforeSaving: (values) => processValuesBeforeSaving({options, values}),
    processValuesBeforeLoading: (values) => processValuesBeforeLoading({options, values})
  };

})();

const fields = {
  relation: relationField,
  stars: {
    id: 'stars',
    label: 'Stars',
  },
  license: {
    id: 'license',
    label: 'License',
    isArray: true,
    values: [].concat(lookups.license || []),
    processValuesBeforeSaving: function(values) {
      return processValuesBeforeSaving({options: fields.license.values, values: values});
    },
    processValuesBeforeLoading: function(values) {
      return processValuesBeforeLoading({options: fields.license.values, values: values});
    }
  },
  amount: {
    id: 'amount',
    label: 'Market Cap / Funding of organization',
  },
  organization: {
    id: 'organization',
    label: 'Organization',
    isArray: true,
    values: [].concat(lookups.organization || [])
  },
  headquarters: {
    id: 'headquarters',
    label: 'Headquarters Location',
    isArray: true,
    values: [].concat(lookups.headquarters || []),
    processValuesBeforeSaving: function(values) {
      return processValuesBeforeSaving({options: fields.headquarters.values, values: values});
    },
    processValuesBeforeLoading: function(values) {
      return processValuesBeforeLoading({options: fields.headquarters.values, values: values});
    }
  },
  companyType: {
    id: 'companyType',
    url: 'company-type',
    label: 'Company Type',
    isArray: true,
    values: [].concat(lookups.companyTypes || []),
    filterFn: function(filter, _, record) {
      if (!filter || filter.length === 0) {
        return true;
      }

      const companyType = (record.crunchbaseData || {}).company_type
      return companyType && filter.includes(companyType)
    }
  },
  industries: {
    id: 'industries',
    label: 'Industries',
    isArray: true,
    values: [].concat(lookups.industries || []),
    filterFn: function(filter, _, record) {
      if (!filter || filter.length === 0) {
        return true;
      }

      const { industries } = record
      return industries.length > 0 && !!industries.find(industry => filter.includes(industry));
    }
  },
  landscape: {
    id: 'landscape',
    url: 'category',
    label: 'Category',
    isArray: true,
    values: [].concat(lookups.landscape || []),
    processValuesBeforeSaving: function(values) {
      return processValuesBeforeSaving({options: fields.landscape.values, values: values});
    },
    processValuesBeforeLoading: function(values) {
      return processValuesBeforeLoading({options: fields.landscape.values, values: values});
    }
  },
  firstCommitDate: {
    id: 'firstCommitDate',
    label: 'Project Starting Date',
    url: 'first-commit',
    orderFn: function(x) {
      if (x.value) {
        return x.value;
      }
      return x;
    }
  },
  latestCommitDate: {
    id: 'latestCommitDate',
    label: 'Project Latest Date',
    url: 'latest-commit',
    orderFn: function(x) {
      if (x.value) {
        return x.value;
      }
      return x;
    }
  },
  latestTweetDate: {
    id: 'latestTweetDate',
    label: 'Latest Tweet Date',
    url: 'latest-tweet',
    orderFn: function(x) {
      if (!x) {
        return 'ZZZZZZ'; // put it to the end
      }
      if (x.value) {
        return x.value;
      }
      return x;
    }
  },
  contributorsCount: {
    id: 'contributorsCount',
    label: 'Contributors #',
    url: 'contributors'
  },
  commitsThisYear: {
    id: 'commitsThisYear',
    label: 'Commits this year',
    url: 'commits'
  },
  bestPracticePercentage: {
    id: 'bestPracticePercentage',
    label: 'Badge Id',
    url: 'bestpractices',
    filterFn: function(filter, value) {
      if (filter === null) {
        return true;
      }
      if (filter === true) {
        return value === 100;
      }
      if (filter === false) {
        return value !== 100;
      }
    },
    values: [{id: true, label: 'Yes', url: 'yes'}, {id: false, label: 'No', url: 'no'}]
  },
  enduser: {
    id: 'enduser',
    label: 'End User',
    url: 'enduser',
    filterFn: function(filter, value) {
      if (filter === null) {
        return true;
      }
      return filter === true ? value : !value;
    },
    values: [{id: true, label: 'Yes', url: 'yes'}, {id: false, label: 'No', url: 'no'}]
  },
  specification: {
    id: 'extra',
    label: 'Specification',
    url: 'specification',
    filterFn: function(filter, value, item) {
      if (filter === null) {
        return true;
      }
      const isSpecification = item.extra && (item.extra.specification === true || item.extra.specification === 'yes' || item.extra.specification === 'true');
      return filter === true ? isSpecification : !isSpecification;
    },
    values: [{id: true, label: 'Yes', url: 'yes'}, {id: false, label: 'No', url: 'no'}]
  },
  parents: {
    id: 'parent',
    url: 'parent',
    isArray: true,
    values: lookups.crunchbaseSlugs.map((id) => {
      return { id: id }
    }),
    filterFn: (parents, _, record) => parents.length === 0 || parents.find(parent => isParent(parent, record))
  },
  language: {
    id: 'language',
    url: 'language',
    values: lookups.languages.map( (id) => ({id: decodeURIComponent(id), url: id})).concat({
      id: false,
      url: 'no',
      label: 'No information'
    }),
    filterFn:  function(filter, value, record) {
      if (filter === false) {
        return !record.github_data || record.github_data.languages.length === 0;
      }
      if (!filter) {
        return true;
      }
      if (!(record.github_data || {}).languages) {
        return false;
      }
      return !! _.find(record.github_data.languages.slice(0, 7), { name: filter })
    }
  },
  joined: {
    id: 'joined',
    label: 'Date Joined',
    url: 'joined',
    orderFn: function(x) {
      if (x) {
        return x;
      } else {
        return '1990-01-01';
      }
    }
  },
};
_.each(fields, function(field, key) {
  field.id = key;
  _.defaults(field, {
    groupingLabel: field.label,
    url: field.id,
    answers: field.values,
    processValuesBeforeSaving: _.identity,
    processValuesBeforeLoading: _.identity
  });
  _.each(field.values, function(value, index) {
    _.defaults(value, {
      label: value.id,
      groupingLabel: value.label || value.id,
      url: value.id,
      groupingSortOrder: index
    });
  });
  _.each(field.answers, function(value, index) {
    _.defaults(value, {
      groupingSortOrder: index
    });
  });

  field.valuesMap = _.keyBy(field.values, 'id')
});
module.exports.fields = fields;

const processValuesBeforeLoading = function({options, values}) {
  return options.filter(function(option) {
    if (option.children) {
      return !_.every(option.children, function(childOptionId) {
        return values.indexOf(childOptionId) === -1
      }) || values.indexOf(option.id) !== -1;
    }
    const parentOption = _.find(options, {id: option.parentId});
    return values.indexOf(parentOption.id) !== -1 || values.indexOf(option.id) !== -1;
  }).map( (option) => option.id);
};

const processValuesBeforeSaving = function({options, values}) {
  // An edge case here, issue #404
  if (values.length === 1) {
    return values;
  }
  return values.filter(function(value) {
    const option = _.find(options, {id: value});
    // keep parent only if all children are checked
    if (option.children) {
      return _.every(option.children, function(childOptionId) {
        return values.indexOf(childOptionId) !== -1;
      });
    }
    // keep child only if any of childrens is not checked
    const parentOption = _.find(options, {id: option.parentId});
    return ! _.every(parentOption.children, function(childOptionId) {
      return values.indexOf(childOptionId) !== -1;
    });
  });
};

// passed to the client
function options(field) {
  return fields[field].values.map(function(values) {
    return {
      id: values.url,
      label: values.label,
      level: values.level || 1,
    };
  });
}
module.exports.options = options;

function filterFn({field, filters}) {
  const fieldInfo = fields[field];
  const filter = filters[field];
  return function(x) {
    // can be null, id, [] or [id1, id2, id3 ]
    const value = x[field];
    if (fieldInfo.filterFn) {
      return fieldInfo.filterFn(filter, value, x);
    }
    if (filter === null) {
      return true;
    }
    if (filter.length === 0) {
      return true;
    }
    if (_.isArray(filter)) {
      return filter.indexOf(value) !== -1;
    } else {
      return value === filter;
    }
  };
}
module.exports.filterFn = filterFn;

function getGroupingValue({item, grouping, filters}) {
  const { id, groupFn } = fields[grouping];
  return groupFn ? groupFn({ item , filters }) : item[id];
}
module.exports.getGroupingValue = getGroupingValue;

const sortOptions = [{
  id: 'name',
  direction: 'asc',
  label: 'Alphabetical (a to z)',
}, {
  id: 'stars',
  direction: 'desc',
  label: 'Stars (high to low)',
}, {
  id: 'amount',
  direction: 'desc',
  label: 'Funding / Market Cap (high to low)',
  disabled: settings.global.hide_funding_and_market_cap
}, {
  id: 'firstCommitDate',
  direction: 'asc',
  label: 'Project Started (earlier to later)',
}, {
  id: 'latestCommitDate',
  direction: 'asc',
  label: 'Latest Commit (earlier to later)',
}, {
  id: 'latestTweetDate',
  direction: 'asc',
  label: 'Latest Tweet (earlier to later)',
}, {
  id: 'contributorsCount',
  direction: 'desc',
  label: 'Contributors # (high to low)',
}, {
  id: 'commitsThisYear',
  direction: 'desc',
  label: 'Commits this year (high to low)',
},{
  id: 'joined',
  direction: 'desc',
  label: 'Date Joined',
  disabled: true
}]
module.exports.sortOptions = sortOptions;

