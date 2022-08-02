const _ = require('lodash');
const { h } = require('../utils/format');

const goodProjects = ['KubeEdge', 'Akri', 'CDK for Kubernetes (CDK8s)', 'Cloud Custodian', 'Metal3-io', 'OpenYurt', 'SuperEdge'];
const extra = {
  KubeEdge: {
    personas: 'Platform Engineers',
    tags: 'tag1, tag2, tag3'
  }
};
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

      .landscape {
        color: green;
      }
      .hardcoded {
        color: black;
      }
      .info {
        position: absolute;
        left: 500px;
        top: 10px;
        border: 1px solid black;
        border-radius: 10px;
        padding: 10px;
      }

    </style>
    <h1>CNCF Project Summary Table</h1>

    <div class="category">
      <span>Provisioning</span> • <span>Automation and configuration</span>
    </div>

    <div class="info">
      <div class="landscape">Values from the landscape.yml</div>
      <div class="hardcoded">Hardcoded values</div>
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
      <tr>
        <td class="sticky">
           Personas
        </td>
          ${projects.map( (project) => `
            <td>${h((extra[project.name] || {}).personas) || ''}</td>
          `).join('')}
      </tr>
      <tr>
        <td class="sticky">
           Tags
        </td>
          ${projects.map( (project) => `
            <td>${h((extra[project.name] || {}).tags || '').split(',').map( (tag) => `<div>- ${tag}</div>`).join('') }</td>
          `).join('')}
      </tr>
    </table>
    </div>

  `
}
