import { VoteEvent } from "./stxeco_type";

export type VotingAddresses = {
  yAddress:string, nAddress:string
}

export type SoloPoolData = {
  soloAddresses: VotingAddresses;
  poolAddresses: VotingAddresses;
  poolVotes: Array<VoteEvent>;
  soloVotes: Array<VoteEvent>;
}

