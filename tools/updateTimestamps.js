const { updateProcessedLandscape } = require("./processedLandscape");

updateProcessedLandscape(processedLandscape => {
  return { ...processedLandscape, updated_at: new Date() };
});
