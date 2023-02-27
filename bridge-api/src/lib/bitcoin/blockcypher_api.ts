import { blockCypherUrl } from '../config';
import fetch from 'node-fetch';

export async function fetchCurrentFeeRates() {
  try {
    const url = blockCypherUrl;
    const response = await fetch(url!);
    const info = await response.json();
    return info;
  } catch (err) {
    console.log(err);
    return { low_fee_per_kb:20000, medium_fee_per_kb:30000, high_fee_per_kb:40000 };
  }
}
