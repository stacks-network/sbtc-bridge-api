import { CONFIG } from '$lib/config';
import { addNetSelector } from './signers_api' 

export async function fetchAlphaEvents(page:number, filter:string) {
  try {
    const path = addNetSelector(CONFIG.VITE_SIGNER_API + '/alpha/dashboard/events/' + page + '/' + filter);
    const response = await fetch(path);
    return await response.json();
  } catch (err) {
    throw new Error('API not responding - please try again in a minute');
  }
}
export async function fetchAllAlphaEvents() {
  try {
    const path = addNetSelector(CONFIG.VITE_SIGNER_API + '/alpha/dashboard/events');
    const response = await fetch(path);
    return await response.json();
  } catch (err) {
    throw new Error('API not responding - please try again in a minute');
  }
}
