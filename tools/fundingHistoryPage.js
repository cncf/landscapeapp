// generates html and atom pages from dist/funding.json
import millify from 'millify';
import { settings, projectPath } from './settings'
import path from 'path';
const result = JSON.parse(require('fs').readFileSync(path.resolve(projectPath, 'dist/funding.json'), 'utf-8'));
const base = settings.global.website;

const page = `
<head>
  <link rel="shortcut icon" href="./favicon.png">
  <title>Changes in funding</title>
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
         <td>Organization</td>
         <td>Current Funding</td>
         <td>Funding Change</td>
         <td>Membership</td>
         <td>Date of Change</td>
         <td>Crunchbase URL</td>
       </tr>
     </thead>
         ${result.map(function(item, index) {
           const delta = item.currentAmount - (item.previousAmount || 0);
           return `
               <tr style="${index % 2 === 0 ? '' : 'background: #eee'}">
                 <td><a href="${item.link}" target="_blank" rel="noopener noreferrer">${item.name}</a></td>
                 <td>$${millify(item.currentAmount)}</td>
                 <td style="color: ${delta > 0 ? 'green' : 'red'}">$${millify(delta)}</td>
                 <td>${settings.membership[item.membership].funding}</td>
                 <td>${item.date}</td>
                 <td><a href="${item.url}" target="_blank" rel="noopener noreferrer">${item.name}</a></td>
               </tr>
           `;
         }).join('')}
      </table>
</body>
`;
require('fs').writeFileSync(path.resolve(projectPath, 'dist/funding.html'), page);


import { Feed } from "feed";
const feed = new Feed({
  title: "Funding changes",
  description: "That feed shows recent changes",
  id: `${base}/`,
  link: `${base}`,
  image: `${base}/favicon.png`,
  favicon: `${base}/favicon.png`,
  updated: new Date(),
  author: {
    name: settings.global.short_name,
    email: settings.global.email,
    link: settings.global.company_url
  }
});

result.forEach(item => {
  const delta = item.currentAmount - (item.previousAmount || 0);
  const text = `${item.name} got funding of $${millify(delta)}, now totalling $${millify(item.currentAmount)}, on ${item.date}`;
  feed.addItem({
    title: text,
    id: `${item.name}${item.date}`,
    link: item.url,
    description: text,
    content: text,
    date: new Date(Date.parse(item.date)),
    updated: new Date(Date.parse(item.date))
  });
});

require('fs').writeFileSync(path.resolve(projectPath, 'dist/funding.atom'), feed.atom1());


