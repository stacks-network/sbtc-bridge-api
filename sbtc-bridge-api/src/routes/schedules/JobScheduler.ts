import cron from 'node-cron';
import { saveAllSbtcEvents } from '../events/events_helper.js';
import { scanBridgeTransactions, scanPeginRRTransactions } from '../../lib/bitcoin/rpc_commit.js';
import { updateExchangeRates } from '../../lib/bitcoin/api_blockcypher.js';
import { checkReveal } from '../../lib/bitcoin/rpc_reveal.js';

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
    scanBridgeTransactions();
    scanPeginRRTransactions();
  } catch (err) {
    console.log('Error running: scanBridgeTransactions: ', err);
  }
});

export const revealCheckJob = cron.schedule('*/23 * * * *', (fireDate) => {
  console.log('Running: revealCheckJob at: ' + fireDate);
  try {
    checkReveal();
  } catch (err) {
    console.log('Error running: revealCheckJob: ', err);
  }
});

export const exchangeRates = cron.schedule('*/5 * * * *', (fireDate) => {
  console.log('Running: exchangeRates at: ' + fireDate);
  try {
    updateExchangeRates();
  } catch (err) {
    console.log('Error running: exchangeRates: ', err);
  }
});
