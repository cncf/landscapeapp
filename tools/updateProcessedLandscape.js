import { projectPath } from './settings';
import { writeFileSync, readFileSync, existsSync } from "fs";
import { resolve } from "path";
import { safeLoad } from "js-yaml";
import { dump } from "./yaml";

const updateProcessedLandscape = (callback) => {
  const path = resolve(projectPath, 'processed_landscape.yml');
  const processedLandscape = existsSync(path) ? safeLoad(readFileSync(path)) : {};
  const updatedProcessedLandscape = callback(processedLandscape);
  const newContent = "# THIS FILE IS GENERATED AUTOMATICALLY!\n" + dump(updatedProcessedLandscape);
  writeFileSync(path, newContent);
}

export default updateProcessedLandscape;
