import React, { Fragment, useContext, useEffect, useState } from 'react';;
import KeyHandler from 'react-key-handler';
import _ from 'lodash';
import InternalLink from './InternalLink';
import fields from '../types/fields';
import settings from 'public/settings.json';
import classNames from 'classnames'
import assetPath from '../utils/assetPath'
import { stringifyParams } from '../utils/routing'
import LandscapeContext from '../contexts/LandscapeContext'
import Head from 'next/head'
import useWindowSize from '../utils/useWindowSize'

const closeUrl = params => stringifyParams({ mainContentMode: 'card-mode', selectedItemId: null, ...params })

let productScrollEl = null;

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
    return (<span>{[subcategoryMarkup]}</span>);
  }

  const scrollAllContent = innerWidth < 1000 || innerHeight < 630;
  return (
        <div className={classNames("modal-content scroll-all-content", {'scroll-all-content': scrollAllContent})} >
          <Head>
            <title>{`${itemInfo.name} - ${settings.global.meta.title}`}</title>
          </Head>

            <KeyHandler keyEventName="keydown" keyValue="ArrowUp" onKeyHandle={handleUp} />
            <KeyHandler keyEventName="keydown" keyValue="ArrowDown" onKeyHandle={handleDown} />

            <div className="product-scroll" ref={(x) => productScrollEl = x }>
              <div className="column-content landscape-layout">
                <div className="verification-product-card row">
                  Product Card
                </div>
                <div className="verification-mosaic-wrap logo" key="v-logo">
                  <div className="verification-product-logo" style={getRelationStyle(itemInfo.relation)}>
                    <img src={assetPath(itemInfo.href)} className='verification-product-logo-img'/>
                  </div>
                </div>
                <div className="verification-mosaic-wrap logo" key="v-member">
                  <img src={assetPath(settings.global.lfn_logo)} className='verification-product-logo-img'/>
                </div>

                <div className="verification-mosaic-wrap logo" key="v-aalogo">
                  <div className="verification-product-logo" style={getRelationStyle(itemInfo.relation)}>
                    <img src={assetPath(settings.global.aa_logo)} className='verification-product-logo-img'/>
                  </div>
                </div>

                <div className="verification-mosaic-product" key="v-description">
                  <span className="product_label">Product Name: &nbsp;</span>{itemInfo.name}
                </div>
                <div className="verification-mosaic-product" key="v-product">
                  <span className="product_description_label">Product Description: &nbsp;</span>{itemInfo.description}
                </div>
                <div className="verification-mosaic-description" key="v-category">
                  <span className="product_label">Badge Category: &nbsp;</span> { itemCategory(itemInfo.landscape) }
                </div>
                <div className="verification-mosaic-description type" key="v-category2">
                  <span className="product_label">Type: &nbsp;</span><span>{`${itemInfo.type}`}</span>
                </div>
                <div className="verification-mosaic-product" key="v-description">
                  <span className="product_label">Website: &nbsp; https://landscape.lfnetworking.org</span>
                </div>
              </div>
            </div>
        </div>
  );
}
export default VerificationItemDialogContent
