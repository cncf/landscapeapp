const _ = require('lodash');
const { h } = require('../utils/format');
const l = function(x) {
  return h((x || "").replace("https://", ""));
}
const { formatNumber } = require('../utils/formatNumber');
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
const today = getDate(new Date());

module.exports.render = function({items}) {
  console.info(items[0], items[0].latestCommitDate);

  const old = _.orderBy( items.filter( (x) => x.latestCommitDate && new Date(x.latestCommitDate).getTime() + 3 * 30 * 86400 * 1000 < new Date().getTime()), 'latestCommitDate');

  console.info(old.map( (x) => x.name));

  return `
    <head>
    <link rel="icon" type="image/png" href="/favicon.png" />
    <style>
    </style>
    </head>
    <body>
    <h1>List of obsolete items</h1>
    ${old.map(function(item) {
      return `
        <div style="display: flex; flex-direction: row;">
          <div style="width: 200px; overflow: hidden; padding: 5px;">
            <img src="logos/${item.image_data.fileName}"></img>
          </div>
          <div style="width: 300px; overflow: hidden; padding: 5px;">
          <h3>${item.name}</h1>
          <h3>${item.path}</h2>
          <h3><span><b>Latest Commit: </b></span> ${getDate(item.latestCommitDate)}</h3>
          <h3><span><b>Repo: </b></span> ${highlightLinks(item.repo_url)}</h3>
          </div>
          <div style="width: 600px; padding: 5px;">
            <h4>Manual Actions</h4>
            <pre>
1. Create an issue in their repo, inform that that a repo is scheduled for deletion.
2. Mark this item in a <b>landscape.yml</b> with an <b>extra</b> property <b>obsolete_since</b> equal to ${today}
3. After a month remove the entry from the repo
===
Issue Template:
Title: ${item.name} is going to be unreferenced from the interactive landscape because of no activity since ${getDate(item.latestCommitDate)}
Body:
<div style="font-size: 8px;">
Dear project maintainers of ${item.name},

I hope this message finds you well.
I noticed that your project has had no activity for the last 3 months and is about to be removed from the interactive landscape https://landscape.cncf.io/?selected=${item.id}
As a maintainer of an interactive landscape, we have included your project as a reference for our users and would like to ensure that the information we provide is up-to-date.
We understand that maintaining a project can be challenging and time-consuming, and we would like to offer any assistance that we can. Please let us know if there are any plans to continue the development of the project or if there is anything we can do to help.
Thank you for your time and efforts in creating and maintaining this project. We appreciate the value it has provided to the community and hope to continue to reference it in our interactive landscape.
Best regards, CNCF Landscape Team
</div>
            </pre>
          </div>
        </div>
      `;
    }).join('<hr>')}
    </body>
  `
}
