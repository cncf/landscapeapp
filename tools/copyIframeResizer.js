import fs from 'fs';

const iframeResizerContent = fs.readFileSync('out/iframeResizer.js', 'utf-8');
const resizerConfig = fs.readFileSync('src/iframeResizer.js', 'utf-8');

const finalResizer = (iframeResizerContent + '\n' + resizerConfig).replace('sourceMap', '');

require('fs').writeFileSync('out/iframeResizer.js', finalResizer);
