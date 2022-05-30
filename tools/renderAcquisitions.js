const path = require('path');
const _ = require('lodash');

const { projects } = require("./loadData");
const { distPath } = require('./settings');
const { millify } = require('../src/utils/format');
const { stringifyParams } = require('../src/utils/routing');


const organizations = _.uniqBy(projects, 'crunchbase')
const acquisitionsUnsorted = organizations
    .filter(({ crunchbaseData }) => crunchbaseData && crunchbaseData.acquisitions)
    .map(({ crunchbaseData }) => {
      return crunchbaseData.acquisitions.map(data => ({ acquirer: crunchbaseData.name, ...data }))
    }).flat();
const acquisitions = _.reverse(_.orderBy(acquisitionsUnsorted, (x) => new Date(x.date)));
const members = organizations.map(({ crunchbaseData }) => crunchbaseData.name)

const linkToOrg = organization => {
  if (!members.includes(organization)) {
    return organization;
  }
  const url = stringifyParams({ mainContentMode: 'card-mode', filters: { organization }})
    return `<a href="${url}">${organization}</a>`
}

const page = `
<head>
  <link rel="shortcut icon" href="./favicon.png">
  <title>Acquisitions</title>
  <style>
    table {border-spacing: 0px; width:100%; max-width: 1200px; position: absolute; left: 50%; top: 40px; transform: translateX(-50%); }
    tr { line-height: 2; }
    thead { background: #ccc; font-weight: bold; }
    td { padding: 0px 3px }
  </style>
</head>
<body>
     <table>
     <thead>
       <tr>
         <td>Acquirer</td>
         <td>Acquiree</td>
         <td>Price</td>
         <td>Date</td>
       </tr>
     </thead>
     ${acquisitions.map(function(item) {
       return `
       <tr>
         <td>${linkToOrg(item.acquirer)}</td>
         <td>${item.acquiree ? linkToOrg(item.acquiree) : ''}</td>
         <td>${item.price ? '$' + millify(item.price)  :  ''}</td>
         <td>${item.date}</td>
       </tr>
       `;
     }).join('')}
`;
require('fs').writeFileSync(path.resolve(distPath, 'acquisitions.html'), page);
