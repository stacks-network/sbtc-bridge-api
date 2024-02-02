

export type StackerInfo = {
    stacksAddress: string;
    stacker?: Stacker,
    delegation?: Delegation,
    poxRejection: PoxRejection,
}
export type Stacker = {
    poxAddr?: PoxAddress;
    lockPeriod: Array<{value:number}>;
    firstRewardCycle: number;
    rewardSetIndexes: Array<number>;
    delegatedTo?: string;
    bitcoinAddr?: string;
  }
  export type PoxRejection = {
    poxRejectionPerStackerPerCycle: number;
  }
  export type Delegation = {
        amountUstx: number;
        delegatedTo?: string;
        untilBurnHt: number;
        poxAddr?: PoxAddress;
        bitcoinAddr?: string;
    }
export type PoxInfo = {
    contract_id: string;
    pox_activation_threshold_ustx: number;
    first_burnchain_block_height: number;
    current_burnchain_block_height: number;
    prepare_phase_block_length: number;
    reward_phase_block_length: number;
    reward_slots: number;
    rejection_fraction: number;
    total_liquid_supply_ustx: number;
    current_cycle: {
        id: number;
        min_threshold_ustx:number;
        stacked_ustx: number;
        is_pox_active: boolean;
    },
    next_cycle: {
        id: number;
        min_threshold_ustx: number;
        min_increment_ustx: number;
        stacked_ustx: number;
        prepare_phase_start_block_height: number;
        blocks_until_prepare_phase: number;
        reward_phase_start_block_height: number;
        blocks_until_reward_phase: number;
        ustx_until_pox_rejection: number;
    },
    min_amount_ustx:number;
    prepare_cycle_length: number;
    reward_cycle_id:number;
    reward_cycle_length: number;
    rejection_votes_left_required: number;
    next_reward_cycle_in: number;
    contract_versions: [
        {
            contract_id: string;
            activation_burnchain_block_height: number;
            first_reward_cycle_id: number;
        },
        {
            contract_id: string;
            activation_burnchain_block_height: number;
            first_reward_cycle_id: number;
        },
        {
            contract_id: string;
            activation_burnchain_block_height: number;
            first_reward_cycle_id: number;
        }
    ]

}

export type RewardSlot = {
    _id?:string;
    canonical:boolean;
    address:string;
    burn_block_hash:string;
    cycle:number;
    burn_block_height:number;
    slot_index:number;
  }
  export type PoxEntry = {
    index: number;
    cycle: number;
    bitcoinAddr: string;
    poxAddr: PoxAddress,
    stacker: string;
    totalUstx: number;
    delegations: number;
  }
  export type PoxAddress = { version: string; hashBytes: string; }
  