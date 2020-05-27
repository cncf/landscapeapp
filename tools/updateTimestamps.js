import { updateProcessedLandscape } from "./processedLandscape";

updateProcessedLandscape(processedLandscape => {
  return { ...processedLandscape, updated_at: new Date() };
});
