import React, { useContext, useState, useEffect, useRef } from 'react';
import Dialog from '@material-ui/core/Dialog';
import classNames from 'classnames'
import ItemDialogContent from './ItemDialogContent';
import ItemDialogButtons from './ItemDialogButtons'
import LandscapeContext from '../contexts/LandscapeContext'
import useSWR from 'swr'
import assetPath from '../utils/assetPath'
import settings from 'public/settings.json';
import qs from 'query-string';
import { stringifyParams } from '../utils/routing'


const ItemDialog = _ => {
  const [content, setContent] = useState({});
  const { navigate, params, entries } = useContext(LandscapeContext)
  const contentEl = useRef(null);
  const { onlyModal, selectedItemId } = params
  useEffect(async () => {
    if (!content[selectedItemId]) {
      const result = await fetch(`/data/info-${selectedItemId}.html`);
      const text = await result.text();
      setContent({...content, [selectedItemId]: text});
    }
    if (content[selectedItemId]) {
      contentEl.current.innerHTML = content[selectedItemId];

      const tweetEl = contentEl.current.querySelector('.tweet-button a');
      if (tweetEl) {
        // fix twitter url
        const { origin, pathname } = window.location
        const url = `${origin}${pathname}`
        const { text } = settings.twitter
        const paramsText = qs.stringify({ text, url })
        const twitterUrl = `https://twitter.com/intent/tweet?${paramsText}`
        tweetEl.href = twitterUrl;
      }

      // also we need to intercept those clicks and instead navigate inside
      const specialLinks = contentEl.current.querySelectorAll('a[data-url]');
      for (let linkEl of specialLinks) {
        const linkElParams = JSON.parse(linkEl.getAttribute('data-url'));
        const href = stringifyParams({...linkElParams});
        linkEl.href = href;
      }
    }

    // attach all click handlers
    if (!contentEl.current.handlersAttached) {
      contentEl.current.handlersAttached = true;

    }
  });
  const closeDialog = _ => onlyModal ? _ : navigate({ selectedItemId: null }, { scroll: false })

  return (
      <Dialog open={!!selectedItemId} onClose={closeDialog} transitionDuration={400}
        classes={{paper:'modal-body'}}
        className={classNames('modal', 'product')}>
          { !onlyModal && <ItemDialogButtons closeDialog={closeDialog} /> }
          <div ref={contentEl} />
      </Dialog>
  );
}
export default ItemDialog;
