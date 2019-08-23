import path from 'path';
import { projectPath } from './settings';
export const processedLandscape = require('js-yaml').safeLoad(require('fs')
                                                    .readFileSync(path.resolve(projectPath,'processed_landscape.yml')));
