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
import _ from 'lodash';
import lookups from 'project/lookup.json';
import unpack from '../utils/unpackArray';
import settings from 'project/settings.yml';

const relationField = (function() {
  const rootEntry = {
    id: 'relation',
    url: 'project',
    label: settings.relation.label,
    isArray: true
  }
  const firstEntry = settings.relation.values[0];
  if (!firstEntry.children) {
    throw new Error('First entry of relation settings should have children!');
  }
  const values = [{
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

  return { ...rootEntry, values: values};

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
    values: [].concat(unpack(lookups.license) || []),
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
    values: [].concat(unpack(lookups.organization) || [])
  },
  headquarters: {
    id: 'headquarters',
    label: 'Headquarters Location',
    isArray: true,
    values: [].concat(unpack(lookups.headquarters) || []),
    processValuesBeforeSaving: function(values) {
      return processValuesBeforeSaving({options: fields.headquarters.values, values: values});
    },
    processValuesBeforeLoading: function(values) {
      return processValuesBeforeLoading({options: fields.headquarters.values, values: values});
    }
  },
  landscape: {
    id: 'landscape',
    url: 'category',
    label: 'Category',
    isArray: true,
    values: [].concat(unpack(lookups.landscape) || []),
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
    },
    hideInGrouping: true
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
    },
    hideInGrouping: true
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
    },
    hideInGrouping: true
  },
  contributorsCount: {
    id: 'contributorsCount',
    label: 'Contributors #',
    url: 'contributors',
    hideInGrouping: true
  },
  bestPracticeBadgeId: {
    id: 'bestPracticeBadgeId',
    label: 'Badge Id',
    url: 'bestpractices',
    filterFn: function(filter, value) {
      if (filter === null) {
        return true;
      }
      if (filter === true) {
        return !!value;
      }
      if (filter === false) {
        return !value;
      }
    },
    values: [{id: true, label: 'Yes', url: 'yes'}, {id: false, label: 'No', url: 'no'}]
  }
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
});
export default fields;

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

export function options(field) {
  return fields[field].values.map(function(values) {
    return {
      id: values.id,
      label: values.label,
      level: values.level,
      children: values.children,
      parentId: values.parentId
    };
  });
}
export function filterFn({field, filters}) {
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
export function getGroupingValue({item, grouping}) {
  const fieldInfo = fields[grouping];
  const value = item[fieldInfo.id];
  return value;
}
