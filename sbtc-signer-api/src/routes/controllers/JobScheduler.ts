import cron from 'node-cron';

export const updateEventLogJob = cron.schedule('*/5 * * * *', (fireDate) => {
  console.log('Running: sbtcEventJob at: ' + fireDate);
});
