/**
 * sbtc - interact with Stacks Blockchain to read sbtc contract info
 */
import { stringAsciiCV, cvToJSON, deserializeCV, contractPrincipalCV, serializeCV, principalCV, uintCV } from '@stacks/transactions';
import { hex } from '@scure/base';
import { type FundingData, type GovernanceData, type ProposalContract, type ProposalData, type ProposalEvent, type SignalData, type SubmissionData, ProposalStage, VoteEvent } from '../../types/stxeco_type.js';
import { getConfig } from '../../lib/config.js';
import DaoUtils from './DaoUtils.js';
import { saveOrUpdateProposal, saveOrUpdateVote } from '../../lib/data/db_models.js';
import { getDaoConfig } from '../../lib/config_dao.js';
import { callContractReadOnly, fetchDataVar } from '../stacks/stacks_helper.js';
import { NFTHolding, NFTHoldings } from '../../types/stxeco_nft_type.js';
import { BlockchainInfo } from 'sbtc-bridge-lib';

let uris:any = {};
const gateway = "https://hashone.mypinata.cloud/";
const gatewayAr = "https://arweave.net/";

export async function getStacksInfo() {
  const url = getConfig().stacksApi + '/v2/info';
  const response = await fetch(url)
  return await response.json();
}

async function getNftHoldingsByPage(stxAddress:string, limit:number, offset:number):Promise<any> {
  const url = getConfig().stacksApi + '/extended/v1/tokens/nft/holdings?principal=' + stxAddress + '&limit=' + limit + '&offset=' + offset;
  console.log('url: ', url)
  const response = await fetch(url)
  const val = await response.json();
  return val;
}

async function getNftHoldingsByAssetAndPage(stxAddress:string, assetId:string|undefined, limit:number, offset:number):Promise<any> {
  let url = getConfig().stacksApi + '/extended/v1/tokens/nft/holdings?principal=' + stxAddress + '&limit=' + limit + '&offset=' + offset;
  if (assetId) {
    url += '&asset_identifiers=' + assetId
  }
  console.log('url: ', url)
  const response = await fetch(url)
  const val = await response.json();
  return val;
}

export async function getAssetClasses(stxAddress:string):Promise<any> {
  let events:any;
  const assetClasses = [];
  const limit = 50
  let offset = 0
  do {
    events = await getNftHoldingsByPage(stxAddress, limit, offset);    
    if (events && events.total > 0) {
      for (const event of events.results) {
        const idx = assetClasses.findIndex((o) => o === event.asset_identifier)
        if (idx === -1) assetClasses.push(event.asset_identifier)
      }
    }
    offset += 50;
  } while (events.total > offset);
  return assetClasses;
}

export async function getNftHoldings(stxAddress:string, assetId:string|undefined, limit:number, offset:number):Promise<NFTHoldings> {
  let events:any;
  const holdings = {
    total: 0,
    results: []
  } as NFTHoldings;
  do {
    events = await getNftHoldingsByAssetAndPage(stxAddress, assetId, limit, offset);
    console.log('events.total: ', events.total)
    console.log('events.results.length: ', events.results.length)
    holdings.total = events.total
    if (events && events.total > 0) {
      for (const event of events.results) {
        const result = cvToJSON(deserializeCV(event.value.hex));
        let semiFungible = false
        let token;
        if (result.type === 'uint') {
          token = { id: Number(result.value) }
        } else {
          token = { id: Number(result.value['token-id'].value), owner: result.value.owner.value }
          semiFungible = true
        }
        //let token_uri = await getTokenUri(event.asset_identifier, token.id)
        //console.log('holding: ', holding)
        let holding = {
          asset_identifier: event.asset_identifier,
          block_height: event.block_height,
          semiFungible,
          tx_id: event.tx_id,
          //token_uri,
          token,
        } as NFTHolding;
        holdings.results.push(holding)
      }
    }
    offset += 50;
  } while (events.total > offset && limit === -1);
  for (const h of holdings.results) {
    let res = await getTokenUri(h.asset_identifier, h.token.id)
    h.token_uri = stripDupIpfs(res.uri)
    h.metaData = res.meta
  }
  return holdings;
}

function stripDupIpfs(uri:string) {
  let token_uri = uri
  if (token_uri.indexOf('ipfs/ipfs') > -1) {
    token_uri = token_uri.replace('ipfs/ipfs', 'ipfs')
  }
  return token_uri
}

async function getTokenUri(asset_identifier:string, tokenId:number) {
  if (asset_identifier.indexOf("bns::names") > -1) return
  if (uris[asset_identifier]) {
    const rawTokenUri:string = uris[asset_identifier]
    return await returnUri(rawTokenUri, tokenId)
  }
  const functionArgs = [`0x${hex.encode(serializeCV(uintCV(tokenId)))}`];
  const contractId = asset_identifier.split("::")[0]
  const data = {
    contractAddress: contractId.split('.')[0],
    contractName: contractId.split('.')[1],
    functionName: 'get-token-uri',
    functionArgs,
  }
  const result = await callContractReadOnly(data);
  const rawTokenUri = result.value.value.value
  const uriMeta = await returnUri(rawTokenUri, tokenId)
  uris[asset_identifier] = rawTokenUri
  return uriMeta;
}

async function returnUri(rawTokenUri:string, tokenId:number) {
  let uri = rawTokenUri
  if (uri.startsWith('ipfs://')) {
    uri = uri.replace('ipfs://', gateway)
    uri = uri.replace(gateway, gateway + 'ipfs/')
  } else if (uri.startsWith('ipfs/')) {
    uri = gateway + uri;
  } else if (uri.startsWith('ar://')) {
    uri = uri.replace('ar://', gatewayAr)
  }

  if (rawTokenUri.indexOf('{id}')) {
    uri = uri.replace('{id}', ''+tokenId)
  } else if (rawTokenUri.endsWith('/')) {
    uri = uri + tokenId + '.json'
  }
  uri = stripDupIpfs(uri)
  let meta:any;
  try {
    const response = await fetch(uri);
    meta = await response.json();
  } catch (err:any) {
    //
  }
  console.log('uri : ', uri)
  console.log('meta : ', meta)
  return { uri, meta }
}


const trait = "{\"maps\":[],\"functions\":[{\"args\":[{\"name\":\"sender\",\"type\":\"principal\"}],\"name\":\"execute\",\"access\":\"public\",\"outputs\":{\"type\":{\"response\":{\"ok\":\"bool\",\"error\":\"uint128\"}}}}],\"variables\":[],\"fungible_tokens\":[],\"non_fungible_tokens\":[]}";
export async function getProposalsByTrait() {
  const url = getConfig().stacksApi + '/extended/v1/contract/by_trait?trait_abi=' + trait;
  let edaoProposals: string|any[] = [];
  let val;
  let response;
  let count = 0;
  try {
    do {
      response = await fetch(url + '&offset=' + (count * 20));
      val = await response.json();
      const ourProps = val.results.filter((o:any) => o.contract_id.indexOf('.edp') > -1);
      if (ourProps && ourProps.length > 0) edaoProposals = edaoProposals.concat(ourProps)
      count++;
    }
    while (val.results.length > 0)
  }
  catch (err) {
      console.log('callContractReadOnly4: ', err);
  }
  return edaoProposals;
}

export async function getProposalsForActiveVotingExts():Promise<any> {
  const activeVotingContracts = getDaoConfig().VITE_DOA_DEPLOYER + '.' + getDaoConfig().VITE_DOA_FUNDED_SUBMISSION_EXTENSION
  for (const votingContractId of activeVotingContracts) {
    await getProposalsForActiveVotingExt(votingContractId.trim())
  }
}

export async function getProposalsForActiveVotingExt(votingContractId:string) {
  const url = getConfig().stacksApi + '/extended/v1/contract/' + votingContractId + '/events?limit=' + 20;
  const proposals: Array<ProposalEvent> = [];
  let val;
  let response;
  let count = 0;
  try {
    do {
      response = await fetch(url + '&offset=' + (count * 20));
      val = await response.json();
      for (const event of val.results) {
        const result = cvToJSON(deserializeCV(event.contract_log.value.hex));
        const concProp = result.value.proposal.value
        if (result.value.event.value === 'propose') {
          const proposalData = await getProposalData(result.value.proposal.value)
          const contract = await getProposalContract(result.value.proposal.value)
          const submissionData = await getSubmissionData(event.tx_id)
          const funding = await getFunding(submissionData.contractId, result.value.proposal.value)
          //const signals = await getSignals(result.value.proposal.value)
          const executedAt = await getExecutedAt(result.value.proposal.value)
          const proposal = {
            event: 'propose',
            proposer: result.value.proposer.value,
            contractId: result.value.proposal.value,
            proposalData,
            contract,
            submitTxId: event.tx_id,
            proposalMeta: DaoUtils.getMetaData(contract.source),
            votingContract: event.contract_log.contract_id,
            submissionData,
            funding,
            //signals,
            executedAt,
            stage: ProposalStage.PROPOSED
          } as ProposalEvent
          await saveOrUpdateProposal(proposal)
        } else if (result.value.event.value === 'vote') {
          const vote = {
            event: 'vote',
            votingContractId: votingContractId,
            proposalContractId: result.value.proposal.value,
            voter: result.value.voter.value,
            for: result.value.for.value,
            amount: result.value.amount.value,
            submitTxId: event.tx_id,
          } as VoteEvent
          await saveOrUpdateVote(vote)
        }
      }
      count++;
    }
    while (val.results.length > 0)
  }
  catch (err) {
      console.log('callContractReadOnly4: ', err);
  }
  return proposals;
}

export async function getProposalsFromContractIds(submissionContractId:string, proposalContractIds:string):Promise<any> {
  const proposalCids = proposalContractIds.split(',')
  const props = []
  for (const proposalCid of proposalCids) {
    const p = await getProposalFromContractId(submissionContractId, proposalCid.trim())
    props.push(p)
  }
  return props
}

export async function getProposalFromContractId(submissionContractId:string, proposalContractId:string):Promise<ProposalEvent|undefined> {
  let proposal:ProposalEvent|undefined = undefined;
  try {
    const contract = await getProposalContract(proposalContractId)
    let funding;
    let signals;
    let stage = ProposalStage.PARTIAL_FUNDING;
    try {
      funding = await getFunding(submissionContractId, proposalContractId);
      if (funding.funding === 0) stage = ProposalStage.UNFUNDED
      //signals = await getSignals(proposalContractId)
    } catch (err:any) {
      console.log(err.message)
    }
    const proposalMeta = DaoUtils.getMetaData(contract.source)
    let proposalData:ProposalData;
    try {
      proposalData = await getProposalData(proposalContractId)
    } catch (e) { }
    const p = {
      contract,
      proposalMeta,
      contractId: proposalContractId,
      submissionData: { contractId: submissionContractId, transaction: undefined },
      signals,
      stage,
      funding
    } as ProposalEvent
    if (proposalData) p.proposalData = proposalData
    saveOrUpdateProposal(p)
    proposal = p
  } catch(err:any) {
    console.log(err)
  }
  return proposal
}

export async function getProposalData(principle:string):Promise<ProposalData> {
  const functionArgs = [`0x${hex.encode(serializeCV(contractPrincipalCV(principle.split('.')[0], principle.split('.')[1] )))}`];
  const data = {
    contractAddress: getDaoConfig().VITE_DOA_DEPLOYER,
    contractName: getDaoConfig().VITE_DOA_SNAPSHOT_VOTING_EXTENSION,
    functionName: 'get-proposal-data',
    functionArgs,
  }
  const result = await callContractReadOnly(data);
  const start = Number(result.value.value['start-block-height'].value)
  const end = Number(result.value.value['end-block-height'].value)
  //console.log('result.value.value[custom-majority].value: ' + result.value.value['custom-majority'].value.value)
  const pd = {
    concluded:Boolean(result.value.value.concluded.value),
    passed:Boolean(result.value.value.passed.value), 
    proposer:result.value.value.proposer.value,
    customMajority:Number(result.value.value['custom-majority'].value.value),
    endBlockHeight:end,
    startBlockHeight:start,
    votesAgainst:Number(result.value.value['votes-against'].value),
    votesFor:Number(result.value.value['votes-for'].value),
    burnStartHeight: await getBurnBlockHeight(start),
    burnEndHeight: await getBurnBlockHeight(end)
  }
  return pd;
}

export async function getGovernanceData(principle:string):Promise<GovernanceData> {
  try {
    const result = await getEdgTotalSupply();
    const result1 = await getEdgBalance(principle);
    const result2 = await getEdgLocked(principle);
    return {
      totalSupply: Number(result.totalSupply),
      userBalance: Number(result1.balance),
      userLocked: Number(result2.locked),
    }
  } catch (err:any) {
    return {
      totalSupply: 0,
      userBalance: 0,
      userLocked: 0,
    }
  }
}

export async function isExtension(extensionCid:string):Promise<{result: boolean}> {
  const functionArgs = [`0x${hex.encode(serializeCV(contractPrincipalCV(extensionCid.split('.')[0], extensionCid.split('.')[1] )))}`];
  const data = {
    contractAddress: getDaoConfig().VITE_DOA_DEPLOYER,
    contractName: getDaoConfig().VITE_DOA,
    functionName: 'is-extension',
    functionArgs,
  }
  let res:{value:boolean, type:string};
  try {
    res = (await callContractReadOnly(data));
    return { result: res.value }
  } catch (e) { 
    return { result: false } 
  }
}

export async function getFunding(extensionCid:string, proposalCid:string):Promise<FundingData> {
  const functionArgs = [`0x${hex.encode(serializeCV(contractPrincipalCV(proposalCid.split('.')[0], proposalCid.split('.')[1] )))}`];
  const data = {
    contractAddress: extensionCid.split('.')[0],
    contractName: extensionCid.split('.')[1],
    functionName: 'get-proposal-funding',
    functionArgs,
  }
  let funding:string;
  try {
    funding = (await callContractReadOnly(data)).value;
  } catch (e) { funding = '0' }
  return {
    funding: Number(funding),
    parameters: await getFundingParams(extensionCid)
  }
}

async function getExecutedAt(principle:string):Promise<number> {
  const functionArgs = [`0x${hex.encode(serializeCV(contractPrincipalCV(principle.split('.')[0], principle.split('.')[1] )))}`];
  const data = {
    contractAddress: getDaoConfig().VITE_DOA_DEPLOYER,
    contractName: getDaoConfig().VITE_DOA,
    functionName: 'executed-at',
    functionArgs,
  }
  const result = await callContractReadOnly(data);
  try {
    return Number(result.value.value)
  } catch(err:any) {
    try {
      return Number(result.value)
    } catch(err:any) {
      return 0
    }
  }
}

export async function getSignals(principle:string):Promise<SignalData> {
  const functionArgs = [`0x${hex.encode(serializeCV(contractPrincipalCV(principle.split('.')[0], principle.split('.')[1] )))}`];
  const data = {
    contractAddress: getDaoConfig().VITE_DOA_DEPLOYER,
    contractName: getDaoConfig().VITE_DOA_EMERGENCY_EXECUTE_EXTENSION,
    functionName: 'get-signals',
    functionArgs,
  }
  const result = (await callContractReadOnly(data)).value;
  return {
    signals: Number(result),
    parameters: await getEmergencyExecuteParams()
  }
}

async function getEmergencyExecuteParams():Promise<any> {
  return {
    executiveSignalsRequired: Number(await fetchDataVar(getDaoConfig().VITE_DOA_DEPLOYER,getDaoConfig().VITE_DOA_EMERGENCY_EXECUTE_EXTENSION, 'executive-signals-required') || 0),
    executiveTeamSunsetHeight: Number(await fetchDataVar(getDaoConfig().VITE_DOA_DEPLOYER,getDaoConfig().VITE_DOA_EMERGENCY_EXECUTE_EXTENSION, 'executive-team-sunset-height') || 0),
  }
}

export async function getFundingParams(extensionCid:string):Promise<any> {
  const functionArgs = [`0x${hex.encode(serializeCV(stringAsciiCV('funding-cost')))}`];
  const data = {
    contractAddress: extensionCid.split('.')[0],
    contractName: extensionCid.split('.')[1],
    functionName: 'get-parameter',
    functionArgs
  }
  const param1 = (extensionCid.split('.')[1] === 'ede008-flexible-funded-submission') ? 'minimum-proposal-start-delay' : 'proposal-start-delay'
  const param2 = (extensionCid.split('.')[1] === 'ede008-flexible-funded-submission') ? 'minimum-proposal-duration' : 'proposal-duration'
  //console.log('Running: getFundingParams: ', data);
  const fundingCost = (await callContractReadOnly(data)).value.value;
  data.functionArgs = [`0x${hex.encode(serializeCV(stringAsciiCV(param1)))}`];
  const proposalStartDelay = (await callContractReadOnly(data)).value.value;
  data.functionArgs = [`0x${hex.encode(serializeCV(stringAsciiCV(param2)))}`];
  const proposalDuration = (await callContractReadOnly(data)).value.value;
  return {
    fundingCost: Number(fundingCost),
    proposalDuration: Number(proposalDuration),
    proposalStartDelay: Number(proposalStartDelay),
  }
}

async function getSubmissionData(txId:string):Promise<SubmissionData> {
  const fundingTx = await getTransaction(txId)
  const pd = {
    contractId:fundingTx.contract_call.contract_id,
    transaction: fundingTx
  }
  return pd;
}

async function getProposalContract(principle:string):Promise<ProposalContract> {
  const url = getConfig().stacksApi + '/v2/contracts/source/' + principle.split('.')[0] + '/' + principle.split('.')[1] + '?proof=0';
  const response = await fetch(url)
  const val = await response.json();
  return val;
}

export async function getBurnBlockHeight(height:number):Promise<number> {
  let url = getConfig().stacksApi + '/extended/v1/block/by_height/' + height;
  let response = await fetch(url)
  let val = await response.json();
  if (response.status !== 200) {
    url = getConfig().stacksApi + '/extended/v2/burn-blocks/' + height;
    response = await fetch(url)
    val = await response.json();
  }
  return val.burn_block_height;
}

export async function isExecutiveTeamMember(stxAddress:string):Promise<{executiveTeamMember:boolean}> {
  if (!stxAddress || stxAddress === 'undefined') return {executiveTeamMember:false}
  const functionArgs = [`0x${hex.encode(serializeCV(principalCV(stxAddress)))}`];
  const data = {
    contractAddress: getDaoConfig().VITE_DOA_DEPLOYER,
    contractName: getDaoConfig().VITE_DOA_EMERGENCY_EXECUTE_EXTENSION,
    functionName: 'is-executive-team-member',
    functionArgs,
  }
  try {
    const result = (await callContractReadOnly(data)).value;
    return {
      executiveTeamMember: Boolean(result),
    }
  } catch(err) {
    return {executiveTeamMember:false}
  }
}

export async function getEdgTotalSupply():Promise<{totalSupply:boolean}> {
  const functionArgs:Array<any> = [];
  const data = {
    contractAddress: getDaoConfig().VITE_DOA_DEPLOYER,
    contractName: 'ede000-governance-token',
    functionName: 'get-total-supply',
    functionArgs,
  }
  const result = (await callContractReadOnly(data)).value;
  return {
    totalSupply: Boolean(result),
  }
}

export async function getEdgBalance(stxAddress:string):Promise<{balance:boolean}> {
  const functionArgs = [`0x${hex.encode(serializeCV(principalCV(stxAddress)))}`];
  const data = {
    contractAddress: getDaoConfig().VITE_DOA_DEPLOYER,
    contractName: 'ede000-governance-token',
    functionName: 'edg-get-balance',
    functionArgs,
  }
  const result = (await callContractReadOnly(data)).value;
  return {
    balance: Boolean(result),
  }
}

export async function getEdgLocked(stxAddress:string):Promise<{locked:boolean}> {
  const functionArgs = [`0x${hex.encode(serializeCV(principalCV(stxAddress)))}`];
  const data = {
    contractAddress: getDaoConfig().VITE_DOA_DEPLOYER,
    contractName: 'ede000-governance-token',
    functionName: 'edg-get-locked',
    functionArgs,
  }
  const result = (await callContractReadOnly(data)).value;
  return {
    locked: Boolean(result),
  }
}

export async function getTransaction(tx:string):Promise<any> {
  const url = getConfig().stacksApi + '/extended/v1/tx/' + tx
  let val;
  try {
      const response = await fetch(url)
      val = await response.json();
  }
  catch (err) {
      console.log('getTransaction: ', err);
  }
  return val;
}

export async function getBalanceAtHeight(stxAddress:string, height: number):Promise<any> {
  const url = getConfig().stacksApi + '/extended/v1/address/' + stxAddress + '/balances?until_block=' + height
  let val;
  try {
      const response = await fetch(url)
      val = await response.json();
  }
  catch (err) {
      console.log('getBalanceAtHeight: ', err);
  }
  return val;
}
