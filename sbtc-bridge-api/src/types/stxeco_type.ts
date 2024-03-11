import { PoxAddress } from "./pox_types";

export type HoldingsType = {
  nfts: any;
};
export type FileType = {
  name: string;
  timestamp: number;
  data: any;
}
export type TabType = {
  label: string;
  value: number;
  component: any;
}
export type ExtensionType = {
  contractId: string;
  valid: boolean;
  contract?:ProposalContract;
}
export type ProposalEvent = {
  status?: { name: string, color: string, colorCode: string };
  proposalMeta: ProposalMeta; 
  contract: ProposalContract;
  proposalData: ProposalData; 
  submissionData: SubmissionData;
  event:string;
  proposer:string;
  contractId:string;
  votingContract: string;
  submitTxId: string;
  funding: FundingData;
  signals?: SignalData;
  executedAt: number;
  stage: ProposalStage;
}
export type VoteEvent = {
  stackerData?: any;
  event: string;
  voter: string;
  voterProxy: string;
  for: boolean;
  amount: number;
  amountNested: number;
  votingContractId:string;
  proposalContractId: string;
  submitTxId: string;
  submitTxIdProxy: string;
  blockHeight: number;
  burnBlockHeight: number;
  delegateTo?: string;
  delegateTxId?: string;
  poxStacker?: string;
  poxAddr?: PoxAddress;
}
export enum ProposalStage {
  UNFUNDED,
  PARTIAL_FUNDING,
  PROPOSED
}

export type FundingData = {
  funding:number;
  parameters: {
    fundingCost:number;
    proposalDuration:number;
    proposalStartDelay:number;
  };
}

export type SignalData = {
  signals:number;
  parameters: {
    executiveSignalsRequired:number;
    executiveTeamSunsetHeight:number;
  };

}

export type GovernanceData = {
  totalSupply:number;
  userLocked:number;
  userBalance:number;
}

export type ProposalData = {
  concluded:boolean; 
  passed:boolean; 
  proposer:string;
  customMajority:number;
  endBlockHeight:number;
  startBlockHeight:number;
  votesAgainst:number;
  votesFor:number;
  burnStartHeight:number;
  burnEndHeight:number;
}
export type SubmissionData = {
  contractId:string;
  transaction: any;
}
export type ProposalContract = {
  source:string;
  publish_height:number;
}
export type ProposalMeta = {
  dao: string; 
  title: string; 
  author: string; 
  synopsis: string; 
  description: string; 
}
export type DaoData = {
  inFlight: {
    name: string;
    txid: string;
  }|undefined
}
