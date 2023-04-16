import cron from 'node-cron';
import { saveAllSbtcEvents } from '../lib/sbtc_rpc.js';
import { findAllInitialPeginRequests } from '../lib/bitcoin/rpc_commit.js';
import { checkReveal } from '../lib/bitcoin/rpc_reveal.js';

export const sbtcEventJobTestnet = cron.schedule('*/15 * * * *', (fireDate) => {
  console.log('Running: sbtcEventJobTestnet at: ' + fireDate);
  try {
    saveAllSbtcEvents('testnet');
  } catch (err) {
    console.log('Error running: saveAllSbtcEvents: ', err);
  }
});

export const sbtcEventJobMainnet = cron.schedule('*/15 * * * *', (fireDate) => {
  console.log('Running: sbtcEventJobMainnet at: ' + fireDate);
  try {
    saveAllSbtcEvents('mainnet');
  } catch (err) {
    console.log('Error running: saveAllSbtcEvents: ', err);
  }
});

export const peginRequestJobTestnet = cron.schedule('*/12 * * * *', (fireDate) => {
  console.log('Running: peginRequestJobTestnet at: ' + fireDate);
  try {
    findAllInitialPeginRequests('testnet');
  } catch (err) {
    console.log('Error running: findAllInitialPeginRequests: ', err);
  }
});

export const peginRequestJobMainnet = cron.schedule('*/17 * * * *', (fireDate) => {
  console.log('Running: peginRequestJobMainnet at: ' + fireDate);
  try {
    findAllInitialPeginRequests('mainnet');
  } catch (err) {
    console.log('Error running: findAllInitialPeginRequests: ', err);
  }
});

export const revealCheckTestnet = cron.schedule('*/12 * * * *', (fireDate) => {
  console.log('Running: peginRequestJobTestnet at: ' + fireDate);
  try {
    checkReveal();
  } catch (err) {
    console.log('Error running: findAllInitialPeginRequests: ', err);
  }
});


