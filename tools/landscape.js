import path from "path";
import { projectPath } from "./settings";
import { readFileSync, writeFileSync } from "fs";
import { dump } from "./yaml";

const landscapePath = path.resolve(projectPath, 'landscape.yml');

export const landscape = require('js-yaml').safeLoad(readFileSync(landscapePath));

export const saveLandscape = (newLandscape) => {
  writeFileSync(landscapePath, dump(newLandscape));
}
