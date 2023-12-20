import { VoteEvent } from "./stxeco_type";

export type RewardSlot = {
  _id?:string;
  canonical:boolean;
  address:string;
  burn_block_hash:string;
  burn_block_height:number;
  slot_index:number;
}

export type VotingAddresses = {
  yAddress:string, nAddress:string
}

export type SoloPoolData = {
  soloAddresses: VotingAddresses;
  poolAddresses: VotingAddresses;
  poolVotes: Array<VoteEvent>;
  soloVotes: Array<VoteEvent>;
}

export type PoxEntry = {
  cycle: number;
  poxAddr: string;
  hashBytes: string;
  version: string;
  stacker: string;
  totalUstx: number;
  delegations: number;
}