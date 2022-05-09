import React from 'react';
import assetPath from '../utils/assetPath';

const OutboundLink = ({to, className, children}) =>
    (<a data-type="external" href={to} className={className}>{children}</a>)
const InternalLink = ({to, className, children}) =>
  (<a data-type="tab" href={to} className={className}>{children}</a>)

import { stringifyParams } from '../utils/routing'
import { categoryBorder, categoryTitleHeight, subcategoryTitleHeight } from '../utils/landscapeCalculations'

const CardLink = ({ url, children }) => {
  const Component = url.indexOf('http') === 0 ? OutboundLink : InternalLink
  const to = url.indexOf('http') === 0 ? url : stringifyParams({ mainContentMode: url })

  return <Component to={to} style={{ display: 'flex', flexDirection: 'column' }}>{children}</Component>
}

const OtherLandscapeLink = function({top, left, height, width, color, title, image, url, layout}) {
  const imageSrc = image || assetPath(`images/${url}_preview.png`);
  if (layout === 'category') {
    return <div style={{
      position: 'absolute', top, left, height, width, background: color,
      overflow: 'hidden',
      cursor: 'pointer',
      boxShadow: `0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)`,
      padding: 1,
      display: 'flex'
    }}>
      <CardLink url={url}>
        <div style={{ width, height: 30, lineHeight: '28px', textAlign: 'center', color: 'white', fontSize: 12}}>{title}</div>
        <div style={{ flex: 1, background: 'white', position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <img loading="lazy" src={imageSrc} style={{ width: width - 12, height: height - 42,
              objectFit: 'contain', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }} alt={title} />
        </div>
      </CardLink>
  </div>
  }
  if (layout === 'subcategory') {
    return <div style={{ width, left, height, top, position: 'absolute', overflow: 'hidden' }}>
      <CardLink url={url}>
        <div
          style={{
            position: 'absolute',
            background: color,
            top: subcategoryTitleHeight,
            bottom: 0,
            left: 0,
            right: 0,
            boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.2)',
            padding: categoryBorder,
            display: 'flex'
          }}
        >
          <div style={{
            width: categoryTitleHeight,
            writingMode: 'vertical-rl',
            transform: 'rotate(180deg)',
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 12,
            lineHeight: '13px',
            color: 'white'
          }}>
            {title}
          </div>
          <div style={{ display: 'flex', flex: 1, background: 'white', justifyContent: 'center', alignItems: 'center' }}>
            <img loading="lazy" src={imageSrc} alt={title}
                 style={{ width: width - 42, height: height - 32, objectFit: 'contain', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }} />
          </div>
        </div>
      </CardLink>
    </div>;
  }
}
export default OtherLandscapeLink;
