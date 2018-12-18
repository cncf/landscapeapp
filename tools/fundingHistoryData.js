// Calculates a json file which shows changes in funding of different companies
import _ from 'lodash';
import saneName from '../src/utils/saneName'
import { settings, projectPath } from './settings'
import path from 'path';
const base = settings.global.website;
// sync should go from a proper place!!!
console.info('ensure we have a proper origin');
console.info(require('child_process').execSync(`cd '${projectPath}'; git remote add origin ${process.env.REPOSITORY_URL} || true`).toString('utf-8'));

console.info('fetching origin repo');
console.info(require('child_process').execSync(`cd '${projectPath}'; git fetch origin`).toString('utf-8'));

function getFileFromHistory(days) {
  const commit = getCommitFromHistory(days);
  const content = require('child_process').execSync(`cd '${projectPath}'; git show ${commit}:processed_landscape.yml`).toString('utf-8');
  const source = require('js-yaml').safeLoad(content);
  return source;
}

function getCommitFromHistory(days) {
  const commit = require('child_process').execSync(`cd '${projectPath}'; git log --format='%H' -n 1 --before='{${days} days ago}' --author='CNCF-bot' origin/master`).toString('utf-8').trim();
  return commit;
}



function getFileFromFs() {
  const content = require('fs').readFileSync(path.resolve(projectPath, 'processed_landscape.yml'), 'utf-8');
  const source = require('js-yaml').safeLoad(content);
  return source;
}

const getItems = function(yaml) {
  return _.flattenDeep( yaml.landscape.map( (category) => category.subcategories.map( (sc) => sc.items)));
}


function buildDiff({currentItems, prevItems, date, result}) {
  _.each(currentItems, function(item) {
    if (!item.crunchbase_data) {
      return;
    }
    if (!item.crunchbase_data.funding) {
      return;
    }
    if (_.find(result, {name: item.crunchbase_data.name})) {
      return;
    }
    const previousEntry = _.find(prevItems, (prevItem) => prevItem.crunchbase_data && prevItem.crunchbase_data.name === item.crunchbase_data.name);
    if (previousEntry && item.crunchbase_data.funding !== previousEntry.crunchbase_data.funding) {
      result.push({
        name: item.crunchbase_data.name,
        currentAmount: item.crunchbase_data.funding,
        previousAmount: previousEntry.crunchbase_data.funding,
        date: date,
        membership: item.membership_data.member,
        link: `${base}/grouping=organization&organization=${saneName(item.crunchbase_data.name)}`,
        url: item.crunchbase + '#section-funding-rounds'
      });
    }
  });
}

console.info('about to fetch entries');
const result = [];
const maxEntries = 20;
_.range(1, 100).forEach(function(i) {
  if (result.length >= maxEntries) {
    return false;
  }
  const prev = getItems(getFileFromHistory(i));
  const current = getItems(getFileFromFs());
  buildDiff({
    currentItems: current,
    prevItems: prev,
    date: new Date( new Date().getTime() - 86400 * 1000 * i).toISOString().substring(0, 10),
    result: result
  });
});


require('fs').writeFileSync(path.resolve(projectPath, 'dist/funding.json'), JSON.stringify(result, null, 4));

console.info('funding.json is ready');



