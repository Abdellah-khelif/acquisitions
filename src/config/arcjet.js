import arcjet, { shield, detectBot, slidingWindow } from '@arcjet/node';

const aj = arcjet({
  key: process.env.ARCJET_KEY,
  rules: [
    shield({ mode: 'DRY_RUN' }), // Less strict for development
    detectBot({
      mode: 'DRY_RUN', // Allow more requests in development
      allow: ['CATEGORY:SEARCH_ENGINE', 'CATEGORY:PREVIEW', 'CATEGORY:TOOL'],
    }),
    slidingWindow({
      mode: 'LIVE',
      interval: '1m', // More generous time window
      max: 50, // Higher limit for development
    }),
  ],
});

export default aj;
