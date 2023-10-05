const _ = require('lodash');
const relativeDate = require('relative-date');

const { formatNumber } = require('../utils/formatNumber');
const { isParent } = require('../utils/isParent');
const { fields } = require('../types/fields');
const { assetPath } = require('../utils/assetPath');
const { stringifyParams } = require('../utils/routing');
const { millify, h } = require('../utils/format');
const icons = require('../utils/icons');

module.exports.render = function({settings, tweetsCount, itemInfo}) {

  const closeUrl = stringifyParams;

  const formatDate = function(x) {
    if (x.text) {
      return x.text;
    }
    return relativeDate(new Date(x));
  };

  function getLinkedIn(itemInfo) {
    if (itemInfo.extra && itemInfo.extra.override_linked_in) {
      return itemInfo.extra.override_linked_in;
    }
    if (itemInfo.crunchbaseData && itemInfo.crunchbaseData.linkedin) {
      return itemInfo.crunchbaseData.linkedin;
    }
    return '';
  }

  function getRelationStyle(relation) {
    const relationInfo = fields.relation.valuesMap[relation]
    if (relationInfo && relationInfo.color) {
      return `border: 4px solid ${relationInfo.color};`;
    } else {
      return '';
    }
  }

  const formatTwitter = function(x) {
    const name = x.split('/').slice(-1)[0];
    return '@' + name;
  }

  const tweetButton = (function() {
    // locate zoom buttons

    if (!process.env.TWITTER_KEYS) {
      return ``
    }
    const twitterUrl = `https://twitter.com/intent/tweet`

    return `<div class="tweet-button">
      <a data-tweet="true" href="${h(twitterUrl)}">${icons.bird}<span>Tweet</span></a>
      <div class="tweet-count-wrapper">
        <div class="tweet-count">${tweetsCount}</div>
      </div>
    </div>`

  })();


  const renderLinkTag = (label, { name, url = null, color = 'blue', multiline = false, twoLines = false }) => {
    return `<a data-type="internal" href="${url || '/'}" class="tag tag-${color} ${multiline ? 'multiline' : ''} ${twoLines ? 'twolines' : ''}">
      ${(name ? `<span class="tag-name">${h(name)}</span>` : '')}
      <span class="tag-value">${h(label)}</span>
      </a>`
  }

  const renderParentTag = (project) => {
    const membership = Object.values(settings.membership).find(({ crunchbase_and_children }) => {
      return isParent(crunchbase_and_children, project)
    });

    if (membership) {
      const { label, name, crunchbase_and_children } = membership;
      const slug = crunchbase_and_children.split("/").pop();
      const url = closeUrl({ grouping: 'organization', filters: {parents: slug}})
      return renderLinkTag(label, {name, url});
    } else {
      return '';
    }
  }

  const renderProjectTag = function({relation, isSubsidiaryProject, project, ...item}) {
    if (relation === false) {
      return '';
    }
    const { prefix, tag } = fields.relation.valuesMap[project] || {};

    if (prefix && tag) {
      const url = closeUrl({ filters: { relation: project }})
      return renderLinkTag(tag, {name: prefix, url, twoLines: tag.indexOf(' - ') !== -1 || tag.length > 20 || prefix.length > 20 })
    }

    if (isSubsidiaryProject) {
      const url = closeUrl({ filters: { relation: 'member', organization: item.organization }})
      return renderLinkTag("Subsidiary Project", { name: settings.global.short_name, url });
    }
    return '';
  };

  const renderMemberTag = function({relation, member, enduser}) {
    if (relation === 'member' || relation === 'company') {
      const info = settings.membership[member];
      if (!info) {
        return '';
      }
      const name = info.name;
      const label = enduser ? (info.end_user_label || info.label) : info.label ;
      if (!label) {
        return '';
      }
      const url = closeUrl({ filters: { relation }})
      return renderLinkTag(label, {name: name, url });
    }
    return '';
  }

  const renderOpenSourceTag = function(oss) {
    if (oss) {
      const url = closeUrl({ grouping: 'license', filters: {license: 'Open Source'}})
      return renderLinkTag("Open Source Software", { url, color: "orange" });
    } else {
      return '';
    }
  };

  const renderLicenseTag = function({relation, license, hideLicense, extra}) {
    const { label } = _.find(fields.license.values, {id: license});

    if (extra && extra.hide_license) {
      return '';
    }

    if (relation === 'company' || hideLicense) {
      return '';
    }

    const url = closeUrl({ grouping: 'license', filters: { license }});
    return renderLinkTag(label, { name: "License", url, color: "purple", multiline: true});
  }

  const renderBadgeTag = function() {
    if (settings.global.hide_best_practices) {
      return '';
    }
    if (!itemInfo.bestPracticeBadgeId) {
      if (settings.global.hide_no_best_practices) {
        return '';
      }
      if (itemInfo.oss) {
        const emptyUrl="https://bestpractices.coreinfrastructure.org/";
        return `<a data-type="external" target="_blank" href=${emptyUrl} class="tag tag-grass">
          <span class="tag-value">No OpenSSF Best Practices </span>
          </a>`;
      } else {
        return '';
      }
    }
    const url = `https://bestpractices.coreinfrastructure.org/en/projects/${itemInfo.bestPracticeBadgeId}`;
    const label = itemInfo.bestPracticePercentage === 100 ? '✓' : (itemInfo.bestPracticePercentage + '%');
    return (`<a data-type="external" target="_blank" href="${url}" class="tag tag-grass">
      <span class="tag-name">OpenSSF Best Practices</span>
      <span class="tag-value">${label}</span>
      </a>`);
  }

  const renderChart = function() {
    if (!itemInfo.github_data || !itemInfo.github_data.languages) {
      return '';
    }
    const allLanguages = itemInfo.github_data.languages;
    const languages = (function() {
      const maxEntries = 7;
      if (allLanguages.length <= maxEntries) {
        return allLanguages
      } else {
        return allLanguages.slice(0, maxEntries).concat([{
          name: 'Other',
          value: _.sum( allLanguages.slice(maxEntries - 1).map( (x) => x.value)),
          color: 'Grey'
        }]);
      }
    })();
    function getLegendText(language) {
      const total = _.sumBy(languages, 'value');
      function percents(v) {
        const p = Math.round(v / total * 100);
        if (p === 0) {
          return '<1%';
        } else {
          return p + '%';
        }
      }
      return `${language.name} ${percents(language.value)}`;
    }

    const legend = `
      <div style="
        position: absolute;
        width: 170px;
        left: 0;
        top: 0;
        margin-top: -5px;
        margin-bottom: 5px;
        font-size: 0.8em;
      ">
      ${languages.map(function(language) {
        const url = language.name === 'Other' ? null : closeUrl({ grouping: 'no', filters: {language: language.name }});
        return `<div style="position: relative; margin-top: 2px; height: 12px;" >
        <div style="display: inline-block; position: absolute; height: 12px; width: 12px; background: ${language.color}; top: 2px; margin-right: 4px;" ></div>
        <div style="display: inline-block; position: relative; width: 125px; left: 16px;  white-space: nowrap; text-overflow: 'ellipsis'; overflow: hidden;">
          <a data-type="internal" href="${url}">${h(getLegendText(language)) }</a></div>
      </div>`
      }).join('')}
    </div> `;


    // a quick 50 lines pie chart implementation is here
    const renderSector = ({
      path, fill
    }) => `
      <path
        d="${path}"
        fill="${fill}"
        stroke="#fff"
        strokeWidth="1"
        strokeLinejoin="round"
      ></path>
    `;

    const renderCircle = ({
      center, color, radius
    }) => `
      <ellipse cx=${center} cy=${center} fill=${color} rx=${radius} ry=${radius} stroke="#fff" strokeWidth="1" ></ellipse>
    `;

    const renderSectors = ({
      center,
      data
    }) => {
      const total = data.reduce((prev, current) => current.value + prev, 0)
      let angleStart = -90;
      let angleEnd = -90;
      let angleMargin = 0;
      return total > 0 ? `
        <g>
          ${data.map((d) => {
            const isLarge = d.value / total > 0.5;
            const angle = 360 * d.value / total;
            const radius = center - 1 / 2;

            angleStart = angleEnd;
            angleMargin = angleMargin > angle ? angle : angleMargin;
            angleEnd = angleStart + angle - angleMargin;

            const x1 = center + radius * Math.cos(Math.PI * angleStart / 180);
            const y1 = center + radius * Math.sin(Math.PI * angleStart / 180);
            const x2 = center + radius * Math.cos(Math.PI * angleEnd / 180);
            const y2 = center + radius * Math.sin(Math.PI * angleEnd / 180);
            const path = `
              M${center},${center}
              L${x1},${y1}
              A${radius},${radius}
              0 ${isLarge ? 1 : 0},1
              ${x2},${y2}
              z
            `
            angleEnd += angleMargin;
            return renderSector({fill: d.color, path: path});
          }).join('')}
          </g>
  ` : ''
    }

    const renderPie = ({data}) => {
      const viewBoxSize = 100;
      const center = viewBoxSize / 2;
      if (!data || data.length === 0) {
        return '';
      }
      return `<svg viewBox="0 0 ${viewBoxSize } ${viewBoxSize}">
        <g>
          ${ data.length === 1
              ? renderCircle({center: center, radius: center, ...data[0]})
              : renderSectors({center:  center, data: data})
          }
        </g>
      </svg>`;
    }

      return `<div style="width: 220px; height: 120px; position: relative">
        <div style="margin-left: 170px; width: 100px; height: 100px;">
          ${renderPie({data: languages})}
        </div>
        ${legend}
      </div>`;
  }

  const renderParticipation = function() {
    if (!itemInfo.github_data || !itemInfo.github_data.contributions) {
      return '';
    }
    // build an Y scale axis
    // build an X scale axis
    const monthText = (function() {
      const firstWeek = new Date(itemInfo.github_data.firstWeek.replace('Z', 'T00:00:00Z'));
      const months = 'Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec'.split(' ');
      const result = [];
      const m = firstWeek.getMonth();
      for (let i = 0; i < 12; i += 2) {
        const monthName = months[(m + i) % 12];
        const separator = i === 12 ? '' : `<span style="width: 23px; display: inline-block;" ></span>`;
        result.push(`<span style="width: 30px; display: inline-block">${monthName}</span>`);
        result.push(separator);
      }
      return result.join('');
    })();

    const barValues = itemInfo.github_data.contributions.split(';').map( (x)=> +x).slice(-51)
    const { maxValue, step } = ( () => {
      const max = _.max(barValues);
      let maxValue;
      let step;
      for (let pow = 0; pow < 10; pow++) {
        for (let v of [1, 2, 5]) {
          const value = v * Math.pow(10, pow);
          if (value >= max && !maxValue) {
            maxValue = value;
            if (pow === 0) {
              step = v;
            } else {
              step = 5;
            }
          }
        }
      }

      return {
        step,
        maxValue
      }
    })();
    const xyLines = ( () => {
      const result = []
      for (let x = 0; x <= step; x += 1) {
        result.push(`<div style="
          position: absolute;
          left: 20px;
          right: 0;
          top: ${(x / step) * 100}%;
          height: .5px;
          background: #777;"
          ></div>
       `)
        result.push(`<span style="
          display: inline-block;
          position: absolute;
          font-size: 10px;
          left: 5px;
          right: 0px;
          top: ${(x / step) * 150 - 7}px;
        ">${(step - x) / step * maxValue}</span>`);
      }
      result.push(`<div style="
        position: absolute;
        left: 25px;
        bottom: 0;
        top: 0;
        width: .5px;
        background: #777;
      "></div>`);
      return result.join('');
    })();
    const bars = barValues.map(function(value, index) {
      if (value === 0) {
        value = 1;
      }
      return `<div style="
        position: absolute;
        bottom: 0;
        top: ${(maxValue - value) / maxValue * 150}px;
        left: ${24 + index * 5.6}px;
        width: 4px;
        background: #00F;
        border: 1px solid #777;
      " ></div>`;
    }).join('');


    const width = 300;
    return `<div style="width: ${width}px; height: 150px; position: relative;">
      ${xyLines}
      ${bars}
      <div style="
        transform: rotate(-90deg);
        position: absolute;
        left: -24px;
        font-size: 10px;
        top: 59px;
      ">Commits</div>
      <div style="
        font-size: 10px;
        left: 20px;
        bottom: -16px;
        white-space: nowrap;
        position: absolute;
      ">${monthText}</div>
    </div>`;
  }

  const linkToOrganization = closeUrl({ grouping: 'organization', filters: {organization: itemInfo.organization}});

  const renderItemCategory = function({path, itemInfo}) {
    var separator = `<span class="product-category-separator" key="product-category-separator">•</span>`;
    var subcategory = _.find(fields.landscape.values,{id: path});
    if (!subcategory) {
      throw new Error(`Failed to render ${itemInfo.name}, can not find a subcategory: ${path}, available paths are below: \n${fields.landscape.values.map( (x) => x.id).join('\n')}`);
    }
    var category = _.find(fields.landscape.values, {id: subcategory.parentId});
    var categoryMarkup = `
      <a data-type="internal" href="${closeUrl({ grouping: 'landscape', filters: {landscape: category.id}})}">${h(category.label)}</a>
    `
    var subcategoryMarkup = `
      <a data-type="internal" href="${closeUrl({ grouping: 'landscape', filters: {landscape: path}})}">${h(subcategory.label)}</a>
    `
    return `<span>${categoryMarkup} ${separator} ${subcategoryMarkup}</span>`;
  }

  const twitterElement = itemInfo.twitter ? `
    <div class="product-property row">
      <div class="product-property-name col col-40">Twitter</div>
      <div class="product-property-value col col-60">
        <a data-type="external" target="_blank" href="${itemInfo.twitter}">${h(formatTwitter(itemInfo.twitter))}</a>
      </div>
   </div>
  ` : '';

  const latestTweetDateElement = itemInfo.twitter ? `
    <div class="product-property row">
      <div class="product-property-name col col-50">Latest Tweet</div>
      <div class="product-property-value col col-50">
        ${ itemInfo.latestTweetDate ? `
          <a data-type="external" target="_blank" href="${h(itemInfo.twitter)}">${formatDate(itemInfo.latestTweetDate)}</a>
        ` : ''}
        </div>
      </div>
  ` : '';

  const firstCommitDateElement = itemInfo.firstCommitDate  ? `
    <div class="product-property row">
      <div class="product-property-name col col-40">First Commit</div>
      <div class="product-property-value tight-col col-60">
        <a data-type="external" target=_blank href="${h(itemInfo.firstCommitLink)}">${formatDate(itemInfo.firstCommitDate)}</a>
      </div>
    </div>
  ` : '';

  const contributorsCountElement =  itemInfo.contributorsCount ? `
    <div class="product-property row">
      <div class="product-property-name col col-40">Contributors</div>
      <div class="product-property-value tight-col col-60">
        <a data-type="external" target=_blank href="${itemInfo.contributorsLink}">
          ${itemInfo.contributorsCount > 500 ? '500+' : itemInfo.contributorsCount }
        </a>
      </div>
    </div>
  ` : '';

  const headquartersElement = itemInfo.headquarters && itemInfo.headquarters !== 'N/A' ? `
    <div class="product-property row">
      <div class="product-property-name col col-40">Headquarters</div>
      <div class="product-property-value tight-col col-60">
        <a data-type="external" target=_blank href="${closeUrl({ grouping: 'headquarters', filters:{headquarters:itemInfo.headquarters}})}">${h(itemInfo.headquarters)}</a>
      </div>
    </div>
  ` : '';

  const amountElement = !settings.global.hide_funding_and_market_cap && Number.isInteger(itemInfo.amount) ? `
    <div class="product-property row">
      <div class="product-property-name col col-40">${itemInfo.amountKind === 'funding' ? 'Funding' : 'Market Cap'}</div>
      ${  itemInfo.amountKind === 'funding' ? `
          <div class="product-property-value tight-col col-60">
            <a data-type="external" target=_blank href="${itemInfo.crunchbase + '#section-funding-rounds'}">
              ${'$' + millify(itemInfo.amount)}
            </a>
          </div>` : ''
      }
      ${ itemInfo.amountKind !== 'funding' ? `
              <div class="product-property-value tight-col col-60">
                <a data-type="external" target=_blank href="https://finance.yahoo.com/quote/${itemInfo.yahoo_finance_data.effective_ticker}">
                  ${'$' + millify(itemInfo.amount)}
                </a>
              </div>` : ''
      }
      </div>
  ` : '';

  const tickerElement = itemInfo.ticker ? `
    <div class="product-property row">
      <div class="product-property-name col col-40">Ticker</div>
      <div class="product-property-value tight-col col-60">
        <a data-type="external" target=_blank href="https://finance.yahoo.com/quote/${itemInfo.yahoo_finance_data.effective_ticker}">
          ${h(itemInfo.yahoo_finance_data.effective_ticker)}
        </a>
      </div>
    </div>
  ` : '';

  const latestCommitDateElement =  itemInfo.latestCommitDate ? `
    <div class="product-property row">
      <div class="product-property-name col col-50">Latest Commit</div>
      <div class="product-property-value col col-50">
        <a data-type="external" target=_blank href="${itemInfo.latestCommitLink}">${formatDate(itemInfo.latestCommitDate)}</a>
      </div>
    </div>
  ` : '';

  const releaseDateElement =  itemInfo.releaseDate ? `
    <div class="product-property row">
      <div class="product-property-name col col-50">Latest Release</div>
      <div class="product-property-value col col-50">
        <a data-type="external" target=_blank href="${itemInfo.releaseLink}">${formatDate(itemInfo.releaseDate)}</a>
      </div>
    </div>
  ` : '';

  const crunchbaseEmployeesElement =  itemInfo.crunchbaseData && itemInfo.crunchbaseData.numEmployeesMin ? `
    <div class="product-property row">
      <div class="product-property-name col col-50">Headcount</div>
      <div class="product-property-value col col-50">${formatNumber(itemInfo.crunchbaseData.numEmployeesMin)}-${formatNumber(itemInfo.crunchbaseData.numEmployeesMax)}</div>
    </div>
  ` : '';

  const specialDates = ( function() {
    let specialKeys = ['accepted', 'incubation', 'graduated', 'archived'];
    const names = {
      accepted: 'Accepted',
      incubation: 'Incubation',
      graduated: 'Graduated',
      archived: 'Archived'
    }
    let result = {};
    for (let key of specialKeys) {
      if (itemInfo.extra && itemInfo.extra[key]) {
        result[key] = itemInfo.extra[key];
        delete itemInfo.extra[key];
      }
    }

    const keys = Object.keys(result);
    const values = Object.values(result);
    if (keys.length === 0) {
      return '';
    }
    if (keys.length === 1) {
      return `
        <div class="product-property row">
          <div class="product-property-name col col-20">${names[keys[0]]}</div>
          <div class="product-property-name col col-80">${values[0]}</div>
        </div>
      `
    }
    if (keys.length === 2) {
      return `
        <div class="row">
          <div class="col col-50">
            <div class="product-property row">
              <div class="product-property-name col col-40">${names[keys[0]]}</div>
              <div class="product-property-name col col-60">${values[0]}</div>
            </div>
          </div>
          <div class="col col-50">
            <div class="product-property row">
              <div class="product-property-name col col-50">${names[keys[1]]}</div>
              <div class="product-property-name col col-50">${values[1]}</div>
            </div>
          </div>
        </div>
      `
    }
    if (keys.length === 3) {
      return `
        <div class="row">
          <div class="col col-50">
            <div class="product-property row">
              <div class="product-property-name col col-40">${names[keys[0]]}</div>
              <div class="product-property-name col col-60">${values[0]}</div>
            </div>
          </div>
          <div class="col col-50">
            <div class="product-property row">
              <div class="product-property-name col col-50">${names[keys[1]]}</div>
              <div class="product-property-name col col-50">${values[1]}</div>
            </div>
          </div>
        </div>
        <div class="product-property row">
          <div class="product-property-name col col-20">${names[keys[2]]}</div>
          <div class="product-property-name col col-80">${values[2]}</div>
        </div>
      `;
    }
    return '';
  })();

  const cloElement = ( function() {
    if (!itemInfo.extra) {
      return '';
    }
    if (!itemInfo.extra.clomonitor_svg) {
      return '';
    }
    return `
      <a href="https://clomonitor.io/projects/cncf/${itemInfo.extra.clomonitor_name}" target="_blank">
        ${itemInfo.extra.clomonitor_svg}
      </a>
    `;
  })();

  const extraElement = ( function() {
    if (!itemInfo.extra) {
      return '';
    }
    const items = Object.keys(itemInfo.extra).map( function(key) {
      if (key.indexOf('summary_') === 0) {
        return '';
      }
      if (key === 'clomonitor_name' || key === 'clomonitor_svg') {
        return '';
      }
      if (key === 'hide_license') {
        return '';
      }
      if (key === 'override_linked_in') {
        return '';
      }
      if (key === 'audits') {
        const value = itemInfo.extra[key];
        const lines = (value.map ? value : [value]).map( (auditInfo) => `
          <div>
          <a href="${h(auditInfo.url)}" target="_blank">${h(auditInfo.type)} at ${auditInfo.date}</a>
          </div>
        `).join('');
        return `<div class="product-property row">
          <div class="product-property-name tight-col col-20">Audits</div>
          <div class="product-proerty-value tight-col col-80">${lines}</div>
        </div>`;
      }
      const value = itemInfo.extra[key];
      const keyText = (function() {
        const step1 =  key.replace(/_url/g, '');
        const step2 = step1.split('_').map( (x) => x.charAt(0).toUpperCase() + x.substring(1)).join(' ');
        return step2;
      })();
      const valueText = (function() {
        if (!!(new Date(value).getTime()) && typeof value === 'string') {
          return h(relativeDate(new Date(value)));
        }
        if (typeof value === 'string' && (value.indexOf('http://') === 0 || value.indexOf('https://') === 0)) {
          return `<a data-type="external" target=_blank href="${h(value)}">${h(value)}</a>`;
        }
        return h(value);
      })();
      return `<div class="product-property row">
        <div class="product-property-name tight-col col-20">${h(keyText)}</div>
        <div class="product-proerty-value tight-col col-80">${valueText}</div>
      </div>`;
    });
    return items.join('');
  })();

  const cellStyle = `
    width: 146px;
    marginRight: 4px;
    height: 26px;
    display: inline-block;
    layout: relative;
    overflow: hidden;
  `;

    const productLogoAndTagsAndCharts = `
      <div class="product-logo" style="${getRelationStyle(itemInfo.relation)}">
        <img alt="product logo" src="${assetPath(itemInfo.href)}" class="product-logo-img">
      </div>
      <div class="product-tags">
        <div class="product-badges" style="width: 300px;" >
          <div style="${cellStyle}">${renderProjectTag(itemInfo)}</div>
          <div style="${cellStyle}">${renderParentTag(itemInfo)}</div>
          <div style="${cellStyle}">${renderOpenSourceTag(itemInfo.oss)}</div>
          <div style="${cellStyle}">${renderLicenseTag(itemInfo)}</div>
          <div style="${cellStyle}">${renderBadgeTag(itemInfo)}</div>
          <div style="${cellStyle}">${tweetButton}</div>
          <div class="charts-desktop">
            ${renderChart(itemInfo)}
            ${renderParticipation(itemInfo)}
          </div>
        </div>
      </div>`;


  const shortenUrl = (url) => url.replace(/http(s)?:\/\/(www\.)?/, "").replace(/\/$/, "");

  const productPaths1 = [itemInfo.landscape, itemInfo.second_path || [], itemInfo.allPaths || []].flat();
  const productPaths = _.uniq(productPaths1.filter( (x) => !!x));
  const productInfo = `
    <div class="product-main">
        <div class="product-name">${h(itemInfo.name)}</div>
        <div class="product-parent"><a data-type=internal href="${linkToOrganization}">
          <span>${h(itemInfo.organization)}</span>${renderMemberTag(itemInfo)}</a></div>
        ${productPaths.map( (productPath) => `
          <div class="product-category">${renderItemCategory({path: productPath, itemInfo})}</div>
        `).join('')}
        <div class="product-description">${h(itemInfo.description)}</div>
    </div>
    <div class="product-properties">
      <div class="product-property row">
        <div class="product-property-name col col-20">Website</div>
        <div class="product-property-value col col-80">
          <a data-type=external target=_blank href="${itemInfo.homepage_url}">${shortenUrl(itemInfo.homepage_url)}</a>
        </div>
      </div>
      ${ (itemInfo.repos || []).map(({ url, stars }, idx) => {
        return `<div class="product-property row">
          <div class="product-property-name col col-20">
            ${ idx === 0 ? (itemInfo.repos.length > 1 ? 'Repositories' : 'Repository') : '' }
          </div>
          <div class="product-property-value product-repo col col-80">
            <a data-type=external target=_blank href="${url}">${shortenUrl(url)}</a>
            ${ idx === 0 && itemInfo.repos.length > 1 ? `<span class="primary-repo">(primary)</span>` : '' }
            ${ itemInfo.github_data ? `<span class="product-repo-stars">
              ${icons.github}
              ${icons.star}
              ${formatNumber(stars)}
              </span> ` : ''
            }
            </div>
          </div>`
      }).join('')}
      ${itemInfo.repos && (itemInfo.repos.length > 3 || (itemInfo.repos.length > 1 && itemInfo.github_data)) ? `
        <div class="product-property row">
          <div class="product-property-name col col-20"></div>
          <div class="product-property-value product-repo col col-80">
                ${ itemInfo.github_data ? `
                    <span class="product-repo-stars-label">
                      total:
                    </span>
                    <span class="product-repo-stars">
                      ${icons.github}
                      ${icons.star}
                      ${formatNumber(itemInfo.github_data.stars)}
                    </span> ` : ''
                 }
          </div>
        </div> ` : ''
      }
      ${itemInfo.crunchbase ? `
          <div class="product-property row">
            <div class="product-property-name col col-20">Crunchbase</div>
            <div class="product-property-value col col-80">
              <a data-type=external target=_blank href="${itemInfo.crunchbase}">${shortenUrl(itemInfo.crunchbase)}</a>
            </div>
          </div> ` : ''
      }
      ${getLinkedIn(itemInfo) ? `
          <div class="product-property row">
            <div class="product-property-name col col-20">LinkedIn</div>
            <div class="product-property-value col col-80">
              <a data-type=external target=_blank href="${getLinkedIn(itemInfo)}">
                ${shortenUrl(getLinkedIn(itemInfo))}
              </a>
            </div>
          </div> ` : ''
      }
      <div class="row">
        <div class="col col-50">
          ${ twitterElement }
          ${ firstCommitDateElement }
          ${ contributorsCountElement }
        </div>
        <div class="col col-50">
          ${ latestTweetDateElement }
          ${ latestCommitDateElement }
          ${ releaseDateElement }
        </div>
      </div>
      ${specialDates}
      <div class="row">
        <div class="col col-50">
          ${ headquartersElement }
          ${ amountElement }
          ${ tickerElement }
        </div>
        <div class="col col-50">
          ${ crunchbaseEmployeesElement }
        </div>
      </div>
      ${extraElement}
      ${cloElement}
      </div>
  `;

  const result = `<div class="modal-content ${itemInfo.oss ? 'oss' : 'nonoss'}">
    ${productLogoAndTagsAndCharts}
    <div class="product-scroll" >
      ${productInfo}
      <div class="charts-mobile">
        ${renderChart(itemInfo)}
        ${renderParticipation(itemInfo)}
      </div>
      ${ itemInfo.twitter ? `<div class="twitter-timeline">
          <a class="twitter-timeline" aria-hidden="true" data-tweet-limit="5" href="${itemInfo.twitter}"></a>
        </div>` : '' }
    </div>
  </div>`;
  return result;
}
