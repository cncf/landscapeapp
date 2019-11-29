import React from 'react';
import { pure } from 'recompose';

const OtherLandscapeLink = function({zoom, top, left, height, width, color, onClick, title, url, layout}) {
  if (layout === 'category') {
    return (<div style={{
      position: 'absolute', top: (top - 5) * zoom, left: left * zoom, height: height * zoom, margin: 5 * zoom, width: (width + 2) * zoom, background: 'white', border: `${1 * zoom}px solid ${color}`,
      cursor: 'pointer',
      boxShadow: `0 ${4 * zoom}px ${8 * zoom}px 0 rgba(0, 0, 0, 0.2), 0 ${6 * zoom}px ${20 * zoom}px 0 rgba(0, 0, 0, 0.19)`
    }} onClick={onClick} >
    <div style={{ width: width * zoom, height: 20 * zoom, lineHeight: `${20 * zoom}px`, textAlign: 'center', color: 'white', background: color, fontSize: 12 * zoom}}> {title} </div>
    <img loading="lazy" src={`images/${url}_preview.png`} style={{ width: (width - 10) * zoom, height: (height - 40) * zoom, margin: 5 * zoom,
      objectFit: 'contain', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }} alt={title} />
  </div>);
  }
  if (layout === 'subcategory') {
    return (<div style={{
      position: 'absolute', top: (top -5) * zoom, left: left * zoom, height: height * zoom, margin: 5 * zoom, width: (width + 2) * zoom,
      cursor: 'pointer',
    }} onClick={onClick} >
    <div style={{ width: width * zoom, height: 20 * zoom, lineHeight: `${20 * zoom}px`, textAlign: 'center', color: 'white', fontSize: 11 * zoom}}> {title}</div>
    <img loading="lazy" src={`images/${url}_preview.png`} style={{ width: (width - 10) * zoom, height: (height - 40) * zoom, margin: 5 * zoom,
      objectFit: 'contain', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }} alt={title} />
  </div>);
  }
}
export default pure(OtherLandscapeLink);
