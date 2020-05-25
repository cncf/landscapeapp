import React from 'react';
import { pure } from 'recompose';
import _ from 'lodash';

const LandscapeInfo = ({width, height, top, left, childrenInfo}) => {
  const children = childrenInfo.map(function(info) {
    const positionProps = {
        position: 'absolute',
        top: _.isUndefined(info.top) ? null : info.top,
        left: _.isUndefined(info.left) ? null : info.left,
        right: _.isUndefined(info.right) ? null : info.right,
        bottom: _.isUndefined(info.bottom) ? null : info.bottom,
        width: _.isUndefined(info.width) ? null : info.width,
        height: _.isUndefined(info.height) ? null : info.height
    };
    if (info.type === 'text') {
      // pdf requires a normal version without a zoom trick
      if (window.location.href.indexOf('&pdf') !== -1) {
        return <div key='text' style={{
          ...positionProps,
          fontSize: info.font_size,
          fontStyle: 'italic',
          textAlign: 'justify',
          zIndex: 1
        }}>{info.text}</div>
      // while in a browser we use a special version which renders fonts
      // properly on a small zoom
      } else {
        return <div key='text' style={{
          ...positionProps,
          fontSize: info.font_size * 4,
          fontStyle: 'italic',
          textAlign: 'justify',
          zIndex: 1
        }}><div style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: '400%',
          height: '100%',
          transform: 'scale(0.25)',
          transformOrigin: 'left'
        }}> {info.text} </div></div>


      }
    }
    if (info.type === 'title') {
      return <div key='title' style= {{
        ...positionProps,
        fontSize: info.font_size,
        color: '#666'
      }}>{info.title}</div>
    }
    if (info.type === 'image') {
      return <img src={`images/${info.image}`} style={{...positionProps}} key={info.image} alt={info.title || info.image} />
    }
  });

  return <div style={{
    position: 'absolute',
    width: width,
    height: height - 20,
    top: top,
    left: left,
    border: '1px solid black',
    background: 'white',
    borderRadius: 10,
    marginTop: 20,
    boxShadow: `0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)`
  }}>{children}</div>
}
export default pure(LandscapeInfo);
