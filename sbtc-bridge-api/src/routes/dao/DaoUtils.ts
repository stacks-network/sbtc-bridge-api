
const DaoUtils = {

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
  }  
}
export default DaoUtils
