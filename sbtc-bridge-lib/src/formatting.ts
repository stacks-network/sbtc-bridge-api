const formatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD'
  // These options are needed to round to whole numbers if that's what you want.
  // minimumFractionDigits: 0, // (this suffices for whole numbers, but will print 2500.10 as $2,500.1)
  // maximumFractionDigits: 0, // (causes 2500.99 to be printed as $2,501)
})

const btcPrecision = 100000000
const stxPrecision = 1000000

export function satsToBitcoin(amountSats:number) {
  return  Math.round(amountSats) / btcPrecision
}

export function bitcoinToSats(amountBtc:number) {
  return  Math.round(amountBtc * btcPrecision)
  //  return btc.Decimal.decode(amountBtc)
}


export function fmtSatoshiToBitcoin(amountSats:number) {
  return  (Math.round(amountSats) / btcPrecision).toFixed(8)
}

export function fmtMicroToStx(amountStx:number) {
  return  (Math.round(amountStx) / stxPrecision).toFixed(6)
}

export function tsToDate(updated:number|undefined) {
  let d = new Date();
  if (updated) d = new Date(updated);
  return d.toLocaleDateString('en-US', {hour: '2-digit', minute:'2-digit'});
  //return d.getHours() + ':' + d.getMinutes() + ' ' + d.getDate() + "/" + d.getMonth() + 1 + "/" + d.getFullYear();
}

export function fmtAmount(amount:number, currency:string) {
  if (currency === 'stx') {
    return formatter.format(amount).replace('$', '') // &#931;
  } else if (currency === 'usd') {
    return formatter.format(amount).replace('$', '') // &#931;
  } else {
    return '' + amount;
  }
}

export function convertDatToBH(date:number, currentBH:number) {
  const now = new Date().getTime();
  const minsInFuture = (date - now) / 60000;
  if (minsInFuture <= 0) return 0;
  return Math.floor(currentBH + minsInFuture / 10);
}

export function fmtNumber(amount:number|undefined) {
  if (amount === 0) return 0;
  if (amount) return new Intl.NumberFormat().format(amount);
}

export function truncate(stringy?:string, amount?:number) {
  if (!stringy) return '?';
  if (!amount) amount = 4;
  return stringy.substring(0, amount) + '...' + stringy.substring(stringy.length - amount);
}

export function truncateId(stringy?:string, amount?:number) {
  if (!stringy) return '?';
  if (!amount) amount = 4;
  return '#' + stringy.substring(stringy.length - amount);
}