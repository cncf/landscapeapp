import { resolve } from 'path';
import { readFileSync } from 'fs';
import { projectPath } from './settings';
export const projects = JSON.parse(readFileSync(resolve(projectPath, 'data.json')));
