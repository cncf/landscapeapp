import updateProcessedLandscape from "./updateProcessedLandscape";

updateProcessedLandscape((processedLandscape) => {
  return { ...processedLandscape, twitter_options: { count: 0 } };
});

