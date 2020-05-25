import React from 'react';
import { pure } from 'recompose';

const OtherLandscapeLink = function({top, left, height, width, color, onClick, title, url, layout}) {
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
        <img loading="lazy" src={`images/${url}_preview.png`} style={{ width: width - 10, height: height - 40, margin: 5,
          objectFit: 'contain', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }} alt={title} />
      </div>
  </div>
  }
  if (layout === 'subcategory') {
    return <div style={{position: 'absolute', top, left, height, width, cursor: 'pointer' }} onClick={onClick}>
      <div style={{ width, top: 0, height: 20, lineHeight: '20px', textAlign: 'center', color: 'white', fontSize: 11}}>{title}</div>
      <img loading="lazy" src={`images/${url}_preview.png`} alt={title}
           style={{ width: width, height: height - 20, objectFit: 'contain', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }} />
    </div>;
  }
}
export default pure(OtherLandscapeLink);
