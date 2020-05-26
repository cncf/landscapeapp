import { projectPath } from './settings';
import { writeFileSync, readFileSync, existsSync } from "fs";
import { resolve } from "path";
import { safeLoad } from "js-yaml";
import { dump } from "./yaml";

const path = resolve(projectPath, 'processed_landscape.yml');
export const processedLandscape = existsSync(path) ? safeLoad(readFileSync(path)) : {};

export const updateProcessedLandscape = async callback => {
  const updatedProcessedLandscape = await callback(processedLandscape);
  const newContent = "# THIS FILE IS GENERATED AUTOMATICALLY!\n" + dump(updatedProcessedLandscape);
  writeFileSync(path, newContent);
}
