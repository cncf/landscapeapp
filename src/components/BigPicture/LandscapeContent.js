import React, { useContext, useEffect, useRef, useState } from 'react';
import _ from 'lodash';
import LandscapeContext from '../../contexts/LandscapeContext'
import assetPath from '../../utils/assetPath'


// Load prerendered item
const LandscapeContent = ({zoom, padding = 10 }) => {
  const contentEl = useRef(null);
  const [content, setContent] = useState(null);
  const { groupedItems, landscapeSettings, width, height } = useContext(LandscapeContext)
  const style = {
    padding,
    width: width + 2 * padding,
    height: height + 2 * padding,
    transform: `scale(${zoom})`,
    transformOrigin: '0 0'
  }

  useEffect( async () => {
    if (!content) {
      const result = await fetch(assetPath(`/data/items/landscape-${landscapeSettings.url}.html`));
      const text = await result.text();
      setContent(text);
    } else {
      contentEl.current.innerHTML = content;
    }
  });

  return <div className="inner-landscape" style={style} ref={contentEl}></div>;
};

export default LandscapeContent;
