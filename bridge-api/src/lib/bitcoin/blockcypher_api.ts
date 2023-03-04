import { blockCypherUrl } from '../config';
import fetch from 'node-fetch';

export async function fetchCurrentFeeRates() {
  try {
    const url = blockCypherUrl;
    const response = await fetch(url!);
    const info = await response.json();
    return { feeInfo: { low_fee_per_kb:info.low_fee_per_kb, medium_fee_per_kb:info.medium_fee_per_kb, high_fee_per_kb:info.high_fee_per_kb }};
  } catch (err) {
    console.log(err);
    return { feeInfo: { low_fee_per_kb:20000, medium_fee_per_kb:30000, high_fee_per_kb:40000 }};
  }
}
