import updateProcessedLandscape from "./updateProcessedLandscape";

updateProcessedLandscape(processedLandscape => {
  return { ...processedLandscape, updated_at: new Date() };
});
