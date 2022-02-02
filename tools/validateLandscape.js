import process from 'process';
import path from 'path';
import { projectPath, settings } from './settings';
import actualTwitter from './actualTwitter';
import { setFatalError, reportFatalErrors } from './fatalErrors';

async function main() {

  const source = require('js-yaml').load(require('fs').readFileSync(path.resolve(projectPath,'landscape.yml')));
  const traverse = require('traverse');
  const _ = require('lodash');

  console.info('Processing the tree');
  let errors = [];
  let hasInvalidKeys = false;

  const allowedKeys = [
    'name',
    'homepage_url',
    'logo',
    'twitter',
    'crunchbase',
    'repo_url',
    'project_org',
    'additional_repos',
    'stock_ticker',
    'description',
    'branch',
    'project',
    'url_for_bestpractices',
    'enduser',
    'open_source',
    'allow_duplicate_repo',
    'unnamed_organization',
    'organization',
    'joined',
    'extra',
    'tag',
    'type',
    'hideLicense'
  ];

  const addKeyError = (title, key) => {
    hasInvalidKeys = true;
    errors.push(`${title} has an unknown key: ${key}`);
  }

  const validateTwitterUrl = (item) => {
    if (item.twitter) {
      const normalizedTwitterUrl = actualTwitter(item);

      if (normalizedTwitterUrl.indexOf("https://twitter.com/") === -1) {
        errors.push(`item ${item.name} has an invalid twitter URL: ${item.twitter}`);
      }
    }
  }

  const validateRepos = ({ name, repo_url, branch, additional_repos }) => {
    const repos = [repo_url ? { repo_url, branch } : null, ...(additional_repos || [])].filter(_ => _)
    for (const { repo_url, branch, ...rest } of repos) {
      if (!repo_url) {
        errors.push(`item ${name} must have repo_url set`)
      } else if (repo_url.indexOf('https://github.com') >= 0 && !repo_url.match(new RegExp('^https://github\.com/[^/]+/[^/]+$'))) {
        errors.push(`item ${name} has an invalid repo ${repo_url}`)
      } else if (repo_url.indexOf('https://github.com') === -1) {
        try {
          new URL(repo_url)
        } catch (e) {
          errors.push(`item ${name} has an invalid repo ${repo_url}`)
        }
      }

      for (let wrongKey in rest) {
        addKeyError(`item ${name}`, `additional_repos.${wrongKey}`)
      }
    }
  }

  const validateGithubOrg = ({ name, repo_url, project_org, additional_repos }) => {
    if (project_org && !repo_url) {
      errors.push(`item ${name} has project_org set which requires repo_url to be set`)
    } else if (project_org && additional_repos) {
      errors.push(`item ${name} cannot have project_org and additional_repos set simultaneously`)
    } else if (project_org && !project_org.match(new RegExp('^https://github\.com/[^/]+$'))) {
      errors.push(`item ${name} has an invalid github organization ${project_org}`)
    }
  }

  const validateJoined = ( { name, joined }) => {
    if (joined === undefined) {
      return
    }

    if (typeof joined !== 'string') {
      errors.push(`item ${name} joined should be a string`)
    } else if (!joined.match(/\d{4}-\d{2}-\d{2}/) || Number.isNaN(Date.parse(joined))) {
      errors.push(`item ${name} joined '${joined}' is not a valid date`)
    }
  }

  function checkItem(item) {
    if (item.item !== null) {
      errors.push(`item ${item.name} does not have a "- item:" part `);
    }
    if (!item.name) {
      errors.push(`item does not have a name`);
    }
    const keys = _.without(_.keys(item), 'item');

    const wrongKeys = keys.filter( function(key) {
      return allowedKeys.indexOf(key) === -1
    });
    wrongKeys.forEach(function(key) {
      addKeyError(`item ${item.name}`, key);
    });

    validateTwitterUrl(item);
    validateRepos(item)
    validateGithubOrg(item)
    validateJoined(item)
  }

  function checkCategoryEntry(item) {
    if (item.category !== null) {
      errors.push(`category ${item.name} does not have a "- category:" part `);
    }
    if (!item.name) {
      errors.push(`category does not have a name`);
    }
    const keys = _.keys(item);
    const wrongKeys = keys.filter( function(key) {
      return ['category', 'name', 'subcategories'].indexOf(key) === -1;
    });
    wrongKeys.forEach(function(key) {
      addKeyError(`category ${item.name}`, key);
    });
  }

  function checkSubcategoryEntry(item) {
    if (item.subcategory !== null) {
      errors.push(`subcategory ${item.name} does not have a "- subcategory:" part `);
    }
    if (!item.name) {
      errors.push(`subcategory entry does not have a name`);
    }
    const keys = _.keys(item);
    const wrongKeys = keys.filter( function(key) {
      return ['subcategory', 'name', 'items'].indexOf(key) === -1;
    });
    wrongKeys.forEach(function(key) {
      addKeyError(`subcategory ${item.name}`, key);
    });
  }

  // ensure that second-level elements are fine
  const rootElement = source.landscape;
  _.each(rootElement, function(category) {
    checkCategoryEntry(category);
    _.each(category.subcategories, function(subcategory) {
      checkSubcategoryEntry(subcategory);
      _.each(subcategory.items, function(item) {
        checkItem(item);
      });
    });
  });

  const membershipKey = settings.global.membership;
  if (membershipKey) {
    const membershipCategory = source.landscape.find(({ name }) => name === membershipKey);
    if (!membershipCategory) {
      errors.push(`Membership category "${membershipKey}" does not have corresponding category in landscape.yml`);
    } else {
      const membershipSubcategories = membershipCategory.subcategories.map(({ name }) => name);
      const settingsMemberships = Object.keys(settings.membership);
      membershipSubcategories.forEach((subcategory) => {
        if (!settingsMemberships.includes(subcategory)) {
          errors.push(`Membership subcategory "${subcategory}" does not have corresponding entry in settings.membership`);
        }
      });
    }
  }

  errors.forEach(function(error) {
    setFatalError(error);
  });
  if (errors.length > 0) {
    await reportFatalErrors();
    if (hasInvalidKeys) {
      console.info('Valid item keys are', JSON.stringify(allowedKeys));
    }
    process.exit(1);
  }
}
main().catch(async function(ex) {
  setFatalError(ex.message);
  await reportFatalErrors();
  process.exit(1);
});
