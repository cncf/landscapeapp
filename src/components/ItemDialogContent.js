import React, { Fragment } from 'react';
import { pure, withState } from 'recompose';
import SvgIcon from '@material-ui/core/SvgIcon';
import StarIcon from '@material-ui/icons/Star';
import KeyHandler from 'react-key-handler';
import _ from 'lodash';
import OutboundLink from './OutboundLink';
import millify from 'millify';
import relativeDate from 'relative-date';
import { filtersToUrl } from '../utils/syncToUrl';
import formatNumber from '../utils/formatNumber';
import isParent from '../utils/isParent';
import InternalLink from './InternalLink';
import '../styles/itemModal.scss';
import fields from '../types/fields';
import isGoogle from '../utils/isGoogle';
import isEmbed from '../utils/isEmbed';
import settings from 'project/settings.yml';
import TweetButton from './TweetButton';
import currentDevice from 'current-device';
import TwitterTimeline from "./TwitterTimeline";
import {Bar, Pie, defaults} from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';
import useWindowSize from "@rooks/use-window-size"
import classNames from 'classnames'
import CreateWidthMeasurer from 'measure-text-width';

const measureWidth = CreateWidthMeasurer(window).setFont('0.6rem Roboto');


let productScrollEl = null;
const formatDate = function(x) {
  if (x.text) {
    return x.text;
  }
  return relativeDate(new Date(x));
};
const formatTwitter = function(x) {
  const name = x.split('/').slice(-1)[0];
  return '@' + name;
}

function getRelationStyle(relation) {
  const relationInfo = _.find(fields.relation.values, {id: relation});
  if (relationInfo && relationInfo.color) {
    return {
      border: '4px solid ' + relationInfo.color
    };
  } else {
    return {};
  }
}


const showTwitter = !isGoogle;

const iconGithub = <svg viewBox="0 0 24 24">
    <path d="M12,2A10,10 0 0,0 2,12C2,16.42 4.87,20.17 8.84,21.5C9.34,21.58
    9.5,21.27 9.5,21C9.5,20.77 9.5,20.14 9.5,19.31C6.73,19.91 6.14,17.97 6.14,17.97C5.68,16.81
    5.03,16.5 5.03,16.5C4.12,15.88 5.1,15.9 5.1,15.9C6.1,15.97 6.63,16.93 6.63,16.93C7.5,18.45 8.97,18
    9.54,17.76C9.63,17.11 9.89,16.67 10.17,16.42C7.95,16.17 5.62,15.31 5.62,11.5C5.62,10.39 6,9.5
     6.65,8.79C6.55,8.54 6.2,7.5 6.75,6.15C6.75,6.15 7.59,5.88 9.5,7.17C10.29,6.95 11.15,6.84 12,6.84C12.85,6.84
    13.71,6.95 14.5,7.17C16.41,5.88 17.25,6.15 17.25,6.15C17.8,7.5 17.45,8.54 17.35,8.79C18,9.5 18.38,10.39
    18.38,11.5C18.38,15.32 16.04,16.16 13.81,16.41C14.17,16.72 14.5,17.33 14.5,18.26C14.5,19.6 14.5,20.68
    14.5,21C14.5,21.27 14.66,21.59 15.17,21.5C19.14,20.16 22,16.42 22,12A10,10 0 0,0 12,2Z" />
    </svg>;

const linkTag = (label, { name, url = null, color = 'blue', multiline = false }) => {
  return (<InternalLink to={url || '/'} className={`tag tag-${color} ${multiline ? 'multiline' : ''}`}>
    {(name ? <span className="tag-name">{name}</span> : null)}
    <span className="tag-value">{label}</span>
  </InternalLink>)
}

const parentTag = (project) => {
  const membership = Object.values(settings.membership).find(({ crunchbase_and_children }) => {
    return isParent(crunchbase_and_children, project)
  });

  if (membership) {
    const { label, name, crunchbase_and_children } = membership;
    const slug = crunchbase_and_children.split("/").pop();
    return linkTag(label, {name, url: filtersToUrl({filters: {parents: slug}, grouping: 'organization'})});
  }
}

const projectTag = function({relation, isSubsidiaryProject, project, ...item}) {
  if (relation === false) {
    return null;
  }
  const { prefix, tag } = _.find(fields.relation.values, {id: project}) || {};

  if (prefix && tag) {
    return linkTag(tag, {name: prefix, url: filtersToUrl({filters:{relation: project}})})
  }

  if (isSubsidiaryProject) {
    const url = filtersToUrl({filters: {format: 'card-mode', relation: 'member', organization: item.organization}});
    return linkTag("Subsidiary Project", { name: settings.global.short_name, url: url });
  }
  return null;
};

const memberTag = function({relation, member, enduser}) {
  if (relation === 'member' || relation === 'company') {
    const info = settings.membership[member];
    const name = info.name;
    const label = enduser ? (info.end_user_label || info.label) : info.label ;
    if (!label) {
      return null;
    }
    return linkTag(label, {name: name, url: filtersToUrl({filters: {relation: relation}})});
  }
  return null;
}

const openSourceTag = function(oss) {
  if (oss) {
    const url = filtersToUrl({grouping: 'license', filters: {license: 'Open Source'}});
    return linkTag("Open Source Software", { url, color: "orange" });
  }
};

const licenseTag = function({relation, license, hideLicense}) {
  if (relation === 'company' || hideLicense) {
    return null;
  }

  const { label } = _.find(fields.license.values, {id: license});
  const url = filtersToUrl({grouping: 'license', filters:{license: license}});
  const width = measureWidth(label);
  console.info({width: width});
  return linkTag(label, { name: "License", url, color: "purple", multiline: width > 90 });
}
const badgeTag = function(itemInfo) {
  if (!itemInfo.bestPracticeBadgeId) {
    if (itemInfo.oss) {
      const emptyUrl="https://bestpractices.coreinfrastructure.org/";
      return (<OutboundLink to={emptyUrl} className="tag tag-grass">
        <span className="tag-value">No CII Best Practices </span>
      </OutboundLink>);
    } else {
      return null;
    }
  }
  const url = `https://bestpractices.coreinfrastructure.org/en/projects/${itemInfo.bestPracticeBadgeId}`;
  const label = itemInfo.bestPracticePercentage === 100 ? 'passing' : (itemInfo.bestPracticePercentage + '%');
  return (<OutboundLink to={url} className="tag tag-grass">
    <span className="tag-name">CII Best Practices</span>
    <span className="tag-value">{label}</span>
  </OutboundLink>);
}

const chart = function(itemInfo) {
  if (isEmbed || !itemInfo.github_data || !itemInfo.github_data.languages) {
    return null;
  }
  const callbacks = defaults.global.tooltips.callbacks;
  function percents(v) {
    const p = Math.round(v / total * 100);
    if (p === 0) {
      return '<1%';
    } else {
      return p + '%';
    }
  }
  const newCallbacks =  {...callbacks, label: function(tooltipItem, data) {
    const v = data.datasets[0].data[tooltipItem.index];
    const value =  millify(v, {precision: 1});
    const language = languages[tooltipItem.index];
    return `${percents(language.value)} (${value})`;
  }};
  /*{
    label: function(tooltipItem, data) {
      debugger
                    var label = data.datasets[tooltipItem.datasetIndex].label || '';

                    if (label) {
                        label += ': ';
                    }
                    label += Math.round(tooltipItem.yLabel * 100) / 100;
                    return label;
                }
  }; */
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
  const data = {
    labels: languages.map((x) => x.name),
    datasets: [{
      data: languages.map( (x) => x.value),
      backgroundColor: languages.map( (x) => x.color)
    }]
  };
  const total = _.sumBy(languages, 'value');

  function getLegendText(language) {
    const millify = require('millify').default;
    const total = _.sumBy(languages, 'value');
    return `${language.name} ${percents(language.value)}`;
  }

  function getPopupText(language) {
    const millify = require('millify').default;
    return `${language.name} ${millify(language.value, {precision: 1})}`;
  }


  const legend = <div style={{position: 'absolute', width: 170, left: 0, top: 0, marginTop: -5, marginBottom: 5, fontSize: '0.8em'  }}>
    {languages.map(function(language) {
      const url = language.name === 'Other' ? null : filtersToUrl({grouping: 'no', filters: {language: language.name }});
      return <div style = {{
        position: 'relative',
        marginTop: 2,
        height: 12
      }} >
        <div style={{display: 'inline-block', position: 'absolute', height: 12, width: 12, background: language.color, top: 2, marginRight: 4}} />
        <div style={{display: 'inline-block', position: 'relative', width: 125, left: 16,  whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden'}}>
          <InternalLink to={url}>{ getLegendText(language) } </InternalLink></div>
      </div>
    })}
  </div>

  return <div style={{width: 220, height: 120, position: 'relative'}}>
    <div style={{marginLeft: 170, width: 100, height: 100}}>
      <Pie height={100} width={100} data={data} legend={{display: false}} options={{tooltips: {callbacks: newCallbacks}}} />
    </div>
    { legend }
  </div>
}

const participation = function(itemInfo) {
  const { innerWidth } = useWindowSize();
  if (isEmbed || !itemInfo.github_data || !itemInfo.github_data.contributions) {
    return null;
  }
  let lastMonth = null;
  let lastWeek = null;
  const data = {
    labels: _.range(0, 51).map(function(week) {
      const firstWeek = new Date(itemInfo.github_data.firstWeek.replace('Z', 'T00:00:00Z'));
      firstWeek.setDate(firstWeek.getDate() + week * 7);
      const m = firstWeek.getMonth();
      if (lastMonth === null) {
        lastMonth = m;
        lastWeek = week;
      }
      else if (m % 12 === (lastMonth + 2) % 12) {
        if (week > lastWeek + 6) {
          lastMonth = m;
          lastWeek = week;
        } else {
          return '';
        }
      } else {
        return '';
      }
      const result = 'Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec'.split(' ')[m];
      return result;
    }),
    datasets: [{
      backgroundColor: 'darkblue',
      labels: [],
      data: itemInfo.github_data.contributions.split(';').map( (x)=> +x).slice(-51)
    }]
  };
  const callbacks = defaults.global.tooltips.callbacks;
  const newCallbacks =  {...callbacks, title: function(data) {
    const firstWeek = new Date(itemInfo.github_data.firstWeek.replace('Z', 'T00:00:00Z'));
    const week = data[0].index;
    firstWeek.setDate(firstWeek.getDate() + week * 7);
    const s = firstWeek.toISOString().substring(0, 10);
    return s;
  }};
  const options = {
    tooltips: {callbacks: newCallbacks},
    scales: {
      xAxes: [{
        gridLines: false,
        ticks: {
          backdropPaddingY: 15,
          autoSkip: false,
          minRotation: 0,
          maxRotation: 0
        },
        scaleLabel: {
          display: false
        }
      }],
      yAxes: [{
        ticks: {
          beginAtZero: true,
          callback: function (value) { if (Number.isInteger(value)) { return value; } }
        }
      }]
    }
  };
  const width = Math.min(innerWidth - 110, 300);
  return <div style={{width: width, height: 150}}>
    <Bar height={150} width={width} data={data} legend={{display: false}} options={options} />
  </div>;
}

function handleUp() {
  productScrollEl.scrollBy({top: -200, behavior: 'smooth'});
}
function handleDown() {
  productScrollEl.scrollBy({top: 200, behavior: 'smooth' });
}

const $script = require('scriptjs'); // eslint-disable-line global-require
$script('https://platform.twitter.com/widgets.js', 'twitter-widgets');

let timeoutId;
const ItemDialogContent = ({itemInfo, isLandscape, setIsLandscape}) => {
  if (!timeoutId) {
    timeoutId = setInterval(function() {
      setIsLandscape(currentDevice.landscape());
    }, 1000);
  }
  const { innerWidth, innerHeight } = useWindowSize();

  const linkToOrganization = filtersToUrl({grouping: 'organization', filters: {organization: itemInfo.organization}});
  const itemCategory = function(path) {
    var separator = <span className="product-category-separator" key="product-category-separator">•</span>;
    var subcategory = _.find(fields.landscape.values,{id: path});
    var category = _.find(fields.landscape.values, {id: subcategory.parentId});
    var categoryMarkup = (
      <InternalLink key="category" to={filtersToUrl({grouping: 'landscape', filters: {landscape: category.id}})}>{category.label}</InternalLink>
    )
    var subcategoryMarkup = (
      <InternalLink key="subcategory" to={filtersToUrl({grouping: 'landscape', filters: {landscape: path}})}>{subcategory.label}</InternalLink>
    )
    return (<span>{[categoryMarkup, separator, subcategoryMarkup]}</span>);
  }
  const twitterElement = itemInfo.twitter &&
    <div className="product-property row">
      <div className="product-property-name col col-40">Twitter</div>
      <div className="product-property-value col col-60">
        <OutboundLink to={itemInfo.twitter}>{formatTwitter(itemInfo.twitter)}</OutboundLink>
      </div>
    </div>;

  const latestTweetDateElement = itemInfo.twitter && (
    <div className="product-property row">
      <div className="product-property-name col col-50">Latest Tweet</div>
      <div className="product-property-value col col-50">
        { itemInfo.latestTweetDate && (
          <OutboundLink to={itemInfo.twitter}>{formatDate(itemInfo.latestTweetDate)}</OutboundLink>
        )}
      </div>
    </div>
  );

  const firstCommitDateElement = itemInfo.firstCommitDate  && (
    <div className="product-property row">
      <div className="product-property-name col col-40">First Commit</div>
      <div className="product-property-value tight-col col-60">
        <OutboundLink to={itemInfo.firstCommitLink} >{formatDate(itemInfo.firstCommitDate)}</OutboundLink>
      </div>
    </div>
  );

  const contributorsCountElement =  itemInfo.contributorsCount ? (
                      <div className="product-property row">
                        <div className="product-property-name col col-40">Contributors</div>
                        <div className="product-property-value tight-col col-60">
                          <OutboundLink to={itemInfo.contributorsLink}>{itemInfo.contributorsCount}</OutboundLink>
                        </div>
                      </div>
                    ) : null;

  const headquartersElement =  itemInfo.headquarters && itemInfo.headquarters !== 'N/A' && (
    <div className="product-property row">
      <div className="product-property-name col col-40">Headquarters</div>
      <div className="product-property-value tight-col col-60"><InternalLink to={filtersToUrl({grouping: 'headquarters', filters:{headquarters:itemInfo.headquarters}})}>{itemInfo.headquarters}</InternalLink></div>
    </div>
  );
  const amountElement = !settings.global.hide_funding_and_market_cap && Number.isInteger(itemInfo.amount) && (
    <div className="product-property row">
      <div className="product-property-name col col-40">{itemInfo.amountKind === 'funding' ? 'Funding' : 'Market Cap'}</div>
      {  itemInfo.amountKind === 'funding' &&
          <div className="product-property-value tight-col col-60">
            <OutboundLink to={itemInfo.crunchbase + '#section-funding-rounds'}>
              {'$' + millify(itemInfo.amount)}
            </OutboundLink>
          </div>
      }
      { itemInfo.amountKind !== 'funding' &&
          <div className="product-property-value tight-col col-60">
            <OutboundLink to={'https://finance.yahoo.com/quote/' + itemInfo.yahoo_finance_data.effective_ticker}>
              {'$' + millify(itemInfo.amount)}
            </OutboundLink>
          </div>
      }
    </div>
  );
  const tickerElement = itemInfo.ticker && (
    <div className="product-property row">
      <div className="product-property-name col col-40">Ticker</div>
      <div className="product-property-value tight-col col-60">
        <OutboundLink to={"https://finance.yahoo.com/quote/" + itemInfo.yahoo_finance_data.effective_ticker}>
          {itemInfo.yahoo_finance_data.effective_ticker}
        </OutboundLink>
      </div>
    </div>
  );
  const latestCommitDateElement =  itemInfo.latestCommitDate && (
    <div className="product-property row">
      <div className="product-property-name col col-50">Latest Commit</div>
      <div className="product-property-value col col-50">
        <OutboundLink to={itemInfo.latestCommitLink}>{formatDate(itemInfo.latestCommitDate)}</OutboundLink>
      </div>
    </div>
  );
  const releaseDateElement =  itemInfo.releaseDate && (
    <div className="product-property row">
      <div className="product-property-name col col-50">Latest Release</div>
      <div className="product-property-value col col-50">
        <OutboundLink to={itemInfo.releaseLink}>{formatDate(itemInfo.releaseDate)}</OutboundLink>
      </div>
    </div>
  );
  const crunchbaseEmployeesElement =  itemInfo.crunchbaseData && itemInfo.crunchbaseData.numEmployeesMin && (
    <div className="product-property row">
      <div className="product-property-name col col-50">Headcount</div>
      <div className="product-property-value col col-50">{formatNumber(itemInfo.crunchbaseData.numEmployeesMin)}-{formatNumber(itemInfo.crunchbaseData.numEmployeesMax)}</div>
    </div>
  );

  const scrollAllContent = innerWidth < 1000 || innerHeight < 630;
  const cellStyle = {
    width: 146,
    marginRight: 4,
    height: 26,
    display: 'inline-block',
    layout: 'relative',
    overflow: 'hidden'
  };

  const productLogoAndTags = <Fragment>
            <div className="product-logo" style={getRelationStyle(itemInfo.relation)}>
              <img src={itemInfo.href} className='product-logo-img' alt={itemInfo.name}/>
            </div>
            <div className="product-tags">
              <div className="product-badges" style = {{width: Math.min(300, innerWidth - 110)}} >
                <div style={cellStyle}>{projectTag(itemInfo)}</div>
                <div style={cellStyle}>{parentTag(itemInfo)}</div>
                <div style={cellStyle}>{openSourceTag(itemInfo.oss)}</div>
                <div style={cellStyle}>{licenseTag(itemInfo)}</div>
                <div style={cellStyle}>{badgeTag(itemInfo)}</div>
                <div style={cellStyle}><TweetButton/></div>
              </div>
            </div>
  </Fragment>;

  const charts = <Fragment>
    {chart(itemInfo)}
    {participation(itemInfo)}
  </Fragment>

  const productLogoAndTagsAndCharts = <Fragment>
            <div className="product-logo" style={getRelationStyle(itemInfo.relation)}>
              <img src={itemInfo.href} className='product-logo-img'/>
            </div>
            <div className="product-tags">
              <div className="product-badges" style = {{width: 300}} >
                <div style={cellStyle}>{projectTag(itemInfo)}</div>
                <div style={cellStyle}>{parentTag(itemInfo)}</div>
                <div style={cellStyle}>{openSourceTag(itemInfo.oss)}</div>
                <div style={cellStyle}>{licenseTag(itemInfo)}</div>
                <div style={cellStyle}>{badgeTag(itemInfo)}</div>
                <div style={cellStyle}><TweetButton/></div>
                {chart(itemInfo)}
                {participation(itemInfo)}
              </div>
            </div>
  </Fragment>;

  const shortenUrl = (url) => url.replace(/http(s)?:\/\/(www\.)?/, "").replace(/\/$/, "");

  const productInfo = <Fragment>
              <div className="product-main">
                { !isGoogle && <React.Fragment>
                    <div className="product-name">{itemInfo.name}</div>
                    <div className="product-parent"><InternalLink to={linkToOrganization}><span>{itemInfo.organization}</span>{memberTag(itemInfo)}</InternalLink></div>
                    <div className="product-category">{itemCategory(itemInfo.landscape)}</div>
                    <div className="product-description">{itemInfo.description}</div>
                  </React.Fragment>
                }
                { isGoogle && <React.Fragment>
                    <div className="product-name">{itemInfo.name}</div>
                    <div className="product-description">{itemInfo.description}</div>
                    <div className="product-parent"><InternalLink to={linkToOrganization}>{itemInfo.organization}</InternalLink></div>
                    <div className="product-category">{itemCategory(itemInfo.landscape)}</div>
                  </React.Fragment>
                }
              </div>
              <div className="product-properties">
                <div className="product-property row">
                  <div className="product-property-name col col-20">Website</div>
                  <div className="product-property-value col col-80">
                    <OutboundLink to={itemInfo.homepage_url}>{shortenUrl(itemInfo.homepage_url)}</OutboundLink>
                  </div>
                </div>
                {itemInfo.repo_url &&
                <div className="product-property row">
                  <div className="product-property-name col col-20">{ itemInfo.additional_repos ? 'Repositories' : 'Repository' }</div>
                  <div className="product-property-value product-repo col col-80">
                    <OutboundLink to={itemInfo.repo_url}>{shortenUrl(itemInfo.repo_url)}</OutboundLink>
                  </div>
                </div>
                }
                { itemInfo.additional_repos && itemInfo.additional_repos.map(({ repo_url }) => {
                  return <div className="product-property row">
                    <div className="product-property-name col col-20"></div>
                    <div className="product-property-value product-repo col col-80">
                      <OutboundLink to={repo_url}>{shortenUrl(repo_url)}</OutboundLink>
                    </div>
                  </div>
                })}
                {itemInfo.starsAsText &&
                <div className="product-property row">
                  <div className="product-property-name col col-20"></div>
                  <div className="product-property-value col col-80">
                    <span className="product-repo-stars">
                      <SvgIcon style={{color: '#7b7b7b'}}>{iconGithub}</SvgIcon>
                      <StarIcon style={{color: '#7b7b7b'}} />
                      {itemInfo.starsAsText}
                    </span>
                  </div>
                </div>
                }
                {itemInfo.crunchbase &&
                <div className="product-property row">
                  <div className="product-property-name col col-20">Crunchbase</div>
                  <div className="product-property-value col col-80">
                    <OutboundLink to={itemInfo.crunchbase}>{shortenUrl(itemInfo.crunchbase)}</OutboundLink>
                  </div>
                </div>
                }
                {itemInfo.crunchbaseData && itemInfo.crunchbaseData.linkedin &&
                <div className="product-property row">
                  <div className="product-property-name col col-20">LinkedIn</div>
                  <div className="product-property-value col col-80">
                    <OutboundLink to={itemInfo.crunchbaseData.linkedin}>
                      {shortenUrl(itemInfo.crunchbaseData.linkedin)}
                    </OutboundLink>
                  </div>
                </div>
                }
                <div className="row">
                  { innerWidth <= 1000 &&  <div className="col col-50 single-column">
                    { twitterElement }
                    { latestTweetDateElement }
                    { firstCommitDateElement }
                    { latestCommitDateElement }
                    { contributorsCountElement }
                    { releaseDateElement }
                    { headquartersElement }
                    { crunchbaseEmployeesElement }
                    { amountElement }
                    { tickerElement }
                  </div> }
                  { innerWidth > 1000 && <div className="col col-50">
                    { twitterElement }
                    { firstCommitDateElement }
                    { contributorsCountElement }
                    { headquartersElement }
                    { amountElement }
                    { tickerElement }
                  </div>
                  }
                  { innerWidth > 1000 && <div className="col col-50">
                      { latestTweetDateElement }
                      { latestCommitDateElement }
                      { releaseDateElement }
                      { crunchbaseEmployeesElement }
                    </div>
                  }
              </div>
            </div>
  </Fragment>;

  return (
        <div className={classNames("modal-content", {'scroll-all-content': scrollAllContent})} >
            <KeyHandler keyEventName="keydown" keyValue="ArrowUp" onKeyHandle={handleUp} />
            <KeyHandler keyEventName="keydown" keyValue="ArrowDown" onKeyHandle={handleDown} />

            { !scrollAllContent && !isGoogle && productLogoAndTagsAndCharts }

            <div className="product-scroll" ref={(x) => productScrollEl = x }>
              { !scrollAllContent && productInfo }
              { scrollAllContent && <div className="landscape-layout">
                  {productLogoAndTags}
                  <div className="right-column">{productInfo}</div>
                  {charts}
                </div>
              }

              { showTwitter && itemInfo.twitter && <TwitterTimeline twitter={itemInfo.twitter} />}
            </div>
            { !scrollAllContent && isGoogle && productLogoAndTags }
        </div>
  );
}
const wrapper = withState('isLandscape', 'setIsLandscape', currentDevice.landscape());
export default wrapper(pure(ItemDialogContent));
