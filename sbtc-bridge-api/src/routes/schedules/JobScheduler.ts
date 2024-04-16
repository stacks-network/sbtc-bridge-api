import cron from 'node-cron';
import { updateExchangeRates } from '../../lib/bitcoin/api_blockcypher.js';
import { SbtcWalletController } from '../stacks/StacksRPCController.js';
import { readPox4Events } from '../v4/pox-events/pox4_events_helper.js';

export const sbtcEventJob = cron.schedule('*/17 * * * *', (fireDate) => {
  console.log('Running: sbtcEventJob at: ' + fireDate);
  try {
    //saveAllSbtcEvents();
  } catch (err) {
    console.log('Error running: saveAllSbtcEvents: ', err);
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

export const initUiCacheJob = cron.schedule('*/3 * * * *', (fireDate) => {
  try {
    console.log('Running: initUiCacheJob at: ' + fireDate);
    const controller = new SbtcWalletController();
    controller.initUiCache()
  } catch (err) {
    console.log('Error running: initUiCacheJob: ', err);
  }
});

export const pox4EventsJob = cron.schedule('*/20 * * * *', (fireDate) => {
  try {
    console.log('NOT Running: readDaoVotesJob at: ' + fireDate);
    readPox4Events();
  } catch (err) {
    console.log('Error running: readDaoVotesJob: ', err);
  }
});

/**
export const initDaoProposalsJob = cron.schedule('* * * * *', (fireDate) => {
  console.log('Running: initDaoProposalsJob at: ' + fireDate);
  try {
    getProposalsForActiveVotingExt(getDaoConfig().VITE_DOA_DEPLOYER + '.' + getDaoConfig().VITE_DOA_SNAPSHOT_VOTING_EXTENSION);
    const submissionContractId = getDaoConfig().VITE_DOA_DEPLOYER + '.' + getDaoConfig().VITE_DOA_FUNDED_SUBMISSION_EXTENSION
    getProposalsFromContractIds(submissionContractId, getDaoConfig().VITE_DOA_PROPOSALS);
  } catch (err) {
    console.log('Error running: initDaoProposalsJob: ', err);
  }
});

export const initRewardSlotsJob = cron.schedule('0 * * * *', (fireDate) => {
  try {
    console.log('NOT Running: initRewardSlotsJob at: ' + fireDate);
    //readAllRewardSlots()
  } catch (err) {
    console.log('Error running: initRewardSlotsJob: ', err);
  }
});
export const readDaoVotesJob = cron.schedule('* * * * *', (fireDate) => {
  try {
    console.log('NOT Running: readDaoVotesJob at: ' + fireDate);
    reconcilePoolTxs();
    reconcileSoloTxs();
  } catch (err) {
    console.log('Error running: readDaoVotesJob: ', err);
  }
});

*/