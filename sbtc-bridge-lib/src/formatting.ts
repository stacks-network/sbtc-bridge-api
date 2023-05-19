const btcPrecision = 100000000

export function satsToBitcoin(amountSats:number) {
  return  Math.round(amountSats) / btcPrecision
}

export function bitcoinToSats(amountBtc:number) {
  return  Math.round(amountBtc * btcPrecision)
}