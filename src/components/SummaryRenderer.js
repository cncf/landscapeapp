const _ = require('lodash');
const { h } = require('../utils/format');
const l = function(x) {
  return h((x || "").replace("https://", ""));
}
const { formatNumber } = require('../utils/formatNumber');

const getLanguages = function(item) {
  if (item.extra && item.extra.summary_languages) {
    return item.extra.summary_languages;
  }
  if (item.github_data && item.github_data.languages) {
    const total = _.sum(item.github_data.languages.map( (x) => x.value));
    const matching = item.github_data.languages.filter( (x) => x.value > total * 0.3).map( (x) => x.name);
    return matching.join(', ');
  } else {
    return '';
  }
}

function highlightLinks(s) {
  if (!s) {
    return '';
  }
  // markdown styles
  s = s.replace(/\[(.*?)\]\((https?:.*?)\)/g, '<a target="_blank" href="$2">$1</a>')
  s = s.replace(/(\s|^)(https?:.*?)(\s|$)/g, ' <a target="_blank" href="$2">$2</a> ')
  return s;
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




  const columnWidth = 250;

  return `
    <head>
    <link rel="icon" type="image/png" href="/favicon.png" />
    <style>
      ${require('fs').readFileSync('src/fonts.css', 'utf-8')}
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

      td a {
        text-decoration: none;
        color: #2E67BF;
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
        border-top: 1px solid white;
      }

      #headers {
        width: 152px;
        position: sticky;
        left: 0;
      }

      #data {
        position: absolute;
        left: 155px;
        top: 0px;
        z-index: -1;
      }

      td,
      th {
        white-space: pre-wrap;
        width: ${columnWidth}px;
        margin: 0;
        border: 1px solid white;
        border-top-width: 0px;
        height: 53px;
        padding: 5px;
        overflow: hidden;
        font-size: 0.8em;
        color: var(--navy);
      }

      .project-name {
        text-align: center;
        font-size: 15px;
        font-weight: bold;
      }

      html, body {
        height: 100%;
        overflow: hidden;
        padding: 0;
        margin: 0;
        outline: 0;
      }


      .table-wrapper {
        position: absolute;
        top: 165px;
        width: calc(100% - 16px);
        bottom: 0;
        overflow-x: scroll;
        overflow-y: scroll;
        padding: 0;
        left: 16px;
      }

      .sticky {
        position: relative;
        background-color: #1b446c;
        color: white;
        width: 152px;
        top: auto;
        font-size: 0.8em;
        font-weight: bold;
        padding: 0px;
      }
      .first-line {
        background-color: #1b446c;
        color: white;
      }
      .alternate-line {
        background-color: #e5e5e5;
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
      .landscapeapp-logo {
        position: absolute;
        right: 5px;
        top: 14px;
      }
      .landscapeapp-logo img {
        width: 200px;
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

.info {
    position: absolute;
    top: 0px;
    left: 540px;
    font-size: 12px;
    line-height: 1.2;
    max-width: 500px;
}

    </style>
    </head>
    <body>
    <div class="main-header">
    <span class="landscape-logo">
      <a aria-label="reset filters" class="nav-link" href="/">
        <img alt="landscape logo" src="/images/left-logo.svg">
      </a>
    </span>

    <span style="display: inline-block; position: relative; top: -8px; left: 20px;">
      <h1>CNCF Project Summary Table</h1>
    </span>

    <a rel="noopener noreferrer noopener noreferrer" class="landscapeapp-logo" title="CNCF" target="_blank" href="https://www.cncf.io">
      <img src="/images/right-logo.svg" title="CNCF">
    </a>
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
    <div class="info">
    The <i>CNCF Project Summary Table</i> provides a standardized, summary of CNCF projects.<br/><div style="height: 5px;"></div>
<b style="color: rgb(58,132,247);">The filters on the left side help refine your view.</b> Start by filtering by category (e.g., <i>orchestration and management</i>) and then subcategory (e.g., <i>service mesh</i> for an overview of all available CNCF service meshes).
    </div>
    </div>


    <div class="table-wrapper">
    <table id="headers">
      <tr class="landscape first-line">
        <td class="sticky">
          <span> Project </span>
        </td>
      </tr>
      <tr class="landscape">
        <td class="sticky">
           <span>Description</span>
        </td>
      </tr>
      <tr class="landscape alternate-line">
        <td class="sticky">
           <span>Maturity</span>
        </td>
      </tr>
      <tr class="landscape">
        <td class="sticky">
           <span>Target Users</span>
        </td>
      </tr>
      <tr class="landscape alternate-line">
        <td class="sticky">
           <span>Tags</span>
        </td>
      </tr>
      <tr class="landscape">
        <td class="sticky">
           <span>Use Case</span>
        </td>
      </tr>
      <tr class="landscape alternate-line">
        <td class="sticky">
           <span>Business Use</span>
        </td>
      </tr>
      <tr class="landscape">
        <td class="sticky">
           <span>Languages</span>
        </td>
      </tr>
      <tr class="landscape alternate-line">
        <td class="sticky">
           <span>First Commit</span>
        </td>
      </tr>
      <tr class="landscape">
        <td class="sticky">
           <span>Last Commit</span>
        </td>
      </tr>
      <tr class="landscape alternate-line">
        <td class="sticky">
           <span>Release Cadence</span>
        </td>
      </tr>
      <tr class="landscape">
        <td class="sticky">
           <span>Github Stars</span>
        </td>
      </tr>
      <tr class="landscape alternate-line">
        <td class="sticky">
           <span>Integrations</span>
        </td>
      </tr>
      <tr class="landscape">
        <td class="sticky">
           <span>Website</span>
        </td>
      </tr>
      <tr class="landscape alternate-line">
        <td class="sticky">
           <span>Github</span>
        </td>
      </tr>
      <tr class="landscape">
        <td class="sticky">
           <span>Overview Video</span>
        </td>
      </tr>
    </table>
    <table id="data">
      <tr class="landscape first-line">
        ${projects.map( (project, index) => `
          <td class="project-name" data-project-index="${index}">${h(project.name)}</td>
        `).join('')}
      </tr>
      <tr class="landscape">
          ${projects.map( (project) => `
            <td>${h((project.github_data || project)['description'])}</td>
          `).join('')}
      </tr>
      <tr class="landscape alternate-line">
          ${projects.map( (project) => `
            <td>${h(project.relation)}</td>
          `).join('')}
      </tr>
      <tr class="landscape">
          ${projects.map( (project) => `
            <td>${h((project.extra || {})['summary_personas']) || '&nbsp;'}</td>
          `).join('')}
      </tr>
      <tr class="landscape alternate-line">
          ${projects.map( (project) => `
            <td>${h((project.extra || {})['summary_tags'] || '').split(',').map( (tag) => `<div>- ${tag.trim()}</div>`).join('') }</td>
          `).join('')}
      </tr>
      <tr class="landscape">
          ${projects.map( (project) => `
            <td>${h((project.extra || {})['summary_use_case']) || '&nbsp;'}</td>
          `).join('')}
      </tr>
      <tr class="landscape alternate-line">
          ${projects.map( (project) => `
            <td>${h((project.extra || {})['summary_business_use_case']) || '&nbsp;'}</td>
          `).join('')}
      </tr>
      <tr class="landscape">
          ${projects.map( (project) => `
            <td>${h(getLanguages(project))}</td>
          `).join('')}
      </tr>
      <tr class="landscape alternate-line">
          ${projects.map( (project) => `
            <td>${h(getDate((project.github_start_commit_data || {}).start_date))}</td>
          `).join('')}
      </tr>
      <tr class="landscape">
          ${projects.map( (project) => `
            <td>${h(getDate((project.github_data || {}).latest_commit_date))}</td>
          `).join('')}
      </tr>
      <tr class="landscape alternate-line">
          ${projects.map( (project) => `
            <td>${h((project.extra || {})['summary_release_rate']) || '&nbsp;'}</td>
          `).join('')}
      </tr>
      <tr class="landscape">
          ${projects.map( (project) => `
            <td>${h(formatNumber((project.github_data || {}).stars))}</td>
          `).join('')}
      </tr>
      <tr class="landscape alternate-line">
          ${projects.map( (project) => `
            <td>${highlightLinks((project.extra || {})['summary_integrations']) || '&nbsp;'}</td>
          `).join('')}
      </tr>
      <tr class="landscape">
          ${projects.map( (project) => `
            <td><a href="${h((project.homepage_url))}" target="_blank">${l(project.homepage_url)}</a></td>
          `).join('')}
      </tr>
      <tr class="landscape alternate-line">
          ${projects.map( (project) => project.repo_url ? `
            <td><a href="${h(project.repo_url)}" target="_blank">${l(project.repo_url)}</a></td>
          `: '<td>&nbsp;</td>').join('')}
      </tr>
      <tr class="landscape">
          ${projects.map( (project) => project.extra && project.extra.summary_intro_url ? `
            <td><a href="${h(project.extra.summary_intro_url)}" target="_blank">${l(project.extra.summary_intro_url)}</a></td>
          `: '<td>&nbsp;</td>').join('')}
      </tr>
    </table>
    <div style="height: 20px;"></div>
    </div>
    <script>
      function setHeight() {
        const rows = [...document.querySelectorAll('#data tr')];
        const headersRows = [...document.querySelectorAll('#headers tr')];
        for (let row of rows) {
          const index = rows.indexOf(row);
          const headerEl = headersRows[index].querySelector('td');
          const firstEl = [...row.querySelectorAll('td')].filter((x) => x.style.display !== 'none')[0];
          headerEl.style.height = (firstEl.getBoundingClientRect().height) + 'px';
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
          document.querySelector('#data').style.width = '';
          document.querySelector('.subcategories').style.display = 'none';
        } else {
          document.querySelector('.subcategories').style.display = '';
          const newWidth = ${columnWidth} * App.categoryItems[categoryId].length;
          document.querySelector('#data').style.width = newWidth + 'px';

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
        document.querySelector('#data').style.width = newWidth + 'px';

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
    </body>

  `
}
