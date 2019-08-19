import { projectPath, settings } from './settings';
console.info('processed', projectPath);
const source = require('js-yaml').safeLoad(require('fs').readFileSync(`${projectPath}/processed_landscape.yml`));
const traverse = require('traverse');
const _ = require('lodash');

import actualTwitter from './actualTwitter';
import saneName from '../src/utils/saneName';
import formatCity from '../src/utils/formatCity';
import pack from '../src/utils/packArray';

function sortFn(x) {
  if (_.isString(x)) {
    return x.trim().toLowerCase();
  }
  return x;
}

const formatDate = function(x) {
  let result;
  if (!x) {
    result =  x;
  }
  const delta = new Date().getTime() - new Date(x).getTime();
  const day = 86400 * 1000;
  if (delta < 7 * day) {
    result = {text: 'this week', value: '990'};
  }
  else if (delta < 14 * day) {
    result = {text: 'last week', value: '980'}
  }
  else if (delta < 21 * day) {
    result = {text: '3 weeks ago', value: '970'}
  }
  else if (delta < (30 * 1 + 15) * day) {
    result = {text: 'about a month', value: '960'}
  }
  else if (delta < (30 * 2 + 15) * day) {
    result = {text: '2 months ago', value: '950'}
  }
  else if (delta < (30 * 3 + 15) * day) {
    result = {text: '3 months ago', value: '940'}
  }
  else if (delta < (30 * 4 + 15) * day) {
    result = {text: '4 months ago', value: '930'}
  }
  else if (delta < (30 * 5 + 15) * day) {
    result = {text: '5 months ago', value: '920'}
  }
  else if (delta < (30 * 6 + 15) * day) {
    result = {text: '6 months ago', value: '910'}
  }
  else if (delta < (30 * 7 + 15)  * day) {
    result = {text: '7 months ago', value: '900'}
  }
  else if (delta < (30 * 8 + 15) * day) {
    result = {text: '8 months ago', value: '890'}
  }
  else if (delta < (30 * 9 + 15) * day) {
    result = {text: '9 months ago', value: '880'}
  }
  else if (delta < (30 * 10 + 15) * day) {
    result = {text: '10 months ago', value: '870'}
  }
  else if (delta < (30 * 11 + 15) * day) {
    result = {text: '11 months ago', value: '860'}
  } else {
    result = x;
  }
  if (result && result.text) {
    result.original = x;
  }
  return result;
};

const items = [];
const tree = traverse(source);
tree.map(function(node) {
  if (node && node.item === null) {
    const parts = this.parents.filter(function(p) {
      return p.node.category === null || p.node.subcategory === null;
    }).map(function(p) {
      return p.node.name;
    });
    const getHeadquarters = function() {
      let result = null;
      if (node.crunchbase_data) {
        result = formatCity(node.crunchbase_data);
      }
      if (!result) {
        result = 'N/A';
      }
      return result;
    };
    const getTwitter = function() {
      return actualTwitter(node, node.crunchbase_data);
    };
    const getDescription = function() {
      if (! _.isUndefined(node.description)) {
        return node.description;
      }
      if (node.github_data && node.github_data.description) {
        return node.github_data.description;
      }
      if (node.crunchbase_data && node.crunchbase_data.description) {
        return node.crunchbase_data.description;
      }
      return null;
    };
    const getLicense = function() {
      if ((node.hasOwnProperty('open_source') && !node.open_source) || !node.repo_url) {
        return 'NotOpenSource';
      }

      if (node.github_data) {
        return node.github_data.license;
      }

      return 'Unknown License';
    }
    const getAmount = function() {
      if (node.yahoo_finance_data) {
        return node.yahoo_finance_data.market_cap;
      }
      if (node.crunchbase_data) {
        return node.crunchbase_data.funding;
      }
      return 'N/A';
    }
    const getTicker = function() {
      if (node.yahoo_finance_data) {
        return node.yahoo_finance_data.marketCap;
      }
      return (node.crunchbase_data || {}).effective_ticker;
    };

    const getCommitLink = function(link) {
      if (!link) {
        return null;
      }
      return 'https://github.com' + link;
    }

    const {relation, isSubsidiaryProject} = (function() {
      let result;
      result = node.project === 'sandbox' && settings.global.flags.cncf_sandbox ? 'member' : node.project;
      if (result) {
        return {relation: result, isSubsidiaryProject: false};
      }
      if (node.membership_data.member) {
        return {relation: 'member', isSubsidiaryProject: false};
      }
      if (node.crunchbase === settings.global.self) {
        return {relation: 'member', isSubsidiaryProject: true};
      }
      return {relation: false, isSubsidiaryProject: false};
    })();

    if (node.repo_url) {
      console.log(node.repo_url, getLicense())
    }

    items.push({...node,
      project: node.project,
      member: node.membership_data.member,
      relation: relation,
      isSubsidiaryProject: isSubsidiaryProject,
      firstCommitDate: formatDate((node.github_start_commit_data || {}).start_date),
      firstCommitLink: getCommitLink((node.github_start_commit_data || {}).start_commit_link),
      latestCommitDate: formatDate((node.github_data || {}).latest_commit_date),
      latestCommitLink: getCommitLink((node.github_data || {}).latest_commit_link),
      releaseDate: formatDate((node.github_data || {}).release_date),
      releaseLink: (node.github_data || {}).release_link,
      contributorsCount: (node.github_data || {}).contributors_count,
      contributorsLink: (node.github_data || {}).contributors_link,
      stars: (node.github_data || {}).stars,
      license: getLicense(),
      headquarters: getHeadquarters(),
      twitter: getTwitter(),
      latestTweetDate: formatDate((node.twitter_data || {}).latest_tweet_date),
      description: getDescription(),
      organization: (node.crunchbase_data || {}).name || node.organization,
      crunchbaseData: node.crunchbase_data,
      path: parts.join(' / '),
      landscape: parts.join(' / '),
      category: parts[0],
      amountKind: (node.crunchbase_data || {}).kind,
      amount: getAmount(),
      ticker: getTicker(),
      oss: getLicense() !== 'NotOpenSource',
      href: `logos/${(node.image_data || {}).fileName}`,
      bestPracticeBadgeId: (node.best_practice_data || {}).badge,
      bestPracticePercentage: (node.best_practice_data || {}).percentage
    });
  }
});
const itemsWithExtraFields = items.map(function(item) {
  const getLinkedin = function(el) {
    if (!el.linkedin) {
      return null;
    }
    return el.linkedin.replace(/\?.*/, '');
  }
  if (item.crunchbase_data) {
    item.crunchbaseData.numEmployeesMin = item.crunchbaseData.num_employees_min;
    item.crunchbaseData.numEmployeesMax = item.crunchbaseData.num_employees_max;
    item.crunchbaseData.tickerSymbol = item.crunchbaseData.ticker_symbol;
    item.crunchbaseData.linkedin = getLinkedin(item.crunchbaseData);
  }
  delete item.crunchbase_data;
  delete item.twitter_data;
  if (item.crunchbaseData) {
    delete item.crunchbaseData.num_employees_min;
    delete item.crunchbaseData.num_employees_max;
    delete item.crunchbaseData.ticker_symbol;
  }
  delete item.best_practice_data;
  delete item.membership_data;
  delete item.market_cap;
  delete item.first_commit_date;
  delete item.latest_commit_date;
  delete item.release_date;
  delete item.release_link;
  delete item.first_commit_link;
  delete item.latest_commit_link;
  delete item.item;
  const id = saneName(item.name);
  return {
    ...item,
    id: id,
  }
});

if (settings.global.flags.companies) {
// Handle companies in a special way
  const hasCompanyCategory = (function() {
    var result = false;
    tree.map(function(node) {
      if (node && node.category === null && node.name === settings.global.flags.companies) {
        result = true;
      }
    });
    return result;
  })();
  if (!hasCompanyCategory) {
    console.info(`FATAL: can not find a category with name: "${settings.global.flags.companies}". We use that category to get a list of member companies`);
    process.exit(1);
  }

  _.each(itemsWithExtraFields, function(item) {
    if (item.category === settings.global.flags.companies) {
      item.project = 'company';
      item.relation = 'company';
    }
  });
}

if (settings.global.flags.hide_license_for_categories) {
  _.each(itemsWithExtraFields, function(item) {
    if (settings.global.flags.hide_license_for_categories.indexOf(item.category) !== -1) {
      item.hideLicense = true;
    }
  });
}


// protect us from duplicates
var hasDuplicates = false;
_.values(_.groupBy(itemsWithExtraFields, 'name')).forEach(function(duplicates) {
  if (duplicates.length > 1) {
    hasDuplicates = true;
    _.each(duplicates, function(duplicate) {
      console.error(`FATAL ERROR: Duplicate item: ${duplicate.organization} ${duplicate.name} at path ${duplicate.path}`);
    });
  }
});
if (hasDuplicates) {
  require('process').exit(1);
}

// protect us from duplicate repo_urls
var hasDuplicateRepos = false;
_.values(_.groupBy(itemsWithExtraFields.filter( (x) => !!x.repo_url), 'repo_url')).forEach(function(duplicates) {
  if (duplicates.length > 1) {
    hasDuplicateRepos = true;
    _.each(duplicates, function(duplicate) {
      console.error(`FATAL ERROR: Duplicate repo: ${duplicate.repo_url} on ${duplicate.name} at path ${duplicate.path}`);
    });
  }
});
if (hasDuplicateRepos) {
  require('process').exit(1);
}

var hasEmptyCrunchbase = false;
_.each(itemsWithExtraFields, function(item) {
  if (!item.crunchbaseData) {
    hasEmptyCrunchbase = true;
    console.info(`FATAL ERROR: ${item.name} either has no crunchbase entry or it is invalid`);
  }
});
if (hasEmptyCrunchbase) {
  require('process').exit(1);
}

var hasBadCrunchbase = false;
_.each(itemsWithExtraFields, function(item) {
  if (item.crunchbase.indexOf('https://www.crunchbase.com/organization/') !== 0 && item.crunchbase !== 'https://www.cncf.io') {
    hasBadCrunchbase = true;
    console.info(`FATAL ERROR: ${item.name}  has a crunchbase ${item.crunchbase} which does not start with 'https://www.crunchbase.com/organization'`);
  }
});
if (hasBadCrunchbase) {
  require('process').exit(1);
}

var hasBadHomepage = false;
_.each(itemsWithExtraFields, function(item) {
  if (!item.homepage_url) {
    hasBadHomepage = true;
    console.info(`FATAL ERROR: ${item.name}  has an empty or missing homepage_url`);
  }
});
if (hasBadHomepage) {
  require('process').exit(1);
}

_.each(itemsWithExtraFields, function(item) {
  if (item.twitter && !item.latestTweetDate) {
    if (item.latestTweetDate === null) {
      console.info(`Warning: ${item.name} has a twitter ${item.twitter} with no entries`);
    } else {
      console.info(`Warning: ${item.name} has a twitter ${item.twitter} which is invalid or we just can not fetch its tweets`);
    }
  }
});

var hasWrongTwitterUrls = false;
_.each(itemsWithExtraFields, function(item) {
  if (item.twitter && item.twitter.split('/').slice(-1)[0] === '') {
    console.info(`Fatal: ${item.name} has a twitter ${item.twitter} which ends with /`);
    hasWrongTwitterUrls = true;
  }
  if (item.twitter && item.twitter.indexOf('https://twitter.com/') !== 0 && item.twitter.indexOf('http://twitter.com/') !== 0) {
    console.info(`Fatal: ${item.name} has a twitter ${item.twitter} which does not start with https://twitter.com/ or http://twitter.com/`);
    hasWrongTwitterUrls = true;
  }
});
if (hasWrongTwitterUrls) {
  require('process').exit(1);
}

var hasBadRepoUrl = false;
_.each(itemsWithExtraFields, function(item) {
  if (item.repo_url
    && (item.repo_url.indexOf('https://github.com') !== 0 || item.repo_url.split('/').filter( (x) => !!x).length !== 4)
  ) {
    hasBadRepoUrl = true;
    console.info(`FATAL ERROR: ${item.name}  has a repo_url ${item.repo_url} which does not look like a good github repo url`);
  }
});
if (hasBadRepoUrl) {
  require('process').exit(1);
}

var hasBadImages = false;
_.each(itemsWithExtraFields, function(item) {
  if (!item.image_data) {
    console.info(`FATAL ERROR: Item ${item.name} has no image_data`);
    hasBadImages = true;
  } else {
    const imageFileName = `${projectPath}/cached_logos/` + item.image_data.fileName;
    if (!require('fs').existsSync(imageFileName)) {
      console.info(`FATAL ERROR: Item ${item.name} does not have a file ${imageFileName} on the disk`);
      hasBadImages = true;
    } else {
      const fileSize = require('fs').statSync(imageFileName).size;
      if (fileSize < 100) {
        console.info(`FATAL ERROR: Item ${item.name} has a file ${imageFileName} size less than 100 bytes`);
        hasBadImages = true;
      }
    }
  }
});
if(hasBadImages) {
  require('process').exit(-1);
}


function removeNonReferencedImages() {
  const fs = require('fs');
  const existingFiles = fs.readdirSync(`${projectPath}/hosted_logos`);
  const allowedFiles = itemsWithExtraFields.map( (e) => e.logo ).filter( (e) => !!e);
  _.each(existingFiles, function(existingFile) {
    const fileName = existingFile;
    if (allowedFiles.indexOf(fileName) === -1){
      fs.unlinkSync(`${projectPath}/hosted_logos/` + existingFile);
    }
  })
}
removeNonReferencedImages();

var hasBadLandscape = false;
_.each(settings.big_picture.main.elements, function(element) {
  const hasCompanyCategory = (function() {
    var result = false;
    tree.map(function(node) {
      if (node && node.category === null && node.name === element.category) {
        result = true;
      }
    });
    return result;
  })();
  if (element.category && !hasCompanyCategory) {
    console.info(`FATAL: big picture configration in settings.yml has an issue:
      there is a big_picture.main.elements entry with category: "${element.category}" but we do not have that category "${element.category}" in the landscape.yml!`);
    hasBadLandscape = true;
  }
});
if (hasBadLandscape) {
  process.exit(1);
}

var hasBadFieldWithSpaces = false;
_.each(itemsWithExtraFields, function(item) {
  if (!_.isEmpty(item.twitter) && item.twitter.indexOf(' ') !== -1) {
    hasBadFieldWithSpaces = true;
    console.info(`FATAL: ${item.name} has a twitter ${item.twitter} with spaces`);
  }
  if (!_.isEmpty(item.crunchbase) && item.crunchbase.indexOf(' ') !== -1) {
    hasBadFieldWithSpaces = true;
    console.info(`FATAL: ${item.name} has a crunchbase ${item.crunchbase} with spaces`);
  }
  if (!_.isEmpty(item.repo_url) && item.repo_url.indexOf(' ') !== -1) {
    hasBadFieldWithSpaces = true;
    console.info(`FATAL: ${item.name} has a repo_url ${item.repo_url} with spaces`);
  }
  if (!_.isEmpty(item.homepage_url) && item.homepage_url.indexOf(' ') !== -1) {
    hasBadFieldWithSpaces = true;
    console.info(`FATAL: ${item.name} has a homepage_url ${item.homepage_url} with spaces`);
  }
});
if (hasBadFieldWithSpaces) {
  process.exit(-1);
}


const extractOptions = function(name) {
  return _.chain(itemsWithExtraFields).map(function(x) {
    return x[name];
  }).filter(function(x) {
    return !!x
  }).sortBy(sortFn).uniq().map(function(x) {
    return {
      id: x,
      url: saneName(x)
    };
  }).value();
};

const generateLandscapeHierarchy = function() {
  var result = [];
  tree.map(function(node) {
    if (node && node.category === null) {
      result.push({
        id: node.name,
        url: saneName(node.name),
        level: 1,
        children: []
      });
    }
    if (node && node.subcategory === null) {
      const category = this.parents.filter(function(p) {
        return p.node.category === null;
      }).map(function(p) {
        return p.node.name;
      })[0];
      const categoryEntry = _.find(result, {level: 1, id: category});
      const entry = {
        id: category + ' / ' + node.name,
        parentId: category,
        label: node.name,
        groupingLabel: category + ' - ' + node.name,
        url: saneName(node.name),
        level: 2
      }
      categoryEntry.children.push(entry.id);
      result.push(entry);
    }
  });
  return result;
};

const generateHeadquarters = function() {
  const values = _.uniq(itemsWithExtraFields.map(function(item) {
      return {headquarters: item.headquarters, country: item.crunchbaseData.country};
  }));
  const grouped  = _.groupBy(values, (x) => x.country);
  const keys = _.orderBy(_.keys(grouped));
  const result = [];
  _.each(keys, function(key) {
    const value = grouped[key];
    const children = _.uniqBy(value, (x) => x.headquarters);
    result.push({
      id: key,
      url: saneName(key),
      level: 1,
      children: children.map( (x) => (x.headquarters))
    });
    _.each(_.orderBy(children,  (x) => x.headquarters), function(record) {
      result.push({
        id: record.headquarters,
        label: record.country === 'United States' ? record.headquarters :  record.headquarters.split(', ')[0],
        groupingLabel: record.headquarters,
        url: saneName(record.headquarters),
        level: 2,
        parentId: key
      });
    });
  });
  return result;
}

const generateLicenses = function() {
  const otherLicenses = extractOptions('license').filter(function(x) {
    return x.id !== 'NotOpenSource';
  });
  return [{
    id: 'NotOpenSource',
    label: 'Not Open Source',
    url: saneName('NotOpenSource'),
    level: 1,
    children: []
  }, {
    id: 'Open Source',
    label: 'Open Source',
    url: saneName('Open Source'),
    level: 1,
    children: _.map(otherLicenses, 'id')
  }].concat(otherLicenses.map(function(license){
    return {
      ...license,
      parentId: 'Open Source',
      level: 2
    };
  }));
};
const lookups = {
  organization: pack(extractOptions('organization')),
  landscape: pack(generateLandscapeHierarchy()),
  license: pack(generateLicenses()),
  headquarters: pack(generateHeadquarters())
}

require('fs').writeFileSync(`${projectPath}/data.json`, JSON.stringify(itemsWithExtraFields, null, 2));
require('fs').writeFileSync(`${projectPath}/lookup.json`, JSON.stringify(lookups, null, 2));
