import { projectPath } from './settings';
import fs from 'fs';
import path from 'path';

const iframeResizerContent = fs.readFileSync(path.join(projectPath, 'dist/iframeResizer.js'), 'utf-8');
const resizerConfig = fs.readFileSync('src/iframeResizer.js', 'utf-8');

const finalResizer = (iframeResizerContent + '\n' + resizerConfig).replace('sourceMap', '');

require('fs').writeFileSync(path.join(projectPath, 'dist/iframeResizer.js'), finalResizer);
