const _ = require('lodash');
const { h } = require('../utils/format');
const { formatNumber } = require('../utils/formatNumber');

const getLanguages = function(item) {
  if (item.github_data && item.github_data.languages) {
    const total = _.sum(item.github_data.languages.map( (x) => x.value));
    const matching = item.github_data.languages.filter( (x) => x.value > total * 0.3).map( (x) => x.name);
    return matching.join(', ');
  } else {
    return '';
  }
}

const getDate = function(date) {
  if (!date) {
    return '';
  }
  return new Date(date).toISOString().substring(0, 10);
}

module.exports.render = function({items}) {

  const projects = items.filter( (x) => !!x.relation && x.relation !== 'member');
  const categories = _.uniq(projects.map( (x) => x.path.split(' / ')[0]));
  const categoriesCount = {};
  const categoryItems = {};
  const subcategories = {};
  for (let k of categories) {
    categoriesCount[k] = projects.filter( (x) => x.path.split(' / ')[0] === k).length;
    categoryItems[k] = projects.filter( (x) => x.path.split(' / ')[0] === k).map( (x) => projects.indexOf(x));
    const arr = _.uniq(projects.filter( (x) => x.path.split(' / ')[0] === k).map( (x) => x.path.split(' / ')[1]));
    for (let subcategory of arr) {
      categoryItems[k + ':' + subcategory] = projects.filter( (x) => x.path === k + ' / ' + subcategory).map( (x) => projects.indexOf(x));
    }
    subcategories[k] = arr;
  }
  console.info(categoryItems);




  const columnWidth = 250;

  return `
    <style>
      ::root {
        --navy: #38404a;
        --navy-light: #696D70;
        --blue: #2E67BF;
        --blue-hover: #1D456B;
        --spacing: 1em;
      }
      body {
        color: rgba(0, 0, 0, 0.87);
        margin: 0;
        font-size: 0.875rem;
        font-family: "Roboto", "Helvetica", "Arial", sans-serif;
        font-weight: 400;
        line-height: 1.43;
        letter-spacing: 0.01071em;
        background-color: #fafafa;
      }

      .category {
        font-size: 24px;
        font-weight: bold;
      }

      .categories {
        display: inline-block;
        margin: 5px;
        font-size: 14px;
      }

      .subcategories {
        display: inline-block;
        margin: 5px;
        font-size: 14px;
      }

      table {
        width: ${columnWidth * projects.length}px;
        table-layout: fixed;
        border-collapse: separate;
        border-spacing: 0;
        border-top: 1px solid grey;
      }

      td,
      th {
        width: ${columnWidth}px;
        margin: 0;
        border: 1px solid grey;
        border-top-width: 0px;
        height: 50px;
        padding: 5px;
        overflow: hidden;
        font-size: 0.8em;
        color: var(--navy);
      }

      .table-wrapper {
        width: calc(100% - 134px);
        overflow-x: scroll;
        margin-left: 154px;
        overflow-y: visible;
        padding: 0;
        padding-left: 16px;
      }

      .sticky {
        background-color: #fafafa;
        position: absolute;
        width: 152px;
        left: 16px;
        top: auto;
        border-top-width: 1px;
        /*only relevant for first row*/
        margin-top: -1px;
        /*compensate for top border*/
        font-size: 0.8em;
        color: var(--navy);
        font-weight: bold;
        padding: 0px;
      }
      .sticky span {
        white-space: nowrap;
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
      }

      h1 {
        font-size: 2.1rem;
        line-height: 30px;
        display: block;
        margin: 0 0 14px;
        color: var(--navy);
      }
      .landscape-logo {
        width: 160px;
        height: 48px;
        display: inline-block;
      }
      .main-header {
        padding: 16px;
      }

      /* select starting stylings ------------------------------*/
.select {
  font-family: 'Roboto';
	position: relative;
	width: 240px;
  margin-bottom: 10px;
}
.select-disabled {
  opacity: 0.35;
  pointer-events: none;
}

.select-text {
	position: relative;
	font-family: inherit;
	background-color: transparent;
	width: 100%;
  font-size: 11px;
	padding: 10px 22px 10px 0;
	border-radius: 0;
	border: none;
	border-bottom: 1px solid rgba(0,0,0, 0.12);
}

/* Remove focus */
.select-text:focus {
	outline: none;
	border-bottom: 1px solid rgba(0,0,0, 0);
}

	/* Use custom arrow */
.select .select-text {
	appearance: none;
	-webkit-appearance:none
}

.select:after {
	position: absolute;
	top: 18px;
	right: 10px;
	/* Styling the down arrow */
	width: 0;
	height: 0;
	padding: 0;
	content: '';
	border-left: 6px solid transparent;
	border-right: 6px solid transparent;
	border-top: 6px solid rgba(0, 0, 0, 0.12);
	pointer-events: none;
}


/* LABEL ======================================= */
.select-label {
	color: rgb(105, 109, 112);
	font-size: 10px;
	font-weight: normal;
	position: absolute;
	pointer-events: none;
	left: 0;
	top: 10px;
	transition: 0.2s ease all;
}

/* active state */
.select-text:focus ~ .select-label, .select-text ~ .select-label {
	top: -10px;
	transition: 0.2s ease all;
	font-size: 11px;
}

/* BOTTOM BARS ================================= */
.select-bar {
	position: relative;
	display: block;
	width: 100%;
}

.select-bar:before, .select-bar:after {
	content: '';
	height: 2px;
	width: 0;
	bottom: 1px;
	position: absolute;
	background: #2F80ED;
	transition: 0.2s ease all;
}

.select-bar:before {
	left: 50%;
}

.select-bar:after {
	right: 50%;
}

/* active state */
.select-text:focus ~ .select-bar:before, .select-text:focus ~ .select-bar:after {
	width: 50%;
}

.select-highlight {
	position: absolute;
	height: 60%;
	width: 100px;
	top: 25%;
	left: 0;
	pointer-events: none;
	opacity: 0.5;
}

    </style>
    <div class="main-header">
    <span class="landscape-logo">
      <a aria-label="reset filters" class="nav-link" href="/">
        <img alt="landscape logo" src="/images/left-logo.svg">
      </a>
    </span>
    <span style="display: inline-block; position: relative; top: -8px; left: 20px;">
      <h1>CNCF Project Summary Table (${projects.length})</h1>
    </span>
    </div>

    <div style="padding: 16px; position: relative; top: -19px;">
    <div class="categories">
      <div class="select">
        <select class="select-text" required="">
          <option value="" selected="">All: ${projects.length}</option>
          ${categories.map( (name) => `<option value="${name}">${name}: ${categoriesCount[name]}</option>`).join('')}
        </select>
        <span class="select-highlight"></span>
        <span class="select-bar"></span>
        <label class="select-label">Category</label>
      </div>
    </div>

    <div class="subcategories" style="display: none">
      <div class="select">
        <select class="select-text" required="">

        </select>
        <span class="select-highlight"></span>
        <span class="select-bar"></span>
        <label class="select-label">Subcategory</label>
      </div>
    </div>
    </div>


    <div class="table-wrapper">
    <table>
      <tr class="landscape">
        <td class="sticky">
          <span> Project </span>
        </td>
        ${projects.map( (project, index) => `
          <td data-project-index="${index}">${h(project.name)}</td>
        `).join('')}
      </tr>
      <tr class="landscape">
        <td class="sticky">
           <span>Description</span>
        </td>
          ${projects.map( (project) => `
            <td>${h((project.github_data || project)['description'])}</td>
          `).join('')}
      </tr>
      <tr class="landscape">
        <td class="sticky">
           <span>Maturity</span>
        </td>
          ${projects.map( (project) => `
            <td>${h(project.relation)}</td>
          `).join('')}
      </tr>
      <tr class="landscape">
        <td class="sticky">
           <span>Personas</span>
        </td>
          ${projects.map( (project) => `
            <td>${h((project.extra || {})['summary_personas']) || '&nbsp;'}</td>
          `).join('')}
      </tr>
      <tr>
        <td class="sticky">
           <span>Tags</span>
        </td>
          ${projects.map( (project) => `
            <td>${h((project.extra || {})['summary_tags'] || '').split(',').map( (tag) => `<div>- ${tag.trim()}</div>`).join('') }</td>
          `).join('')}
      </tr>
      <tr>
        <td class="sticky">
           <span>Use Case</span>
        </td>
          ${projects.map( (project) => `
            <td>${h((project.extra || {})['summary_use_case']) || '&nbsp;'}</td>
          `).join('')}
      </tr>
      <tr>
        <td class="sticky">
           <span>Business Use</span>
        </td>
          ${projects.map( (project) => `
            <td>${h((project.extra || {})['summary_business_use_case']) || '&nbsp;'}</td>
          `).join('')}
      </tr>
      <tr class="landscape">
        <td class="sticky">
           <span>Languages</span>
        </td>
          ${projects.map( (project) => `
            <td>${h(getLanguages(project))}</td>
          `).join('')}
      </tr>
      <tr class="landscape">
        <td class="sticky">
           <span>First Commit</span>
        </td>
          ${projects.map( (project) => `
            <td>${h(getDate((project.github_start_commit_data || {}).start_date))}</td>
          `).join('')}
      </tr>
      <tr class="landscape">
        <td class="sticky">
           <span>Last Commit</span>
        </td>
          ${projects.map( (project) => `
            <td>${h(getDate((project.github_data || {}).latest_commit_date))}</td>
          `).join('')}
      </tr>
      <tr class="">
        <td class="sticky">
           <span>Release Cadence</span>
        </td>
          ${projects.map( (project) => `
            <td>${h((project.extra || {})['summary_release_rate']) || '&nbsp;'}</td>
          `).join('')}
      </tr>
      <tr class="landscape">
        <td class="sticky">
           <span>Github Stars</span>
        </td>
          ${projects.map( (project) => `
            <td>${h(formatNumber((project.github_data || {}).stars))}</td>
          `).join('')}
      </tr>
      <tr class="">
        <td class="sticky">
           <span>Integrations</span>
        </td>
          ${projects.map( (project) => `
            <td>${h((project.extra || {})['summary_integrations']) || '&nbsp;'}</td>
          `).join('')}
      </tr>
      <tr class="landscape">
        <td class="sticky">
           <span>Website</span>
        </td>
          ${projects.map( (project) => `
            <td><a href="${h((project.homepage_url))}" target="_blank">${h(project.homepage_url)}</a></td>
          `).join('')}
      </tr>
      <tr class="landscape">
        <td class="sticky">
           <span>Github</span>
        </td>
          ${projects.map( (project) => project.repo_url ? `
            <td><a href="${h(project.repo_url)}" target="_blank">${h(project.repo_url)}</a></td>
          `: '<td>&nbsp;</td>').join('')}
      </tr>
      <tr class="landscape">
        <td class="sticky">
           <span>Youtube video</span>
        </td>
          ${projects.map( (project) => project.extra && project.extra.summary_intro_url ? `
            <td><a href="${h(project.extra.summary_intro_url)}" target="_blank">${h(project.extra.summary_intro_url)}</a></td>
          `: '<td>&nbsp;</td>').join('')}
      </tr>
    </table>
    <div style="height: 20px;"></div>
    </div>
    <script>
      function setHeight() {
        const rows = [...document.querySelectorAll('tr')];
        for (let row of rows) {
          const headerEl = row.querySelector('td.sticky');
          const firstEl = [...row.querySelectorAll('td')].filter((x) => x.style.display !== 'none')[1];
          headerEl.style.height = firstEl.getBoundingClientRect().height + 'px';
        }
      }

      window.App = {
        totalCount: ${projects.length},
        categories: ${JSON.stringify(categories)},
        categoryItems: ${JSON.stringify(categoryItems)},
        subcategories: ${JSON.stringify(subcategories)}
      };
      document.querySelector('.categories select').addEventListener('change', function(e) {
        const selectedOption = Array.from(document.querySelectorAll('.categories option')).find( (x) => x.selected);
        const categoryId = selectedOption.value;
        if (!categoryId) {
          document.querySelector('table').style.width = '';
          document.querySelector('.subcategories').style.display = 'none';
        } else {
          document.querySelector('.subcategories').style.display = '';
          const newWidth = ${columnWidth} * App.categoryItems[categoryId].length;
          document.querySelector('table').style.width = newWidth + 'px';

          const subcategories = window.App.subcategories[categoryId];
          const baseMarkup = '<option value="">All</option>';
          const markup = subcategories.map( (s) => '<option value="' + s + '">' + s + ':&nbsp;' + window.App.categoryItems[categoryId + ':' + s].length  + '</option>').join('');
          document.querySelector('.subcategories select').innerHTML = baseMarkup + markup;

        }

        for (let tr of [...document.querySelectorAll('tr')]) {
          let index = 0;
          for (let td of [...tr.querySelectorAll('td')].slice(1)) {
            const isVisible = categoryId ? App.categoryItems[categoryId].includes(index) : true;
            td.style.display = isVisible ? '' : 'none';
            index += 1;
          }
        }
        setHeight();
      });

      document.querySelector('.subcategories select').addEventListener('change', function(e) {
        const categoryId = Array.from(document.querySelectorAll('.categories option')).find( (x) => x.selected).value;
        const subcategoryId = Array.from(document.querySelectorAll('.subcategories option')).find( (x) => x.selected).value;

        let key = subcategoryId ? (categoryId + ':' + subcategoryId) : categoryId;

        const newWidth = ${columnWidth} * App.categoryItems[key].length;
        document.querySelector('table').style.width = newWidth + 'px';

        for (let tr of [...document.querySelectorAll('tr')]) {
          let index = 0;
          for (let td of [...tr.querySelectorAll('td')].slice(1)) {
            const isVisible = App.categoryItems[key].includes(index);
            td.style.display = isVisible ? '' : 'none';
            index += 1;
          }
        }
        setHeight();
      });
      setHeight();
    </script>

  `
}
