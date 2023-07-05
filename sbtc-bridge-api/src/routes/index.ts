import express from "express";
import { TransactionController, BlocksController, DefaultController, WalletController } from "../controllers/BitcoinRPCController.js";
import { SbtcWalletController, DepositsController } from "../controllers/StacksRPCController.js";
import { ConfigController } from "../controllers/ConfigController.js";
import { SignersController } from "../controllers/SignersRPCController.js";
import type { PeginRequestI, WrappedPSBT } from 'sbtc-bridge-lib';

const router = express.Router();

router.get('/', (req, res, next) => {
  try {
    const controller = new DefaultController();
    const response = controller.getFeeEstimate();
    return res.send(response);
  } catch (error) { 
    console.log('Error in routes: ', error)
    next('An error occurred fetching sbtc data.') 
  }
});

router.get("/bridge-api/:network/v1/btc/blocks/count", async (req, res, next) => {
  try {
    const controller = new BlocksController();
    const response = await controller.getCount();
    return res.send(response);
  } catch (error) { 
    console.log('Error in routes: ', error)
    next('An error occurred fetching sbtc data.') 
  }
});

router.get("/bridge-api/:network/v1/btc/blocks/info", async (req, res, next) => {
  try {
    const controller = new BlocksController();
    const response = await controller.getInfo();
    return res.send(response);
  } catch (error) { 
    console.log('Error in routes: ', error)
    next('An error occurred fetching sbtc data.') 
  }
});

router.get("/bridge-api/:network/v1/btc/blocks/fee-estimate", async (req, res, next) => {
  try {
    const controller = new BlocksController();
    const response = await controller.getFeeEstimate();
    return res.send(response);
  } catch (error) { 
    console.log('Error in routes: ', error)
    next('An error occurred fetching sbtc data.') 
  }
});

router.get("/bridge-api/:network/v1/btc/wallet/validate/:address", async (req, res, next) => {
  try {
    const controller = new WalletController();
    const response = await controller.validateAddress(req.params.address);
    return res.send(response);
  } catch (error) {
    console.log('Error in routes: ', error)
    next('An error occurred fetching sbtc data.') 
  }
});

router.post("/bridge-api/:network/v1/btc/wallet/walletprocesspsbt", async (req, res, next) => {
  try {
    const tx = req.body;
    const controller = new WalletController();
    const response = await controller.processPsbt(tx.hex);
    return res.send(response);
  } catch (error) {
    console.log('Error in routes: ', error)
    next('An error occurred fetching sbtc data.') 
  }
});

router.get("/bridge-api/:network/v1/btc/wallet/address/:address/txs", async (req, res, next) => {
  try {
    const controller = new WalletController();
    const response = await controller.fetchAddressTransactions(req.params.address);
    return res.send(response);
  } catch (error) {
    console.log('Error in routes: ', error)
    next('An error occurred fetching sbtc data.') 
  }
});


router.get("/bridge-api/:network/v1/btc/wallet/address/:address/utxos", async (req, res, next) => {
  try {
    const controller = new WalletController();
    const response = await controller.fetchUtxoSet(req.params.address, (req.query.verbose) ? true : false);
    return res.send(response);
  } catch (error) {
    console.log('Error in routes: ', error)
    next('An error occurred fetching sbtc data.') 
  }
});

router.get("/bridge-api/:network/v1/btc/wallet/loadwallet/:name", async (req, res, next) => {
  try {
    const controller = new WalletController();
    const response = await controller.loadWallet(req.params.name);
    return res.send(response);
  } catch (error) {
    console.log('Error in routes: ', error)
    next('An error occurred fetching sbtc data.') 
  }
});
router.get("/bridge-api/:network/v1/btc/wallet/listwallets", async (req, res, next) => {
  try {
    const controller = new WalletController();
    const response = await controller.listWallets();
    return res.send(response);
  } catch (error) {
    console.log('Error in routes: ', error)
    next('An error occurred fetching sbtc data.') 
  }
});

router.get("/bridge-api/:network/v1/btc/tx/keys", async (req, res, next) => {
  try {
    const controller = new TransactionController();
    const response = await controller.getKeys();
    return res.send(response);
  } catch (error) { 
    console.log('Error in routes: ', error)
    next('An error occurred fetching sbtc data.') 
  }
});

router.get("/bridge-api/:network/v1/btc/tx/commit-deposit-data/:stxAddress/:revealFee", async (req, res, next) => {
  try {
    const controller = new TransactionController();
    const response = await controller.commitDepositData(req.params.stxAddress, Number(req.params.revealFee));
    return res.send(response);
  } catch (error) { 
    console.log('Error in routes: ', error)
    next('An error occurred fetching sbtc data.') 
  }
});

router.get("/bridge-api/:network/v1/btc/tx/commit-deposit/:data", async (req, res, next) => {
  try {
    const controller = new TransactionController();
    const response = await controller.commitDeposit(req.params.data);
    return res.send(response);
  } catch (error) {
    console.log('Error in routes: ', error)
    next('An error occurred fetching sbtc data.') 
  }
});


router.get("/bridge-api/:network/v1/btc/tx/commit-withdrawal-data/:signature/:amount", async (req, res, next) => {
  try {
    const controller = new TransactionController();
    const response = await controller.commitWithdrawalData(req.params.signature, Number(req.params.amount));
    return res.send(response);
  } catch (error) {
    console.log('Error in routes: ', error)
    next('An error occurred fetching sbtc data.')
  }
});

router.get("/bridge-api/:network/v1/btc/tx/commit-withdrawal/:data/:sbtcWallet/:compression", async (req, res, next) => {
  try {
    const controller = new TransactionController();
    const response = await controller.commitWithdrawal(req.params.data, req.params.sbtcWallet, Number(req.params.compression));
    return res.send(response);
  } catch (error) {
    console.log('Error in routes: ', error)
    next('An error occurred fetching sbtc data.') 
  }
});

router.get("/bridge-api/:network/v1/btc/tx/commitment/:stxAddress/:revealFee", async (req, res, next) => {
  try {
    const controller = new TransactionController();
    const response = await controller.commitment(req.params.stxAddress, Number(req.params.revealFee));
    return res.send(response);
  } catch (error) { 
    console.log('Error in routes: ', error)
    next('An error occurred fetching sbtc data.') 
  }
});

router.post("/bridge-api/:network/v1/btc/tx/sign", async (req, res, next) => {
  try {
    const wrappedPsbt:WrappedPSBT = req.body;
    console.log('wrappedPsbt 0: ', req.body);
    const controller = new TransactionController();
    const response = await controller.signAndBroadcast(wrappedPsbt);
    return res.send(response);
  } catch (error) {
    console.log('Error in routes: ', error)
    next('An error occurred fetching sbtc data.') 
  }
});

router.post("/bridge-api/:network/v1/btc/tx/signAndBroadcast", async (req, res, next) => {
  try {
    const wrappedPsbt:WrappedPSBT = req.body;
    console.log('wrappedPsbt: ', wrappedPsbt);
    const controller = new TransactionController();
    const response = await controller.signAndBroadcast(wrappedPsbt);
    return res.send(response);
  } catch (error) { 
    console.log('Error in routes: ', error)
    next('An error occurred fetching sbtc data.') 
  }
});

router.get("/bridge-api/:network/v1/btc/tx/:txid", async (req, res, next) => {
  try {
    const controller = new TransactionController();
    const response = await controller.fetchRawTransaction(req.params.txid);
    return res.send(response);
  } catch (error) { 
    console.log('Error in routes: ', error)
    next('An error occurred fetching sbtc data.') 
  }
});

router.get("/bridge-api/:network/v1/btc/tx/:txid/hex", async (req, res, next) => {
  try {
    const controller = new TransactionController();
    const response = await controller.fetchTransactionHex(req.params.txid);
    return res.send(response);
  } catch (error) { 
    console.log('Error in routes: ', error)
    next('An error occurred fetching sbtc data.') 
  }
});

router.post("/bridge-api/:network/v1/btc/tx/sendrawtx", async (req, res, next) => {
  try {
    console.log('/btc/tx/sendrawtx', req.body);
    const tx = req.body;
    const controller = new TransactionController();
    const result = await controller.sendRawTransaction(tx.hex);
    console.log('/btc/tx/sendrawtx', result);
    return res.send(result);
  } catch (error) { 
    console.log('Error in routes: ', error)
    next('An error occurred fetching sbtc data.') 
  }
});

router.get("/bridge-api/:network/v1/sbtc/address/:address/balance", async (req, res, next) => {
  try {
    const controller = new SbtcWalletController();
    const response = await controller.fetchUserSbtcBalance(req.params.address);
    return res.send(response);
  } catch (error) {
    console.log('Error in routes: ', error)
    next('An error occurred fetching sbtc data.') 
  }
});
 
router.get("/bridge-api/:network/v1/sbtc/address/balances/:stxAddress/:cardinal/:ordinal", async (req, res, next) => {
  try {
    const controller = new SbtcWalletController();
    console.log('/bridge-api/:network/v1/sbtc/address/balances/:stxAddress/:cardinal/:ordinal')
    const response = await controller.fetchUserBalances(req.params.stxAddress, req.params.cardinal, req.params.ordinal);
    return res.send(response);
  } catch (error) {
    console.log('Error in routes: ', error)
    next('An error occurred fetching sbtc data.') 
  }
});
 
router.get("/bridge-api/:network/v1/sbtc/events/save", (req, res, next) => {
  try {
    const controller = new SbtcWalletController();
    controller.saveAllSbtcEvents();
    const response = 'reading sbtc event data from stacks and bitcoin blockchains.';
    return res.send(response);
  } catch (error) { 
    console.log('Error in routes: ', error)
    next('An error occurred fetching sbtc data.') 
  }
});

router.get("/bridge-api/:network/v1/sbtc/events/index/stacks/:txid", async (req, res, next) => {
  try {
    const controller = new SbtcWalletController();
    const response = await controller.indexSbtcEvent(req.params.txid);
    //const response = 'reading sbtc event data from stacks and bitcoin blockchains.';
    return res.send(response);
  } catch (error) { 
    console.log('Error in routes: ', error)
    next('An error occurred fetching sbtc data.') 
  }
});

router.get("/bridge-api/:network/v1/sbtc/events/save/:page", async (req, res, next) => {
  try {
    const controller = new SbtcWalletController();
    const response = await controller.saveSbtcEvents(Number(req.params.page));
    return res.send(response);
  } catch (error) { 
    console.log('Error in routes: ', error)
    next('An error occurred fetching sbtc data.') 
  }
});

router.get("/bridge-api/:network/v1/sbtc/events/:page", async (req, res, next) => {
  try {
    const controller = new SbtcWalletController();
    const response = await controller.findSbtcEvents(Number(req.params.page));
    return res.send(response);
  } catch (error) { 
    console.log('Error in routes: ', error)
    next('An error occurred fetching sbtc data.') 
  }
});

router.get("/bridge-api/:network/v1/sbtc/data", async (req, res, next) => {
  try {
    const controller1 = new SbtcWalletController();
    const sbtcContractData = await controller1.fetchSbtcContractData();
    const controller2 = new TransactionController();
    const keys = await controller2.getKeys();
    const controller3 = new WalletController();
    const sbtcWalletAddressInfo = await controller3.fetchUtxoSet(sbtcContractData.sbtcWalletAddress, true);
    const controller = new BlocksController();
    const btcFeeRates = await controller.getFeeEstimate();

    const response = {
      keys,
      sbtcContractData,
      sbtcWalletAddressInfo,
      btcFeeRates
    }
    return res.send(response);
  } catch (error) { 
    console.log('Error in routes: ', error)
    next('An error occurred fetching sbtc data.') 
  }
});

router.get("/bridge-api/:network/v1/sbtc/wallet-address", async (req, res, next) => {
  try {
    const controller = new SbtcWalletController();
    const response = await controller.fetchSbtcWalletAddress();
    return res.send(response);
  } catch (error) { 
    console.log('Error in routes: ', error)
    next('An error occurred fetching sbtc data.') 
  }
});

router.get("/bridge-api/:network/v1/sbtc/pegins/search/:stxAddress", async (req, res, next) => {
  try {
    const controller = new DepositsController();
    const response = await controller.findPeginRequestsByStacksAddress(req.params.stxAddress);
    return res.send(response);
  } catch (error) { 
    console.log('Error in routes: ', error)
    next('An error occurred fetching sbtc data.') 
  }
});

router.get("/bridge-api/:network/v1/sbtc/pegins", async (req, res, next) => {
  try {
    const controller = new DepositsController();
    const response = await controller.findPeginRequests();
    return res.send(response);
  } catch (error) { 
    console.log('Error in routes: ', error)
    next('An error occurred fetching sbtc data.') 
  }
});

router.post("/bridge-api/:network/v1/sbtc/pegins", async (req, res, next) => {
  try {
    console.log('/sbtc/pegins', req.body);
    const peginRequest:PeginRequestI = req.body;
    if (peginRequest.status === 1 || peginRequest.status === 5) {
      const controller = new DepositsController();
      const response = await controller.savePeginCommit(peginRequest);
      return res.send(response);
    } else {
      throw new Error('Status os a request from UI must be 1 for op_drop or 5 for op_return.');
    }
  } catch (error) {
    console.log('Error in routes: ', error)
    next('An error occurred fetching sbtc data.') 
  }
});

/**
router.put("/bridge-api/:network/v1/sbtc/pegins", async (req, res, next) => {
  try {
    console.log('/sbtc/pegins', req.body);
    const peginRequest:PeginRequestI = req.body;
    const controller = new DepositsController();
    const response = await controller.updatePeginCommit(peginRequest);
    return res.send(response);
  } catch (error) {
    console.log('Error in routes: ', error)
    next('An error occurred fetching sbtc data.') 
  }
});
 */

router.get("/bridge-api/:network/v1/sbtc/pegin-scan", async (req, res, next) => {
  try {
    const controller = new DepositsController();
    const response = await controller.scanPeginRequests();
    return res.send(response);
  } catch (error) {
    console.log('Error in routes: ', error)
    next('An error occurred fetching sbtc data.') 
  }
});

router.get("/bridge-api/:network/v1/sbtc/commit-scan/:btcAddress/:stxAddress/:sbtcWalletAddress/:revealFee", async (req, res, next) => {
  try {
    const controller = new DepositsController();
    const response = await controller.scanCommitments(req.params.btcAddress, req.params.stxAddress, req.params.sbtcWalletAddress, Number(req.params.revealFee));
    return res.send(response);
  } catch (error) {
    console.log('Error in routes: ', error)
    next('An error occurred fetching sbtc data.') 
  }
});

router.get("/bridge-api/:network/v1/sbtc/pegins/:_id", async (req, res, next) => {
  try {
    const controller = new DepositsController();
    const response = await controller.findPeginRequestById(req.params._id);
    return res.send(response);
  } catch (error) { 
    console.log('Error in routes: ', error)
    next('An error occurred fetching sbtc data.') 
  }
});


router.get("/bridge-api/:network/v1/config", async (req, res, next) => {
  try {
    const controller = new ConfigController();
    const response = await controller.getAllParam();
    return res.send(response);
  } catch (error) { 
    console.log('Error in routes: ', error)
    next('An error occurred fetching sbtc data.') 
  }
});

router.get("/bridge-api/:network/v1/config/:param", async (req, res, next) => {
  try {
    const controller = new ConfigController();
    const response = await controller.getParam(req.params.param);
    return res.send(response);
  } catch (error) { 
    console.log('Error in routes: ', error)
    next('An error occurred fetching sbtc data.') 
  }
});

router.get("/bridge-api/:network/v1/signers/pox-info", async (req, res, next) => {
  try {
    console.log('signers/pox-info')
    const controller = new SignersController();
    const response = await controller.fetchPoxInfo();
    return res.send(response);
  } catch (error) { 
    console.log('Error in routes: ', error)
    next('An error occurred fetching sbtc data.') 
  }
});


router.get("/signer-api/:network/v1/info", async (req, res, next) => {
  try {
    console.log('v1/info: ')
    const controller = new SignersController();
    const bcInfo = await controller.fetchPoxInfo();
    const poxCycleInfo = await controller.fetchPoxCycleInfo(bcInfo.poxInfo.rewardCycleId)
    const controller1 = new SbtcWalletController();
    const sbtcContractData = await controller1.fetchSbtcContractData();

    const response = {
      bcInfo,
      sbtcContractData,
      poxCycleInfo
    }

    return res.send(response);
  } catch (error) {
    console.log('Error in routes: ', error)
    next('An error occurred fetching sbtc data.')
  }
});
router.get("/signer-api/:network/v1/pox/get-delegation-info/:stxAddress", async (req, res, next) => {
  try { 
    const controller = new SignersController();
    const result = await controller.getDelegationInfo(req.params.stxAddress);
    return res.send(result);
  } catch (error) {
    console.log('Error in routes: ', error)
    next('An error occurred fetching vouching/domain/:domain.')
  }
});


router.get("/signer-api/:network/v1/pox/info", async (req, res, next) => {
  try {
    console.log('v1/pox/info: ')
    const controller = new SignersController();
    const res = await controller.fetchPoxInfo();
    return res.send(res);
  } catch (error) {
    console.log('Error in routes: ', error)
    next('An error occurred fetching pox/info.')
  }
});

router.get("/signer-api/:network/v1/vouching/domain/:domain", async (req, res, next) => {
  try {
    console.log('getDelegationInfo: ' + req.params.domain)
    const controller = new SignersController();
    const result = await controller.fetchWebDid(req.params.domain);
    return res.send(result);
  } catch (error) {
    console.log('Error in routes: ', error)
    next('An error occurred fetching vouching/domain/:domain.')
  }
});

router.get('*', function(req, res) {
  res.sendStatus(404);
});


export default router;