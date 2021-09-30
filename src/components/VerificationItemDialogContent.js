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
                <div className="verification-mosaic-wrap" key="v-logo">
                  <div className="verification-product-logo" style={getRelationStyle(itemInfo.relation)}>
                    <img src={assetPath(itemInfo.href)} className='verification-product-logo-img'/>
                  </div>
                </div>
                <div className="verification-mosaic-wrap" key="v-member">LFN Member Level</div>

                <div className="verification-mosaic-wrap" key="v-aalogo">
                  <div className="verification-product-logo" style={getRelationStyle(itemInfo.relation)}>
                    <img src={assetPath('images/anuket_assured.svg')} className='verification-product-logo-img'/>
                  </div>
                </div>

                <div className="verification-mosaic-product" key="v-product">
                  {itemInfo.name}
                </div>

                <div className="verification-mosaic-description" key="v-description">
                  {itemInfo.description}
                </div>

                <div className="verification-mosaic-description" key="v-indication">
                  Indication of release {itemInfo.extra && itemInfo.extra.version &&
                    <span>
                      ({itemInfo.extra.version})
                    </span>
                  }
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
