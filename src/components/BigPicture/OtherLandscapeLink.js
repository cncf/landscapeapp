import React from 'react';
import { pure } from 'recompose';
import assetPath from '../../utils/assetPath'
import OutboundLink from '../OutboundLink'
import InternalLink from '../InternalLink'
import { stringifyParams } from '../../utils/routing'

const ImageLink = ({ url, children }) => {
  const Component = url.indexOf('http') === 0 ? OutboundLink : InternalLink
  const to = url.indexOf('http') === 0 ? url : stringifyParams({ mainContentMode: url })

  return <Component to={to}>{children}</Component>
}

const OtherLandscapeLink = function({top, left, height, width, color, onClick, title, image, url, layout}) {
  const imageSrc = image || assetPath(`/images/${url}_preview.png`)
  if (layout === 'category') {
    return <div style={{
      position: 'absolute', top, left, height, width, background: color,
      cursor: 'pointer',
      boxShadow: `0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)`,
      display: 'flex',
      flexDirection: 'column',
      padding: 1
    }} onClick={onClick} >
      <div style={{ width, height: 30, lineHeight: '25px', textAlign: 'center', color: 'white', fontSize: 12}}>{title}</div>
      <div style={{ flex: 1, background: 'white'}}>
        <ImageLink url={url}>
          <img loading="lazy" src={imageSrc} style={{ width: width - 10, height: height - 40, margin: 5,
            objectFit: 'contain', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }} alt={title} />
        </ImageLink>
      </div>
  </div>
  }
  if (layout === 'subcategory') {
    return <div style={{position: 'absolute', top, left, height, width, cursor: 'pointer' }} onClick={onClick}>
      <div style={{ width, top: 0, height: 20, lineHeight: '20px', textAlign: 'center', color: 'white', fontSize: 11}}>{title}</div>
      <ImageLink url={url}>
        <img loading="lazy" src={imageSrc} alt={title}
             style={{ width: width, height: height - 20, objectFit: 'contain', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }} />
      </ImageLink>
    </div>;
  }
}
export default pure(OtherLandscapeLink);
