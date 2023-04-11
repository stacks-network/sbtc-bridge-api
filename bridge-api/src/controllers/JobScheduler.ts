import cron from 'node-cron';
import { saveAllSbtcEvents } from '../lib/sbtc_rpc.js';
import { findAllInitialPeginRequests } from '../lib/payments_rpc.js';


export const sbtcEventJob = cron.schedule('*/15 * * * *', (fireDate) => {
  console.log('Running: sbtcEventJob at: ' + fireDate);
  try {
    saveAllSbtcEvents();
  } catch (err) {
    console.log('Error running: saveAllSbtcEvents: ', err);
  }
});

export const peginRequestJob = cron.schedule('*/7 * * * *', (fireDate) => {
  console.log('Running: peginRequestJob at: ' + fireDate);
  try {
    const pegins = findAllInitialPeginRequests();
  } catch (err) {
    console.log('Error running: findAllInitialPeginRequests: ', err);
  }
});


