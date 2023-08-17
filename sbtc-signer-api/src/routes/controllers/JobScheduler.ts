import cron from 'node-cron';
import { saveAllAlphaEvents } from './utils/AlphaEventsApi.js';

export const updateEventLogJob = cron.schedule('*/5 * * * *', (fireDate) => {
  console.log('Running: sbtcEventJob at: ' + fireDate);
});


export const sbtcEventJob = cron.schedule('*/17 * * * *', (fireDate) => {
  console.log('Running: sbtcEventJob at: ' + fireDate);
  try {
    saveAllAlphaEvents();
  } catch (err) {
    console.log('Error running: saveAllAlphaEvents: ', err);
  }
});
