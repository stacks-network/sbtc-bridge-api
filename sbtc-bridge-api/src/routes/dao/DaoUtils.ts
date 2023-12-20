import { getDaoConfig } from "../../lib/config_dao.js";
import { ExtensionType, ProposalData, ProposalEvent, ProposalStage } from "../../types/stxeco_type.js";
import { getProposalsFromContractIds } from "./dao_helper.js";

const DaoUtils = {

  getProposal: async (proposals:Array<ProposalEvent>|undefined, proposalContractId:string) => {
		let event:ProposalEvent|undefined;
    try {
      if (proposals && proposals.length > 0) {
        const index = proposals?.findIndex((o) => o.contractId === proposalContractId )
        if (typeof index === 'number' && index > -1) {
          event = proposals[index]
        }
      }
      if (!event) {
        const submissionContractId = getDaoConfig().VITE_DOA_DEPLOYER + '.' + getDaoConfig().VITE_DOA_FUNDED_SUBMISSION_EXTENSION
        event = await getProposalsFromContractIds(submissionContractId, proposalContractId)
      }
    } catch (err:any) {
      console.log('DaoUtils:getProposal ', err);
    }
    return event
  },

  getStatus: (stacksTipHeight:number, proposal:ProposalEvent) => {    
    let status = { name: 'unkown', color: 'primary-500', colorCode: 'primary-500' };
    if (proposal.stage === ProposalStage.UNFUNDED) {
      return { name: 'deployed', color: 'primary-500', colorCode: 'primary-500' };
    }
    if (proposal && typeof proposal.executedAt === 'number' && proposal.executedAt > 0 && typeof proposal.signals?.signals === 'number' && proposal.signals?.signals > 0) {
      return { name: 'emergexec', color: 'success-500', colorCode: 'success-500' }
    }
    if (!proposal.proposalData) {
      if (proposal.funding && proposal.funding.funding > 0) {
        status = { name: 'funding', color: 'info-500', colorCode: 'orange-500' };
      } else if (proposal.submitTxId) {
        status = { name: 'submitting', color: 'primary-500', colorCode: 'primary-500' };
      } else if (proposal.contract) {
        status = { name: 'deployed', color: 'primary-500', colorCode: 'primary-500' };
      } else {
        status = { name: 'draft', color: 'primary-500', colorCode: 'primary-500' };
      }
    } else {
      if (proposal.votingContract.indexOf('ede001-proposal-voting') > -1) {
        status = { name: 'submitted', color: 'primary-500', colorCode: 'primary-500' };
        if (stacksTipHeight < proposal.proposalData.startBlockHeight) {
          status = { name: 'commencing soon', color: 'warning-500', colorCode: 'orange-500' };
        } else {
          status = { name: 'voting', color: 'warning-500', colorCode: 'orange-500' };
        }
      } else if (proposal.votingContract.indexOf('ede007-snapshot-proposal-voting-v5') > -1) {
        status = { name: 'voting', color: 'warning-500', colorCode: 'orange-500' };
      } else if (proposal.votingContract.indexOf('ede004-emergency-execute') > -1) {
        status = { name: 'voting', color: 'warning-500', colorCode: 'orange-500' };
      }
      if (proposal.proposalData.concluded) {
        if (proposal.proposalData.passed) status = { name: 'passed', color: 'success-500', colorCode: 'success-500' };
        else status = { name: 'failed', color: 'danger-500', colorCode: 'error-500' };
      } else if (stacksTipHeight > proposal.proposalData.endBlockHeight) {
        status = { name: 'voting ended', color: 'warning-500', colorCode: 'orange-500' };
      }
    }
    return status;
  },
  getVotingMessage: function (pd:ProposalData|undefined, stacksTipHeight:number) {
      if (!pd) return 'unknown';
      if (stacksTipHeight > pd.endBlockHeight) {
        if (pd.concluded) return 'vote concluded';
        else return 'voting ended';
      } else if (stacksTipHeight < pd.startBlockHeight) {
        return 'Voting starts at ( ' + pd.startBlockHeight + ' ) in ' + (pd.startBlockHeight - stacksTipHeight) + ' blocks';
      } else {
        return (pd.endBlockHeight - stacksTipHeight) + ' blocks to go!'
      }
  },

  getMetaData: function (source:string) {
    // const preamble:Array<string> = [];
    let lines = source.split('\n');
    lines = lines?.filter((l) => l.startsWith(';;')) || []
    const proposalMeta = { dao: '', title: '', author: '', synopsis: '', description: '', };
    lines.forEach((l) => {
      l = l.replace(/;;/, "");
      if (l.indexOf('DAO:') > -1) proposalMeta.dao = l.split('DAO:')[1];
      else if (l.indexOf('Title:') > -1) proposalMeta.title = l.split('Title:')[1];
      else if (l.indexOf('Author:') > -1) proposalMeta.author = l.split('Author:')[1];
      //else if (l.indexOf('Synopsis:') > -1) proposalMeta.synopsis = l.split('Synopsis:')[1];
      else if (l.indexOf('Description:') > -1) proposalMeta.description = l.split('Description:')[1];
      else {
        proposalMeta.description += ' ' + l;
      }
    })
    let alt = source.split('Synopsis:')[1] || '';
    let alt1 = alt.split('Description:')[0];
    proposalMeta.synopsis = alt1.replace(';;', '');
    if (source.indexOf('Author(s):') > -1) {
      alt = source.split('Author(s):')[1] || '';
      alt1 = alt.split('Synopsis:')[0];
      proposalMeta.author = alt1.replace(';;', '');
    }
    proposalMeta.description = proposalMeta.description.replace('The upgrade is designed', '<br/><br/>The upgrade is designed');
    proposalMeta.description = proposalMeta.description.replace('Should this upgrade pass', '<br/><br/>Should this upgrade pass');
    return proposalMeta;
  },
  
  sortProposals: function (proposals: ProposalEvent[]|undefined, asc:boolean, sortField:string) {
    if (!proposals) return []
    proposals = proposals.sort(function compare (a:ProposalEvent, b:ProposalEvent) {
      let nameA = a.contractId.split('.')[1].toUpperCase() // ignore upper and lowercase
      let nameB = b.contractId.split('.')[1].toUpperCase() // ignore upper and lowercase
      if (sortField === 'status') {
        nameA = a.status.name.toUpperCase();
        nameB = b.status.name.toUpperCase();
      }
      if (nameA > nameB) {
        if (asc) {
          return -1;
        } else {
          return 1;
        }
      }
      if (nameA < nameB) {
        if (asc) {
          return 1;
        } else {
          return -1;
        }
      }
      // names must be equal
      return 0;
    })
    return proposals;
  },
  dynamicSort: function (property: any) {
    let sortOrder = 1;
    if (property[0] === "-") {
        sortOrder = -1;
        property = property.substring(1);
    }
    return function (a:any, b:any) {
        /* next line works with strings and numbers, 
         * and you may want to customize it to your needs
         */
        const result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
        return result * sortOrder;
    }
  },
  sortExtensions: function (extensions: ExtensionType[], asc:boolean, sortField:string) {
    if (!extensions) return []
    extensions = extensions.sort(function compare (a:ExtensionType, b:ExtensionType) {
      let nameA = a.contractId.split('.')[1].toUpperCase() // ignore upper and lowercase
      let nameB = b.contractId.split('.')[1].toUpperCase() // ignore upper and lowercase
      if (sortField === 'status') {
        nameA = (a.valid) ? 'active' : 'inactive';
        nameB = (b.valid) ? 'active' : 'inactive';               
      }
      if (nameA > nameB) {
        if (asc) {
          return -1;
        } else {
          return 1
        }
      }
      if (nameA < nameB) {
        if (asc) {
          return 1;
        } else {
          return -1
        }
      }
      // names must be equal
      return 0
    })
    return extensions;
  }
}
export default DaoUtils
