import { updateProcessedLandscape } from "./processedLandscape";

updateProcessedLandscape((processedLandscape) => {
  const count = process.argv[2] ? parseInt(process.argv[2]) : 0;
  return { ...processedLandscape, twitter_options: { count } };
});

