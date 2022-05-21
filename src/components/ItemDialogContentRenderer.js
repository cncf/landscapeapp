// this is an example file which can be run only in a nodejs environment
// we generate all cards using only this file
// minor javascript handlers can be added later
// layout adjustment for

// TODO: only one helper for all formatting.

import _ from 'lodash';

import relativeDate from 'relative-date';
import formatNumber from '../utils/formatNumber';
import isParent from '../utils/isParent';
import fields from '../types/fields';
import assetPath from '../utils/assetPath';
import { stringifyParams } from '../utils/routing';
import { millify } from '../utils/format';
import { h } from '../utils/format';
import { iconStar, iconGithub } from '../utils/icons';

export function render({settings, tweetsCount, itemInfo}) {

  const closeUrl = stringifyParams;

  const formatDate = function(x) {
    if (x.text) {
      return x.text;
    }
    return relativeDate(new Date(x));
  };

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
    const bird = `<svg
    viewBox="0 0 300 244">
    <g transform="translate(-539.17946,-568.85777)" >
      <path fillOpacity="1" fillRule="nonzero"
      d="m 633.89823,812.04479 c 112.46038,0 173.95627,-93.16765 173.95627,-173.95625 0,-2.64628 -0.0539,-5.28062 -0.1726,-7.90305 11.93799,-8.63016 22.31446,-19.39999 30.49762,-31.65984 -10.95459,4.86937 -22.74358,8.14741 -35.11071,9.62551 12.62341,-7.56929 22.31446,-19.54304 26.88583,-33.81739 -11.81284,7.00307 -24.89517,12.09297 -38.82383,14.84055 -11.15723,-11.88436 -27.04079,-19.31655 -44.62892,-19.31655 -33.76374,0 -61.14426,27.38052 -61.14426,61.13233 0,4.79784 0.5364,9.46458 1.58538,13.94057 -50.81546,-2.55686 -95.87353,-26.88582 -126.02546,-63.87991 -5.25082,9.03545 -8.27852,19.53111 -8.27852,30.73006 0,21.21186 10.79366,39.93837 27.20766,50.89296 -10.03077,-0.30992 -19.45363,-3.06348 -27.69044,-7.64676 -0.009,0.25652 -0.009,0.50661 -0.009,0.78077 0,29.60957 21.07478,54.3319 49.0513,59.93435 -5.13757,1.40062 -10.54335,2.15158 -16.12196,2.15158 -3.93364,0 -7.76596,-0.38716 -11.49099,-1.1026 7.78383,24.2932 30.35457,41.97073 57.11525,42.46543 -20.92578,16.40207 -47.28712,26.17062 -75.93712,26.17062 -4.92898,0 -9.79834,-0.28036 -14.58427,-0.84634 27.05868,17.34379 59.18936,27.46396 93.72193,27.46396" />
    </g>
      </svg>`;

  const { text } = settings.twitter
  const twitterUrl = `https://twitter.com/intent/tweet`

  return `<div class="tweet-button">
    <a data-tweet="true" href="${twitterUrl}">${bird}<span>Tweet</span></a>
      <div class="tweet-count-wrapper">
        <div class="tweet-count">${tweetsCount}</div>
    </div>
  </div>`

  })();


  const renderLinkTag = (label, { name, url = null, color = 'blue', multiline = false }) => {
    return `<a data-type="internal" href="${url || '/'}" class="tag tag-${color} ${multiline ? 'multiline' : ''}">
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
      return renderLinkTag(tag, {name: prefix, url })
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

  const renderLicenseTag = function({relation, license, hideLicense}) {
    const { label } = _.find(fields.license.values, {id: license});

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
      if (itemInfo.oss) {
        const emptyUrl="https://bestpractices.coreinfrastructure.org/";
        return `<a data-type="external" target="_blank" href=${emptyUrl} class="tag tag-grass">
          <span class="tag-value">No CII Best Practices </span>
          </a>`;
      } else {
        return '';
      }
    }
    const url = `https://bestpractices.coreinfrastructure.org/en/projects/${itemInfo.bestPracticeBadgeId}`;
    const label = itemInfo.bestPracticePercentage === 100 ? 'passing' : (itemInfo.bestPracticePercentage + '%');
    return (`<a data-type="external" target="_blank" href="${url}" class="tag tag-grass">
      <span class="tag-name">CII Best Practices</span>
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
        <div style="display: inline-block; position: absolute; height: 12px; width: 12px; background: ${language.color}; top: 2px; margin-right: 4px;" />
        <div style="display: inline-block; position: relative; width: 125px; left: 16px,  white-space: nowrap; text-overflow: 'ellipsis'; overflow: hidden">
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
      <ellipse cx=${center} cy=${center} fill=${color} rx=${radius} ry=${radius} stroke="#fff" strokeWidth="1" />
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
          ${data.map((d, i) => {
            const isLarge = d.value / total > 0.5;
            const angle = 360 * d.value / total;
            const radius = center + (d.expanded ? expandSize : 0) - 1 / 2;

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

    const renderPie = ({width, height, data}) => {
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
          ${renderPie({height: 100,  width: 100, data: languages})}
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
        const separator = i === 12 ? '' : `<span style="width: 23px; display: inline-block;" />`;
        result.push(`<span style="width: 30px; display: inline-block">${monthName}</span>`);
        result.push(separator);
      }
      return result.join('');;
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
        result.push(`div style="
          position: absolute
          left: 20px;
          right: 0;
          top: ${(x / step) * 100}%;
          height: .5px;
          background: #777;"
          />
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
      "/>`);
      return result.join('');
    })();
    const bars = barValues.map(function(value, index) {
      if (value === 0) {
        value === 1;
      }
      return `<div style="
        position: absolute;
        bottom: 0;
        top: ${(maxValue - value) / maxValue * 150})px;
        left: ${24 + index * 5.6}px;
        width: 4px;
        background: #00F;
        border: 1px solid #777;
      " />`;
    }).join('');


    const width = 300;
    return `<div style="width: {width}px; height: 150px; position: relative;">
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

  const renderItemCategory = function(path) {
    var separator = `<span class="product-category-separator" key="product-category-separator">•</span>`;
    var subcategory = _.find(fields.landscape.values,{id: path});
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
        <a data-type=external target=_blank href="${itemInfo.twitter}">${h(formatTwitter(itemInfo.twitter))}"</a>
      </div>
   </div>;
  ` : '';

  const latestTweetDateElement = itemInfo.twitter ? `
    <div class="product-property row">
      <div class="product-property-name col col-50">Latest Tweet</div>
      <div class="product-property-value col col-50">
        ${ itemInfo.latestTweetDate ? `
          <a data-type=external target=_blank href="${h(itemInfo.twitter)}">${formatDate(itemInfo.latestTweetDate)}</a>
        ` : ''}
        </div>
      </div>
  ` : '';

  const firstCommitDateElement = itemInfo.firstCommitDate  ? `
    <div class="product-property row">
      <div class="product-property-name col col-40">First Commit</div>
      <div class="product-property-value tight-col col-60">
        <a data-type=external target=_blank href=${h(itemInfo.firstCommitLink)}">${formatDate(itemInfo.firstCommitDate)}</a>
      </div>
    </div>
  ` : '';

  const contributorsCountElement =  itemInfo.contributorsCount ? `
    <div class="product-property row">
      <div class="product-property-name col col-40">Contributors</div>
      <div class="product-property-value tight-col col-60">
        <a data-type=external target=_blank href="${itemInfo.contributorsLink}">
          ${itemInfo.contributorsCount > 500 ? '500+' : itemInfo.contributorsCount }
        </a>
      </div>
    </div>
  ` : '';

  const headquartersElement = itemInfo.headquarters && itemInfo.headquarters !== 'N/A' ? `
    <div class="product-property row">
      <div class="product-property-name col col-40">Headquarters</div>
      <div class="product-property-value tight-col col-60">
        <a data-type=external target=_blank href="${closeUrl({ grouping: 'headquarters', filters:{headquarters:itemInfo.headquarters}})}">${h(itemInfo.headquarters)}</a>
      div>
    </div>
  ` : '';

  const amountElement = !settings.global.hide_funding_and_market_cap && Number.isInteger(itemInfo.amount) ? `
    <div class="product-property row">
      <div class="product-property-name col col-40">${itemInfo.amountKind === 'funding' ? 'Funding' : 'Market Cap'}</div>
      ${  itemInfo.amountKind === 'funding' ? `
          <div class="product-property-value tight-col col-60">
            <a data-type=external target=_blank href="${itemInfo.crunchbase + '#section-funding-rounds'}">
              ${'$' + millify(itemInfo.amount)}
            </a>
          </div>` : ''
      }
      ${ itemInfo.amountKind !== 'funding' ? `
              <div class="product-property-value tight-col col-60">
                <a data-type=external target=_blank href="https://finance.yahoo.com/quote/${itemInfo.yahoo_finance_data.effective_ticker}">
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
        <a data-type=external target=_blank href="https://finance.yahoo.com/quote/${itemInfo.yahoo_finance_data.effective_ticker}">
          ${h(itemInfo.yahoo_finance_data.effective_ticker)}
        </a>
      </div>
    </div>
  ` : '';

  const latestCommitDateElement =  itemInfo.latestCommitDate ? `
    <div class="product-property row">
      <div class="product-property-name col col-50">Latest Commit</div>
      <div class="product-property-value col col-50">
        <a data-type=external target=_blank href="${itemInfo.latestCommitLink}">${formatDate(itemInfo.latestCommitDate)}</a>
      </div>
    </div>
  ` : '';

  const releaseDateElement =  itemInfo.releaseDate ? `
    <div class="product-property row">
      <div class="product-property-name col col-50">Latest Release</div>
      <div class="product-property-value col col-50">
        <a data-type=external target=_blank href="${itemInfo.releaseLink}">${formatDate(itemInfo.releaseDate)}</a>
      </div>
    </div>
  ` : '';

  const crunchbaseEmployeesElement =  itemInfo.crunchbaseData && itemInfo.crunchbaseData.numEmployeesMin ? `
    <div class="product-property row">
      <div class="product-property-name col col-50">Headcount</div>
      <div class="product-property-value col col-50">${formatNumber(itemInfo.crunchbaseData.numEmployeesMin)}-${formatNumber(itemInfo.crunchbaseData.numEmployeesMax)}</div>
    </div>
  ` : '';

  const extraElement = ( function() {
    if (!itemInfo.extra) {
      return '';
    }
    const items = Object.keys(itemInfo.extra).map( function(key) {
      const value = itemInfo.extra[key];
      const keyText = (function() {
        const step1 =  key.replace(/_url/g, '');
        const step2 = step1.split('_').map( (x) => x.charAt(0).toUpperCase() + x.substring(1)).join(' ');
        return step2;
      })();
      const valueText = (function() {
        if (!!(new Date(value).getTime()) && typeof value === 'string') {
          return relativeDate(new Date(value));
        }
        if (typeof value === 'string' && (value.indexOf('http://') === 0 || value.indexOf('https://') === 0)) {
          return `a data-type=external target=_blank href="${value}">${value}</a>`;
        }
        return value;
      })();
      return `<div class="product-property row">
        <div class="product-property-name tight-col col-20">${keyText}</div>
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
      <div class="product-logo" style="{getRelationStyle(itemInfo.relation)}">
        <img src="${assetPath(itemInfo.href)}" class="product-logo-img"/>
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

  const productInfo = `
    <div class="product-main">
        <div class="product-name">${h(itemInfo.name)}</div>
        <div class="product-parent"><a data-type=internal href="${linkToOrganization}">
          <span>${h(itemInfo.organization)}</span>${renderMemberTag(itemInfo)}</a></div>
        <div class="product-category">${renderItemCategory(itemInfo.landscape)}</div>
        <div class="product-description">${h(itemInfo.description)}</div>
    </div>
    <div class="product-properties">
      <div class="product-property row">
        <div class="product-property-name col col-20">Website</div>
        <div class="product-property-value col col-80">
          <a href=external target=_blank href="${itemInfo.homepage_url}">${shortenUrl(itemInfo.homepage_url)}</a>
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
              ${iconGithub}
              ${iconStar}
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
                      ${iconGithub}
                      ${iconStar}
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
      ${itemInfo.crunchbaseData && itemInfo.crunchbaseData.linkedin ? `
          <div class="product-property row">
            <div class="product-property-name col col-20">LinkedIn</div>
            <div class="product-property-value col col-80">
              <a data-type=external target=_blank href="${itemInfo.crunchbaseData.linkedin}">
                ${shortenUrl(itemInfo.crunchbaseData.linkedin)}
              </a>
            </div>
          </div> ` : ''
      }
      <div class="row">
        <div class="col col-50">
          ${ twitterElement }
          ${ firstCommitDateElement }
          ${ contributorsCountElement }
          ${ headquartersElement }
          ${ amountElement }
          ${ tickerElement }
        </div>
        <div class="col col-50">
          ${ latestTweetDateElement }
          ${ latestCommitDateElement }
          ${ releaseDateElement }
          ${ crunchbaseEmployeesElement }
        </div>
      </div>
      ${extraElement}
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
          <a class="twitter-timeline" data-tweet-limit="5" href="${itemInfo.twitter}"></a>
        </div>` : '' }
    </div>
  </div>`;
  return result;
}
