import React, { Fragment } from 'react';
import { pure, withState } from 'recompose';
import SvgIcon from '@material-ui/core/SvgIcon';
import StarIcon from '@material-ui/icons/Star';
import KeyHandler from 'react-key-handler';
import _ from 'lodash';
import { OutboundLink } from 'react-ga';
import millify from 'millify';
import relativeDate from 'relative-date';
import { filtersToUrl } from '../utils/syncToUrl';
import formatNumber from '../utils/formatNumber';
import isMobile from '../utils/isMobile';
import isParent from '../utils/isParent';
import InternalLink from './InternalLink';
import '../styles/itemModal.scss';
import fields from '../types/fields';
import isGoogle from '../utils/isGoogle';
import settings from 'project/settings.yml';
import TweetButton from './TweetButton';
import currentDevice from 'current-device';
import TwitterTimeline from "./TwitterTimeline";

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

const linkTag = (label, { name, url = null, color = 'blue' }) => {
  const options = url ? { to: url, } : {};
  return (<InternalLink {...options} className={`tag tag-${color}`}>
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
    return linkTag(label, {name, url: filtersToUrl({filters: {parent: slug}})});
  }
}

const projectTag = function({relation, member, isSubsidiaryProject, project, enduser}) {
  if (relation === false) {
    return null;
  }
  const { prefix, tag } = _.find(fields.relation.values, {id: project}) || {};

  if (prefix && tag) {
    return linkTag(tag, {name: prefix, url: filtersToUrl({filters:{relation: project}})})
  }

  if (isSubsidiaryProject) {
    return linkTag("Subsidiary CNCF Project", {})
  }

  if (relation === 'member' || relation === 'company') {
    const info = settings.membership[member];
    const name = info.name;
    const label = enduser ? (info.end_user_label || info.label) : info.label ;

    return linkTag(label, {name: name, url: filtersToUrl({filters: {relation: relation}})});
  }
};

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
  return linkTag(label, { name: "License", url, color: "purple" });
}
const badgeTag = function(itemInfo) {
  if (!itemInfo.bestPracticeBadgeId) {
    if (itemInfo.oss) {
      const emptyUrl="https://bestpractices.coreinfrastructure.org/";
      return (<OutboundLink eventLabel={emptyUrl} to={emptyUrl} target="_blank" className="tag tag-grass">
        <span className="tag-value">No CII Best Practices </span>
      </OutboundLink>);
    } else {
      return null;
    }
  }
  const url = `https://bestpractices.coreinfrastructure.org/en/projects/${itemInfo.bestPracticeBadgeId}`;
  const label = itemInfo.bestPracticePercentage === 100 ? 'passing' : ('In progress: ' + itemInfo.bestPracticePercentage + '%');
  return (<OutboundLink eventLabel={url} to={url} target="_blank" className="tag tag-grass">
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

const $script = require('scriptjs'); // eslint-disable-line global-require
$script('https://platform.twitter.com/widgets.js', 'twitter-widgets');

let timeoutId;
const ItemDialogContent = ({itemInfo, isLandscape, setIsLandscape}) => {
  if (!timeoutId) {
    timeoutId = setInterval(function() {
      setIsLandscape(currentDevice.landscape());
    }, 1000);
  }




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
        <OutboundLink eventLabel={itemInfo.twitter} to={itemInfo.twitter} target="_blank">{formatTwitter(itemInfo.twitter)}</OutboundLink>
      </div>
    </div>;

  const latestTweetDateElement = itemInfo.twitter && (
    <div className="product-property row">
      <div className="product-property-name col col-50">Latest Tweet</div>
      <div className="product-property-value col col-50">
        { itemInfo.latestTweetDate && (
          <OutboundLink eventLabel={itemInfo.twitter} to={itemInfo.twitter} target="_blank">{formatDate(itemInfo.latestTweetDate)}</OutboundLink>
        )}
      </div>
    </div>
  );

  const firstCommitDateElement = itemInfo.firstCommitDate  && (
    <div className="product-property row">
      <div className="product-property-name col col-40">First Commit</div>
      <div className="product-property-value tight-col col-60">
        <OutboundLink eventLabel={itemInfo.firstCommitLink} to={itemInfo.firstCommitLink} target="_blank">{formatDate(itemInfo.firstCommitDate)}</OutboundLink>
      </div>
    </div>
  );

  const contributorsCountElement =  itemInfo.contributorsCount ? (
                      <div className="product-property row">
                        <div className="product-property-name col col-40">Contributors</div>
                        <div className="product-property-value tight-col col-60">
                          <OutboundLink eventLabel={itemInfo.contributorsLink} to={itemInfo.contributorsLink} target="_blank">{itemInfo.contributorsCount}</OutboundLink>
                        </div>
                      </div>
                    ) : null;

  const headquartersElement =  itemInfo.headquarters && itemInfo.headquarters !== 'N/A' && (
    <div className="product-property row">
      <div className="product-property-name col col-40">Headquarters</div>
      <div className="product-property-value tight-col col-60"><InternalLink to={filtersToUrl({grouping: 'headquarters', filters:{headquarters:itemInfo.headquarters}})}>{itemInfo.headquarters}</InternalLink></div>
    </div>
  );
  const amountElement = Number.isInteger(itemInfo.amount) && (
    <div className="product-property row">
      <div className="product-property-name col col-40">{itemInfo.amountKind === 'funding' ? 'Funding' : 'Market Cap'}</div>
      {  itemInfo.amountKind === 'funding' &&
          <div className="product-property-value tight-col col-60">
            <OutboundLink
              target="_blank"
              eventLabel={itemInfo.crunchbase + '#section-funding-rounds'}
              to={itemInfo.crunchbase + '#section-funding-rounds'}
            >{'$' + millify(itemInfo.amount)}
            </OutboundLink>
          </div>
      }
      { itemInfo.amountKind !== 'funding' &&
          <div className="product-property-value tight-col col-60">
            <OutboundLink
              target="_blank"
              eventLabel={'https://finance.yahoo.com/quote/' + itemInfo.yahoo_finance_data.effective_ticker}
              to={'https://finance.yahoo.com/quote/' + itemInfo.yahoo_finance_data.effective_ticker}
            >{'$' + millify(itemInfo.amount)}
            </OutboundLink>
          </div>
      }
    </div>
  );
  const tickerElement = itemInfo.ticker && (
    <div className="product-property row">
      <div className="product-property-name col col-40">Ticker</div>
      <div className="product-property-value tight-col col-60">
        <OutboundLink target="_blank" eventLabel={"https://finance.yahoo.com/quote/" + itemInfo.yahoo_finance_data.effective_ticker} to={"https://finance.yahoo.com/quote/" + itemInfo.yahoo_finance_data.effective_ticker}>{itemInfo.yahoo_finance_data.effective_ticker}</OutboundLink>
      </div>
    </div>
  );
  const latestCommitDateElement =  itemInfo.latestCommitDate && (
    <div className="product-property row">
      <div className="product-property-name col col-50">Latest Commit</div>
      <div className="product-property-value col col-50">
        <OutboundLink eventLabel={itemInfo.latestCommitLink} to={itemInfo.latestCommitLink} target="_blank">{formatDate(itemInfo.latestCommitDate)}</OutboundLink>
      </div>
    </div>
  );
  const releaseDateElement =  itemInfo.releaseDate && (
    <div className="product-property row">
      <div className="product-property-name col col-50">Latest Release</div>
      <div className="product-property-value col col-50">
        <OutboundLink eventLabel={itemInfo.releaseLink} to={itemInfo.releaseLink} target="_blank">{formatDate(itemInfo.releaseDate)}</OutboundLink>
      </div>
    </div>
  );
  const crunchbaseEmployeesElement =  itemInfo.crunchbaseData && itemInfo.crunchbaseData.numEmployeesMin && (
    <div className="product-property row">
      <div className="product-property-name col col-50">Headcount</div>
      <div className="product-property-value col col-50">{formatNumber(itemInfo.crunchbaseData.numEmployeesMin)}-{formatNumber(itemInfo.crunchbaseData.numEmployeesMax)}</div>
    </div>
  );

  const scrollAllContent = currentDevice.mobile() && isLandscape;
  const productLogoAndTags = <Fragment>
            <div className="product-logo" style={getRelationStyle(itemInfo.relation)}>
              <img src={itemInfo.href} className='product-logo-img'/>
            </div>
            <div className="product-tags">
              <div>{projectTag(itemInfo)}</div>
              <div>{parentTag(itemInfo)}</div>
              <div>{openSourceTag(itemInfo.oss)}</div>
              <div>{licenseTag(itemInfo)}</div>
              <div>{badgeTag(itemInfo)}</div>
              <TweetButton/>
            </div>
  </Fragment>;
  const productInfo = <Fragment>
              <div className="product-main">
                { !isGoogle && <React.Fragment>
                    <div className="product-name">{itemInfo.name}</div>
                    <div className="product-parent"><InternalLink to={linkToOrganization}>{itemInfo.organization}</InternalLink></div>
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
                    <OutboundLink eventLabel={itemInfo.homepage_url} to={itemInfo.homepage_url} target="_blank">{itemInfo.homepage_url}</OutboundLink>
                  </div>
                </div>
                {itemInfo.repo_url &&
                <div className="product-property row">
                  <div className="product-property-name col col-20">Repository</div>
                  <div className="product-property-value product-repo col col-80">
                    <OutboundLink eventLabel={itemInfo.repo_url} to={itemInfo.repo_url} target="_blank">{itemInfo.repo_url}</OutboundLink>
                  </div>
                </div>
                }
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
                    <OutboundLink eventLabel={itemInfo.crunchbase} to={itemInfo.crunchbase} target="_blank">{itemInfo.crunchbase}</OutboundLink>
                  </div>
                </div>
                }
                {itemInfo.crunchbaseData && itemInfo.crunchbaseData.linkedin &&
                <div className="product-property row">
                  <div className="product-property-name col col-20">LinkedIn</div>
                  <div className="product-property-value col col-80">
                    <OutboundLink eventLabel={itemInfo.crunchbaseData.linkedin} to={itemInfo.crunchbaseData.linkedin} target="_blank">{itemInfo.crunchbaseData.linkedin}</OutboundLink>
                  </div>
                </div>
                }
                <div className="row">
                  { isMobile &&  <div className="col col-50 single-column">
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
                  { !isMobile && <div className="col col-50">
                    { twitterElement }
                    { firstCommitDateElement }
                    { contributorsCountElement }
                    { headquartersElement }
                    { amountElement }
                    { tickerElement }
                  </div>
                  }
                  { !isMobile && <div className="col col-50">
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
        <div className="modal-content">
            <KeyHandler keyEventName="keydown" keyValue="ArrowUp" onKeyHandle={handleUp} />
            <KeyHandler keyEventName="keydown" keyValue="ArrowDown" onKeyHandle={handleDown} />

            { !scrollAllContent && !isGoogle && productLogoAndTags }

            <div className="product-scroll" ref={(x) => productScrollEl = x }>
              { !scrollAllContent && productInfo }
              { scrollAllContent && <div className="landscape-layout">
                  {productLogoAndTags}
                  <div className="right-column">{productInfo}</div>
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
