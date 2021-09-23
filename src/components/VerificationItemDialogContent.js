import React, { Fragment, useContext, useEffect, useState } from 'react';
import SvgIcon from '@material-ui/core/SvgIcon';
import StarIcon from '@material-ui/icons/Star';
import KeyHandler from 'react-key-handler';
import _ from 'lodash';
import OutboundLink from './OutboundLink';
import millify from 'millify';
import relativeDate from 'relative-date';
import formatNumber from '../utils/formatNumber';
import isParent from '../utils/isParent';
import InternalLink from './InternalLink';
import fields from '../types/fields';
import isGoogle from '../utils/isGoogle';
import settings from 'public/settings.json';
import classNames from 'classnames'
import CreateWidthMeasurer from 'measure-text-width';
import assetPath from '../utils/assetPath'
import { stringifyParams } from '../utils/routing'
import LandscapeContext from '../contexts/LandscapeContext'
import Head from 'next/head'
import useWindowSize from '../utils/useWindowSize'

const closeUrl = params => stringifyParams({ mainContentMode: 'card-mode', selectedItemId: null, ...params })

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
  const relationInfo = fields.relation.valuesMap[relation]
  if (relationInfo && relationInfo.color) {
    return {
      border: '4px solid ' + relationInfo.color
    };
  } else {
    return {};
  }
}

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
    const url = closeUrl({ grouping: 'organization', filters: {parents: slug}})
    return linkTag(label, {name, url});
  }
}

const projectTag = function({relation, isSubsidiaryProject, project, ...item}) {
  if (relation === false) {
    return null;
  }
  const { prefix, tag } = fields.relation.valuesMap[project] || {};

  if (prefix && tag) {
    const url = closeUrl({ filters: { relation: project }})
    return linkTag(tag, {name: prefix, url })
  }

  if (isSubsidiaryProject) {
    const url = closeUrl({ mainContentMode: 'card-mode', filters: { relation: 'member', organization: item.organization }})
    return linkTag("Subsidiary Project", { name: settings.global.short_name, url });
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
    const url = closeUrl({ filters: { relation }})
    return linkTag(label, {name: name, url });
  }
  return null;
}

const openSourceTag = function(oss) {
  if (oss) {
    const url = closeUrl({ grouping: 'license', filters: {license: 'Open Source'}})
    return linkTag("Open Source Software", { url, color: "orange" });
  }
};

const licenseTag = function({relation, license, hideLicense}) {
  const { label } = _.find(fields.license.values, {id: license});
  const [width, setWidth] = useState(0)

  useEffect(() => {
    const width = CreateWidthMeasurer(window).setFont('0.6rem Roboto');
    setWidth(width)
  }, [label])

  if (relation === 'company' || hideLicense) {
    return null;
  }

  const url = closeUrl({ grouping: 'license', filters: { license }});
  return linkTag(label, { name: "License", url, color: "purple", multiline: width > 90 });
}
const badgeTag = function(itemInfo) {
  if (settings.global.hide_best_practices) {
    return null;
  }
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


function handleUp() {
  productScrollEl.scrollBy({top: -200, behavior: 'smooth'});
}
function handleDown() {
  productScrollEl.scrollBy({top: 200, behavior: 'smooth' });
}

const VerificationItemDialogContent = ({ itemInfo, loading }) => {
  const { params } = useContext(LandscapeContext)
  const { onlyModal } = params
  const [showAllRepos, setShowAllRepos] = useState(false)
  const { innerWidth, innerHeight } = useWindowSize()

  const linkToOrganization = closeUrl({ grouping: 'organization', filters: {organization: itemInfo.organization}});
  const itemCategory = function(path) {
    var separator = <span className="product-category-separator" key="product-category-separator">•</span>;
    var subcategory = _.find(fields.landscape.values,{id: path});
    var category = _.find(fields.landscape.values, {id: subcategory.parentId});
    var categoryMarkup = (
      <InternalLink key="category" to={closeUrl({ grouping: 'landscape', filters: {landscape: category.id}})}>{category.label}</InternalLink>
    )
    var subcategoryMarkup = (
      <InternalLink key="subcategory" to={closeUrl({ grouping: 'landscape', filters: {landscape: path}})}>{subcategory.label}</InternalLink>
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
                          <OutboundLink to={itemInfo.contributorsLink}>
                            {itemInfo.contributorsCount > 500 ? '500+' : itemInfo.contributorsCount }
                          </OutboundLink>
                        </div>
                      </div>
                    ) : null;

  const headquartersElement = itemInfo.headquarters && itemInfo.headquarters !== 'N/A' && (
    <div className="product-property row">
      <div className="product-property-name col col-40">Headquarters</div>
      <div className="product-property-value tight-col col-60"><InternalLink to={closeUrl({ grouping: 'headquarters', filters:{headquarters:itemInfo.headquarters}})}>{itemInfo.headquarters}</InternalLink></div>
    </div>
  );
  const amountElement = !loading && !settings.global.hide_funding_and_market_cap && Number.isInteger(itemInfo.amount) && (
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

  const extraElement = ( function() {
    if (!itemInfo.extra) {
      return null;
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
          return <OutboundLink to={value}>{value}</OutboundLink>;
        }
        return value;
      })();
      return <div className="product-property row">
        <div className="product-property-name tight-col col-20">{keyText}</div>
        <div className="product-proerty-value tight-col col-80">{valueText}</div>
      </div>;
    });
    return items;
  })();

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
              <img src={assetPath(itemInfo.href)} className='product-logo-img' alt={itemInfo.name}/>
            </div>
            <div className="product-tags">
              <div className="product-badges" style = {{width: Math.min(300, innerWidth - 110)}} >
                <div style={cellStyle}>{projectTag(itemInfo)}</div>
                <div style={cellStyle}>{parentTag(itemInfo)}</div>
                <div style={cellStyle}>{openSourceTag(itemInfo.oss)}</div>
                <div style={cellStyle}>{licenseTag(itemInfo)}</div>
                <div style={cellStyle}>{badgeTag(itemInfo)}</div>
              </div>
            </div>
  </Fragment>;

  const productLogoAndTagsAndCharts = <Fragment>
            <div className="product-logo" style={getRelationStyle(itemInfo.relation)}>
              <img src={assetPath(itemInfo.href)} className='product-logo-img'/>
            </div>
            <div className="product-tags">
              <div className="product-badges" style = {{width: 300}} >
                <div style={cellStyle}>{projectTag(itemInfo)}</div>
                <div style={cellStyle}>{parentTag(itemInfo)}</div>
                <div style={cellStyle}>{openSourceTag(itemInfo.oss)}</div>
                <div style={cellStyle}>{licenseTag(itemInfo)}</div>
                <div style={cellStyle}>{badgeTag(itemInfo)}</div>
              </div>
            </div>
  </Fragment>;

  const shortenUrl = (url) => url.replace(/http(s)?:\/\/(www\.)?/, "").replace(/\/$/, "");

  const productInfo = <Fragment>
              <div className="product-main">
                { (isGoogle() || onlyModal) ?
                  <React.Fragment>
                    <div className="product-name">{itemInfo.name}</div>
                    <div className="product-description">{itemInfo.description}</div>
                    <div className="product-parent"><InternalLink to={linkToOrganization}>{itemInfo.organization}</InternalLink></div>
                    <div className="product-category">{itemCategory(itemInfo.landscape)}</div>
                  </React.Fragment> :
                  <React.Fragment>
                    <div className="product-name">{itemInfo.name}</div>
                    <div className="product-parent"><InternalLink to={linkToOrganization}><span>{itemInfo.organization}</span>{memberTag(itemInfo)}</InternalLink></div>
                    <div className="product-category">{itemCategory(itemInfo.landscape)}</div>
                    <div className="product-description">{itemInfo.description}</div>
                  </React.Fragment>
                }
              </div>
              { !loading && <div className="product-properties">
                <div className="product-property row">
                  <div className="product-property-name col col-20">Website</div>
                  <div className="product-property-value col col-80">
                    <OutboundLink to={itemInfo.homepage_url}>{shortenUrl(itemInfo.homepage_url)}</OutboundLink>
                  </div>
                </div>
                { itemInfo.repos && itemInfo.repos.map(({ url, stars }, idx) => {
                  return <div className={`product-property row ${ idx < 3 || showAllRepos ? '' : 'hidden' }`} key={idx}>
                    <div className="product-property-name col col-20">
                      { idx === 0 && (itemInfo.repos.length > 1 ? 'Repositories' : 'Repository') }
                    </div>
                    <div className="product-property-value product-repo col col-80">
                      <OutboundLink to={url}>{shortenUrl(url)}</OutboundLink>

                      { idx === 0 && itemInfo.repos.length > 1 && <span className="primary-repo">(primary)</span> }

                    </div>
                  </div>
                })}
                {itemInfo.repos && (itemInfo.repos.length > 3 || (itemInfo.repos.length > 1 && itemInfo.github_data)) &&
                <div className="product-property row">
                  <div className="product-property-name col col-20"></div>
                  <div className="product-property-value product-repo col col-80">
                    {itemInfo.repos && itemInfo.repos.length > 3 &&
                      <span>
                        <a href="#" onClick={() => setShowAllRepos(!showAllRepos)}>{ showAllRepos ? 'less...' : 'more...' }</a>
                      </span>
                    }
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
              { extraElement }
            </div> }
  </Fragment>;

  return (
        <div className={classNames("modal-content scroll-all-content", {'scroll-all-content': scrollAllContent})} >
          <Head>
            <title>{`${itemInfo.name} - ${settings.global.meta.title}`}</title>
          </Head>

            <KeyHandler keyEventName="keydown" keyValue="ArrowUp" onKeyHandle={handleUp} />
            <KeyHandler keyEventName="keydown" keyValue="ArrowDown" onKeyHandle={handleDown} />

            <div className="product-scroll" ref={(x) => productScrollEl = x }>
              <div className="column-content landscape-layout">
                <div className="verification-product-card">
                  Product Card
                </div>
                <div className="verification-mosaic-wrap" key="v-logo">
                  <div className="verification-product-logo" style={getRelationStyle(itemInfo.relation)}>
                    <img src={assetPath(itemInfo.href)} className='verification-product-logo-img'/>
                  </div>
                </div>
                <div className="verification-mosaic-wrap" key="v-member">
                  LFN Member Level
                </div>
                <div className="verification-mosaic-wrap" key="v-aalogo">
                  AALogo
                </div>

                <div className="verification-mosaic-product" key="v-product">
                  {itemInfo.name}
                </div>

                <div className="verification-mosaic-description" key="v-description">
                  {itemInfo.description}
                </div>

                <div className="verification-mosaic-description" key="v-indication">
                  Indication of release (Version)
                </div>

                <div className="verification-mosaic-category" key="v-category">
                  {itemCategory(itemInfo.landscape)}
                </div>

                <div className="verification-mosaic-category" key="v-category2">
                  Category2
                </div>

                <div className="verification-mosaic-category" key="v-category3">
                  Category3
                </div>
              </div>
            </div>
        </div>
  );
}
export default VerificationItemDialogContent
