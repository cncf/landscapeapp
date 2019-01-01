// locate zoom buttons

import React from 'react';
import { pure } from 'recompose';

const Zoom = function({zoom, children}) {
  return <div style={{position:'relative', zoom: zoom}}>
    {children}
  </div>
}
export default pure(Zoom);
