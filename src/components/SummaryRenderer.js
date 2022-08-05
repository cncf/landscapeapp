const _ = require('lodash');
const { h } = require('../utils/format');
const { formatNumber } = require('../utils/formatNumber');

const goodProjects = ['KubeEdge', 'Akri', 'CDK for Kubernetes (CDK8s)', 'Cloud Custodian', 'Metal3-io', 'OpenYurt', 'SuperEdge'];

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

  const projects = goodProjects.map( (name) => items.filter( (x) => x.name === name)[0]);

  const columnWidth = 250;

  return `
    <style>
      .category {
        font-size: 24px;
        font-weight: bold;
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
      }

      .table-wrapper {
        width: calc(100% - 150px);
        overflow-x: scroll;
        margin-left: 150px;
        overflow-y: visible;
        padding: 0;
      }

      .sticky {
        position: absolute;
        width: 150px;
        left: 0;
        top: auto;
        border-top-width: 1px;
        /*only relevant for first row*/
        margin-top: -1px;
        /*compensate for top border*/
      }

    </style>
    <h1>CNCF Project Summary Table</h1>

    <div class="category">
      <span>Provisioning</span> • <span>Automation and configuration</span>
    </div>

    <div class="table-wrapper">
    <table>
      <thead>
        <tr class="landscape">
          <td class="sticky">
            Project
          </td>
          ${projects.map( (project) => `
            <td>${h(project.name)}</td>
          `).join('')}
        </tr>
      </thead>
      <tr class="landscape">
        <td class="sticky">
           Description
        </td>
          ${projects.map( (project) => `
            <td>${h(project.description)}</td>
          `).join('')}
      </tr>
      <tr class="landscape">
        <td class="sticky">
           Maturity
        </td>
          ${projects.map( (project) => `
            <td>${h(project.relation)}</td>
          `).join('')}
      </tr>
      <tr class="landscape">
        <td class="sticky">
           Personas
        </td>
          ${projects.map( (project) => `
            <td>${h((project.extra || {})['summary_personas']) || '&nbsp;'}</td>
          `).join('')}
      </tr>
      <tr>
        <td class="sticky">
           Tags
        </td>
          ${projects.map( (project) => `
            <td>${h((project.extra || {})['summary_tags'] || '').split(',').map( (tag) => `<div>- ${tag.trim()}</div>`).join('') }</td>
          `).join('')}
      </tr>
      <tr>
        <td class="sticky">
           Use Case
        </td>
          ${projects.map( (project) => `
            <td>${h((project.extra || {})['summary_use_case']) || '&nbsp;'}</td>
          `).join('')}
      </tr>
      <tr>
        <td class="sticky">
           Business Use
        </td>
          ${projects.map( (project) => `
            <td>${h((project.extra || {})['summary_business_use_case']) || '&nbsp;'}</td>
          `).join('')}
      </tr>
      <tr class="landscape">
        <td class="sticky">
           Languages
        </td>
          ${projects.map( (project) => `
            <td>${h(getLanguages(project))}</td>
          `).join('')}
      </tr>
      <tr class="landscape">
        <td class="sticky">
           First Commit
        </td>
          ${projects.map( (project) => `
            <td>${h(getDate((project.github_start_commit_data || {}).start_date))}</td>
          `).join('')}
      </tr>
      <tr class="landscape">
        <td class="sticky">
           Last Commit
        </td>
          ${projects.map( (project) => `
            <td>${h(getDate((project.github_data || {}).latest_commit_date))}</td>
          `).join('')}
      </tr>
      <tr class="">
        <td class="sticky">
           Release Cadence
        </td>
          ${projects.map( (project) => `
            <td>${h((project.extra || {})['summary_release_rate']) || '&nbsp;'}</td>
          `).join('')}
      </tr>
      <tr class="landscape">
        <td class="sticky">
           Github Stars
        </td>
          ${projects.map( (project) => `
            <td>${h(formatNumber((project.github_data || {}).stars))}</td>
          `).join('')}
      </tr>
      <tr class="">
        <td class="sticky">
           Integrations
        </td>
          ${projects.map( (project) => `
            <td>${h((project.extra || {})['summary_integrations']) || '&nbsp;'}</td>
          `).join('')}
      </tr>
      <tr class="landscape">
        <td class="sticky">
           Website
        </td>
          ${projects.map( (project) => `
            <td><a href="${h((project.homepage_url))}" target="_blank">${h(project.homepage_url)}</a></td>
          `).join('')}
      </tr>
      <tr class="landscape">
        <td class="sticky">
           Github
        </td>
          ${projects.map( (project) => project.repo_url ? `
            <td><a href="${h(project.repo_url)}" target="_blank">${h(project.repo_url)}</a></td>
          `: '<td>&nbsp;</td>').join('')}
      </tr>
      <tr class="landscape">
        <td class="sticky">
           Youtube video
        </td>
          ${projects.map( (project) => project.extra && project.extra.summary_intro_url ? `
            <td><a href="${h(project.extra.summary_intro_url)}" target="_blank">${h(project.extra.summary_intro_url)}</a></td>
          `: '<td>&nbsp;</td>').join('')}
      </tr>
    </table>
    </div>

  `
}
