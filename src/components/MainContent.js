import React, { useContext, useEffect, useState } from 'react';
import StarIcon from '@material-ui/icons/Star';
import millify from 'millify'
import classNames from 'classnames'
import ListSubheader from '@material-ui/core/ListSubheader';
import _ from 'lodash';
import InternalLink from './InternalLink';
import fields from '../types/fields';
import EntriesContext from '../contexts/EntriesContext'
import assetPath from '../utils/assetPath'

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

const Card = ({item, handler, ...props}) => {
  const { params } = useContext(EntriesContext)
  const { cardStyle } = params
  if (cardStyle === 'flat') {
    return FlatCard({item, handler, ...props});
  } else if (cardStyle === 'borderless') {
    return BorderlessCard({item, handler, ...props});
  } else {
    return DefaultCard({item, handler, ...props});
  }
}

const DefaultCard = ({item, handler, itemRef, ...props}) => {
  return (
            <div ref={itemRef} className="mosaic-wrap" key={item.id} {...props}>
            <div className={classNames('mosaic', {nonoss : item.oss === false})} style={getRelationStyle(item.relation)}
              onClick={() => handler(item.id)} >
              <div className="logo_wrapper">
                <img src={assetPath(item.href)} className='logo' max-height='100%' max-width='100%' alt={item.name} />
              </div>
              <div className="mosaic-info">
                <div className="mosaic-title">
                  <h5>{item.name}</h5>
                  {item.organization}
                </div>
                <div className="mosaic-stars">
                  { _.isNumber(item.stars) && item.stars &&
                      <div>
                        <StarIcon color="disabled" style={{ fontSize: 15 }}/>
                        <span style={{position: 'relative', top: -3}}>{item.starsAsText}</span>
                      </div>
                  }
                  { Number.isInteger(item.amount) &&
                      <div className="mosaic-funding">{item.amountKind === 'funding' ? 'Funding: ': 'MCap: '} {'$'+ millify( item.amount )}</div>
                  }
                </div>
              </div>
            </div>
          </div>
  );
}

const FlatCard = function({item, handler, itemRef, ...props}) {
  return (
            <div ref={itemRef} className="mosaic-wrap" key={item.id} {...props}>
              <div className="mosaic" onClick={() => handler(item.id)} >
                <img src={assetPath(item.href)} className='logo' alt={item.name} />
                <div className="separator"/>
                <h5>{item.flatName}</h5>
              </div>
            </div>
  );
}

const BorderlessCard = function({item, handler, itemRef, ...props}) {
  return (
            <div className="mosaic-wrap" key={item.id} {...props}>
              <div className="mosaic" onClick={() => handler(item.id)} >
                <img src={assetPath(item.href)} className='logo' alt={item.name} />
              </div>
            </div>
  );
}

const Header = ({groupedItem, ...props}) => {
  return (
          <div className="sh_wrapper" key={"subheader:" + groupedItem.header} {...props}>
            <ListSubheader component="div" style={{fontSize: 24, paddingLeft: 16 }}>
              { groupedItem.href ?  <InternalLink  to={groupedItem.href}>{groupedItem.header}</InternalLink> : <span>{groupedItem.header}</span> }
              <span className="items-count"> ({groupedItem.items.length})</span></ListSubheader>
          </div>
  );
}

/*
 That is quite a complex component. It draws headers and cards, and also animates the difference
     - previous list of items is remembered every time, lately referenced as 'old'
     - we scroll to the top after every change, so we need to animate only those items which are at the start
     - if a card was visible with previous parameters and is visible with current parameters, we apply a 'move' animation
     - otherwise, old items fade out and new items fade in
     - for performance, we draw first 30 items with animations, and delay rendering of the remaining parts to provide a quicker response to the user
     - those 30 items are just an estimation, we calculate weather a card or a header are really visible in the current viewport or not
*/



const MainContent = ({groupedItems}) => {
  const { navigate, params } = useContext(EntriesContext)
  const { cardStyle, isEmbed } = params
  const [ready, setReady] = useState(isEmbed)

  useEffect(() => {
    setReady(true)
  }, [])

  const handler = itemId => {
    // TODO: this is preventing from opening the modal
    // TODO: add isSpecialMode
    // const isSpecialMode = (isBrowser() && (currentDevice.mobile() || window.innerWidth < 768)) && isEmbed();
    // isSpecialMode ? onOpenItemInNewTab(itemId) : onSelectItem(itemId);

    navigate({ selectedItemId: itemId })
  };

  let itemsCount = 0
  const maxItems = 100

  const itemsAndHeaders = groupedItems.flatMap(groupedItem => {
    if (itemsCount > maxItems && !ready) {
      return []
    }

    const items = ready ? groupedItem.items : groupedItem.items.slice(0, maxItems - itemsCount)

    itemsCount += items.length

    const cards = items.map(item => {
      return <Card key={item.id} item={item} handler={handler} />;
    })
    return [
      <Header key={groupedItem.href} groupedItem={groupedItem} />,
      ...cards
    ]
  });

  return (
    <div className={classNames('column-content', {[cardStyle + '-mode']: true})}>
      { itemsAndHeaders }
    </div>
  );
};

export default MainContent;
