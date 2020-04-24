import React from 'react';
import { pure } from 'recompose';

const OtherLandscapeLink = function({top, left, height, width, color, onClick, title, url, layout}) {
  if (layout === 'category') {
    return (<div style={{
      position: 'absolute', top: top - 5, left: left, height: height, margin: 5, width: width + 2, background: 'white', border: `1px solid ${color}`,
      cursor: 'pointer',
      boxShadow: `0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)`
    }} onClick={onClick} >
    <div style={{ width: width, height: 20, lineHeight: 20, textAlign: 'center', color: 'white', background: color, fontSize: 12}}> {title} </div>
    <img loading="lazy" src={`images/${url}_preview.png`} style={{ width: width - 10, height: height - 40, margin: 5,
      objectFit: 'contain', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }} alt={title} />
  </div>);
  }
  if (layout === 'subcategory') {
    return (<div style={{
      position: 'absolute', top: top - 5, left: left, height: height, margin: 5, width: width + 2,
      cursor: 'pointer',
    }} onClick={onClick} >
    <div style={{ width: width, height: 20, lineHeight: 20, textAlign: 'center', color: 'white', fontSize: 11}}> {title}</div>
    <img loading="lazy" src={`images/${url}_preview.png`} style={{ width: width - 10, height: height - 40, margin: 5,
      objectFit: 'contain', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }} alt={title} />
  </div>);
  }
}
export default pure(OtherLandscapeLink);
