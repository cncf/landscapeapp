import React from 'react';
import _ from 'lodash';

import settings from 'project/settings.yml'

import {HorizontalCategory, VerticalCategory } from './Elements';
import LandscapeInfo from './LandscapeInfo';
import ServerlessLink from './ServerlessLink';



const MainContent2 = ({groupedItems, onSelectItem, style, showPreview, switchToServerless, zoom }) => {
  const elements = settings.big_picture.main.elements.map(function(element) {
    if (element.type === 'HorizontalCategory') {
      const cat = _.find(groupedItems, {key: element.category});
      return <HorizontalCategory {...cat} {..._.pick(element, ['rows','width','height','top','left','color']) }
        zoom={zoom}
        onSelectItem={onSelectItem}
      />
    }
    if (element.type === 'VerticalCategory') {
      const cat = _.find(groupedItems, {key: element.category});
      return <VerticalCategory {...cat} {..._.pick(element, ['cols','width','height','top','left','color']) }
        zoom={zoom}
        onSelectItem={onSelectItem}
      />
    }
    if (element.type === 'SecondLandscapeLink') {
      return <ServerlessLink {..._.pick(element, ['width','height','top','left','color']) }
        zoom={zoom}
        showPreview={showPreview}
        onClick={switchToServerless}
      />
    }
    if (element.type === 'LandscapeInfo') {
      return <LandscapeInfo {..._.pick(element, ['width', 'height', 'top', 'left']) } childrenInfo={element.children}
        zoom={zoom}
      />
    }
    return null;
  });
  return (<div style={{...style, position: 'relative', ...settings.big_picture.main.size }}>
    {elements}
  </div>);
  return <div style={{...style, position: 'relative', width: 1620, height: 900 }}>
    <HorizontalCategory {...cat1} rows={6} width={1050} height={230} top={0} left={0} zoom={zoom} color="rgb(78, 171, 207)" onSelectItem={onSelectItem} />
    <HorizontalCategory {...cat2} rows={3} width={1050} height={140} top={240} left={0} zoom={zoom} color="rgb(104, 145, 145)" onSelectItem={onSelectItem} />
    <HorizontalCategory {...cat3} rows={3} width={1050} height={140} top={390} left={0} zoom={zoom} color="rgb(74, 131, 104)" onSelectItem={onSelectItem}/>
    <HorizontalCategory {...cat4} rows={4} width={1050} height={160} top={550} left={0} zoom={zoom} color="rgb(108, 135, 75)" onSelectItem={onSelectItem}/>
    <HorizontalCategory {...cat5} rows={4} width={220} height={160} top={720} left={0} zoom={zoom} color="rgb(64, 89, 163)" onSelectItem={onSelectItem} />
    <VerticalCategory {...cat6} cols={6} width={240} height={710} top={0} left={1070} zoom={zoom} color="rgb(130, 207, 231)" onSelectItem={onSelectItem} />
    <VerticalCategory {...cat7} cols={7} width={280} height={525} top={0} left={1320} zoom={zoom} color="rgb(142, 209, 216)" onSelectItem={onSelectItem} />
    <HorizontalCategory {...cat8} rows={4} width={940} height={160} top={720} left={660} zoom={zoom} color="rgb(124, 200, 182)" onSelectItem={onSelectItem} />
    <LandscapeInfo width={390} height={160} top={720} left={250} zoom={zoom}>
      This landscape is intended as a map through the previously uncharted terrain of cloud native technologies.
      There are many routes to deploying a cloud native application, with CNCF Projects representing a particularly well-traveled path
    </LandscapeInfo>
    <ServerlessLink left={1320} top={535} width={280} height={175} color="rgb(118, 181, 237)" zoom={zoom} showPreview={showPreview} onClick={switchToServerless} />
  </div>
};

export default MainContent2;
