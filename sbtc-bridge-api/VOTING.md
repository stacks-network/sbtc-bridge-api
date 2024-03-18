# stx.eco

## Introduction

Explanation of end points pertaining to stx.eco and voting.

### Voting end points

Api end points for reading voting information:

- [summary](https://mainnet.bridge.sbtc.tech/bridge-api/v1/dao/results/summary)
- [solo votes](https://mainnet.bridge.sbtc.tech/bridge-api/v1/dao/votes-solo)
- [pool votes](https://mainnet.bridge.sbtc.tech/bridge-api/v1/dao/votes-pool)
- [dao votes](https://mainnet.bridge.sbtc.tech/bridge-api/v1/dao/results/non-stackers)

The stx.eco application provides results and more in depth stacking information per address;

- [results page](https://stx.eco/dao/proposals/SP3JP0N1ZXGASRJ0F7QAHWFPGTVK9T2XNXDB908Z.bdp001-sip-021-nakamoto/results?method=1)
- [e.g. stacker info](https://stx.eco/stacker-info/SP0ATPX8ZDQT2SZE61EGC4GVSY4MN6G17WPDKP8M)

### Issues to consider for the next vote

- problems with connecting ledger
- ineligible votes
- privacy issues

Note: ineligible votes were either users sending pool stacking votes from addresses
which were not pool stacking and likewise for solo stackers.

We had 986 pool stacker votes and only 370 counting. With solo it was 156 to 28. The picture
with solo stacker votes is more nuanced - see below for more info.

We need to address this in future votes e.g. by improving messaging and additional UI/UX checks.

Finally, large stake holders who wish to preserve their privacy ask for some voting information
to be obfuscated. This runs contrary to the stx.eco principle of maximising openness
and transparency. This is an area for further investigation where technologies like zero knowledge
may be of service.

## Pool stacker voting

Votes were counted as the average of the pool stackers stacked STX over cycle 78 and 79 as per the SIP.

Pool stacker votes were counted by indexing the pox-3 pox tables and event streams,
matching stacking events against vote transactions. The results were sampled and double
checked against Ortega datasets.

## Solo stacker voting

Votes were counted as the average of the solo stackers stacked STX over cycle 78 and 79 as per the SIP.

Some votes were not backed by PoX data and so did not contribute to the results. Most of these
look like to have been transactions sent in error possibly out of enthusiasm some were not
included for reasons discussed below.

### Pool operator votes

Two pool operators seem to have voted:

- bc1qmv2pxw5ahvwsu94kq5f520jgkmljs3af8ly6tr (~42M)
- bc1qs33quxgnwkrspgu82lmaczw7gtcfa88pll8fqm (~3.5M)

These votes were removed from the count as per the SIP.

### Indirect votes

SIP 21 states that votes must come from the pox reward address. In some scenarios, e.g. because of the
the way addresses are rotated in centralised exchanges, this was not possible.
Some solo stacker votes were therefore not counted for this reason even though they may have
otherwise been valid. A caveat to this is where we were able to find pox information relating to the
address that had directly funded the voting address. In the two cases where this was the
case the vote was included.

### Multisig address votes

At least one voting address was identified as a multisig. The vote was not included
because no link to pox data could be found. Constituent addresses of the multisig and
transactions which funded the voting transaction were considered.

## Non stacker voting

Votes are controlled by the DAO contract and the counts are read directly from the contract. Individual
vote transactions were also read from contract event stream and double checked against directly
querying the stacks database. The SQL to fetch non stacker data (c/o Justin @ [Ortega](https://app.ortege.ai/))

```sql
SELECT 
  hash,
  sender_address,
  to_timestamp(block_timestamp) AS tx_timestamp,
  contract_call.function_name,
  -- Use try_cast to attempt to convert the substring to DOUBLE and divide by 1e6.
  -- If the conversion fails, NULL is returned.
  CASE 
    WHEN size(contract_call.function_args) > 0 
    THEN try_cast(substr(contract_call.function_args[0].repr, 2) AS DOUBLE) / 1e6
    ELSE NULL 
  END AS amount,
  -- Safe extraction of the second element's name value if present.
  CASE 
    WHEN size(contract_call.function_args) > 1 
    THEN contract_call.function_args[1].name 
    ELSE NULL 
  END AS second_arg_name
FROM db_stacks.tbl_prod_br_transactions
WHERE contract_call.contract_id = 'SP3JP0N1ZXGASRJ0F7QAHWFPGTVK9T2XNXDB908Z.bde007-snapshot-proposal-voting'
AND tx_status = 'success';
```

## Pox-4 rewards

Jannik, question for Jude,

15 reward 5 prepare then at 16 is considered a reward

burn block 1 (not 0) has the reward set pox address.

Mod 0 - tail of the ?? has

Prepare = > always burns
Reward => reward phase


For hashbytes address my decoded address is bc1qc7us0qlcs7hlevc6csd0w83g7up0vc757cgglf
Which corresponds to this address https://mempool.space/address/bc1qc7us0qlcs7hlevc6csd0w83g7up0vc757cgglf
Which is committing Satoshi's


(some (tuple (pox-addr (tuple (hashbytes 0xc7b90783f887affcb31ac41af71e28f702f663d4) (version 0x04))) (stacker (some SP2ZQDT6PPNW8FVAW44JKQ4DX2XTPR5KQPFHZV3NP)) (total-ustx u257838000000)))