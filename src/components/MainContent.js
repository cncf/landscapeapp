import React, { useContext, useEffect, useState, useRef } from 'react';
import _ from 'lodash';
import LandscapeContext from '../contexts/LandscapeContext'
import { useRouter } from 'next/router'
import { stringifyParams } from '../utils/routing'
import useCurrentDevice from '../utils/useCurrentDevice'
import assetPath from '../utils/assetPath'

// we fetch all cards and order them based by a list
// items are preloaded from an html list

const buildHeader = function({header, count, href}) {
  const div = document.createElement('div');
  div.classList.add('sh_wrapper');
  div.innerHTML = `
      <div style="font-size: 24px; padding-left: 16px; line-height: 48px; font-weight: 500;">
        ${ href ? `<a href=${href}>${header}</a>` : `<span>${header}</span>` }
        <a href="${href}"></a>
        <span class="items-cont">(${count})</span>
      </div>
  `;
  return div;
}

const MainContent = () => {
  const { navigate, params, groupedItems } = useContext(LandscapeContext)
  const { cardStyle, isEmbed } = params
  const currentDevice = useCurrentDevice()
  const loader = useRef(null);

  const [ cards, setCards ] = useState(null);
  // lets construct a content
  const buildContent = function() {
    const itemsAndHeaders = groupedItems.flatMap(groupedItem => {
      const items = groupedItem.items;
      const cardElements = items.map( (item) => cards[item.id].cloneNode(true))
      const header = items.length > 0 ? buildHeader({
        header: groupedItem.header,
        count: groupedItem.items.length,
        href: groupedItem.href}) : null;

      return [ header, ...cardElements];
    });
    const fragment = document.createDocumentFragment();
    for (let item of itemsAndHeaders) {
      if (item) {
        fragment.appendChild(item);
      }
    }
    return fragment;
  };

  useEffect(async () => {
    if (!cards) {
      const response = await fetch(assetPath(`/data/items/cards-${cardStyle}.html`));
      const allCards = await response.text();
      const container = document.createElement('div');
      container.innerHTML = allCards;
      const cardElements = container.querySelectorAll('[data-id]');
      let result = {};
      for (let card of cardElements) {
        result[card.getAttribute('data-id')] = card;
      }
      setCards(result);
    }
  });

  useEffect( () => {
    if (cards) {
      const fragment = buildContent();
      loader.current.replaceChildren(fragment);
    }
    if (!loader.current.eventsAttached) {
      loader.current.eventsAttached = true;
      loader.current.addEventListener('click', function(e) {
        const cardEl = e.target.closest('[data-id]');
        const selectedItemId = cardEl.getAttribute('data-id');
        if (currentDevice.mobile && isEmbed) {
          const url = stringifyParams({ ...params, selectedItemId })
          window.open(url,'_blank')
        } else {
          navigate({ selectedItemId }, { scroll: false })
        }
      }, false);
    }
  });

  return (
    <div className={'column-content'} ref={loader} />
  );
};

export default MainContent;
