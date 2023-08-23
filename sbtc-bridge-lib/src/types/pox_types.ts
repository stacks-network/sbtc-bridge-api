  //(ok (tuple (current-rejection-votes u0) (first-burnchain-block-height u2000000) 
  //(min-amount-ustx u5177084703462) (prepare-cycle-length u50) (rejection-fraction u12) 
  //(reward-cycle-id u416) (reward-cycle-length u1050) (total-liquid-supply-ustx u41416677627699654)))}
export type DashboardInfoI = {
    poxCycle: number;
    totalDeposited: number;
    totalWithdrawn: number;
    countTotal: number;
    countDeposits: number;
    countWithdrawals: number;
    countHandoffs: number;
}
  
export type PoxInfo = {
    currentRejectionVotes: number;
    firstBurnchainBlockHeight: number;
    minAmountUstx?: number;
    prepareCycleLength?: number;
    rejectionFraction?: number;
    rewardCycleId?: number;
    rewardCycleLength?: number;
    totalLiquidSupplyUstx?: number;
}

export type PoxCycleInfo = {
  totalPoxRejection: number;
  numbPoxAddressInRewardSet: number;
  poxActive: boolean;
  cycleToBurnHeight: number;
  rewardSetSize: number;
  totalUstxStacked: number;
  stackingMinimum: number;
}

export type  StacksInfo =  {
    peer_version: number;
    pox_consensus: string;
    burn_block_height: number;
    stable_pox_consensus: string;
    stable_burn_block_height: number;
    server_version: string;
    network_id: number;
    parent_network_id: number;
    stacks_tip_height: number;
    stacks_tip: string;
    stacks_tip_consensus_hash: string;
    genesis_chainstate_hash: string;
    unanchored_tip?: number;
    unanchored_seq?: null,
    exit_at_block_height?: null,
    node_public_key: string;
    node_public_key_hash: string;
    affirmations: {
      heaviest: string;
      stacks_tip: string;
      sortition_tip: string;
      tentative_best: string;
    },
    last_pox_anchor: {
      anchor_block_hash: string;
      anchor_block_txid: string;
    }
}

export type  BlockchainInfo =  {
  stacksInfo:StacksInfo;
  poxInfo:PoxInfo;
  mainnetTipHeight: number;
  sbtcWindow: string;
}
