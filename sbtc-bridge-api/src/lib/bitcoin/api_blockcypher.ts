import { getConfig } from '../config.js';
import { saveNewExchangeRate, updateExchangeRate, getExchangeRates, findExchangeRateByCurrency } from '../data/db_models.js';
import fetch from 'node-fetch';
import { currencies } from '../utils_currencies.js';
import { ExchangeRate } from 'sbtc-bridge-lib';

export async function updateExchangeRates() {
  try {
    const url = 'https://blockchain.info/ticker';
    const response = await fetch(url);
    const info = await response.json();
    for (var key in info) {
      const dbRate:ExchangeRate = await findExchangeRateByCurrency(key)
      if (!dbRate) {
        const newRate = {
          currency: key,
          fifteen: info[key]['15m'],
          last: info[key].last,
          buy: info[key].buy,
          sell: info[key].sell,
          symbol: currencies[key].symbol,
          name: currencies[key].name
        }
        saveNewExchangeRate(newRate)
      } else {
        updateExchangeRate(dbRate, {
          currency: key,
          fifteen: info[key]['15m'],
          last: info[key].last,
          buy: info[key].buy,
          sell: info[key].sell,
          symbol: currencies[key].symbol,
          name: currencies[key].name
        })
      }
    }
    return getExchangeRates();
  } catch (err) {
    console.log(err);
  }
}

export async function fetchCurrentFeeRates() {
  try {
    const url = getConfig().blockCypherUrl;
    const response = await fetch(url!);
    const info = await response.json();
    return { feeInfo: { low_fee_per_kb:info.low_fee_per_kb, medium_fee_per_kb:info.medium_fee_per_kb, high_fee_per_kb:info.high_fee_per_kb }};
  } catch (err) {
    console.log(err);
    return { feeInfo: { low_fee_per_kb:20000, medium_fee_per_kb:30000, high_fee_per_kb:40000 }};
  }
}

export async function sendRawTxDirectBlockCypher(hex:string) {
  const url = getConfig().blockCypherUrl + '/txs/push';
  //console.log('sendRawTxDirectBlockCypher: ', url)
  const response = await fetch(url, {
    method: 'POST',
    //headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({tx: hex})
  });
  //if (response.status !== 200) console.log('Mempool error: ' + response.status + ' : ' + response.statusText);
  try {
    return await response.json();
  } catch (err) {
    try {
      console.log(err)
      return await response.text();
    } catch (err1) {
      console.log(err1)
    }
  }
  return 'success';
}
