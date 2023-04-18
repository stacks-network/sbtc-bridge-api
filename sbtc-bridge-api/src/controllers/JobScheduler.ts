import cron from 'node-cron';
import { saveAllSbtcEvents } from '../lib/sbtc_rpc.js';
import { findAllInitialPeginRequests } from '../lib/bitcoin/rpc_commit.js';
import { checkReveal } from '../lib/bitcoin/rpc_reveal.js';

export const sbtcEventJob = cron.schedule('*/17 * * * *', (fireDate) => {
  console.log('Running: sbtcEventJob at: ' + fireDate);
  try {
    saveAllSbtcEvents();
  } catch (err) {
    console.log('Error running: saveAllSbtcEvents: ', err);
  }
});

export const peginRequestJob = cron.schedule('*/11 * * * *', (fireDate) => {
  console.log('Running: peginRequestJob at: ' + fireDate);
  try {
    findAllInitialPeginRequests();
  } catch (err) {
    console.log('Error running: findAllInitialPeginRequests: ', err);
  }
});

export const revealCheckJob = cron.schedule('*/23 * * * *', (fireDate) => {
  console.log('Running: revealCheckJob at: ' + fireDate);
  try {
    checkReveal();
  } catch (err) {
    console.log('Error running: findAllInitialPeginRequests: ', err);
  }
});


