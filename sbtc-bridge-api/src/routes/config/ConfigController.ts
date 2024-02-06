import { getConfig } from '../../lib/config.js';

export interface IStringToStringDictionary { [key: string]: string|number|undefined; }

export class ConfigController {

  public getAllParam(): any {
    const config = getConfig();
    config.mongoDbUrl = '*****'
    config.mongoDbName = '*****'
    config.mongoPwd = '*****'
    config.mongoUser = '*****'
    config.btcRpcPwd = '*****'
    config.btcRpcUser = '*****'
    return config;
  }

  public getParam(param:string): string|number|undefined {
    let myval;
    for (const [key, value] of Object.entries(getConfig())) {
      if (key === param) myval = value;
    }
    if (param && param.indexOf('btc') > -1) return '*****'
    if (param && param.indexOf('mongo') > -1) return '*****'
    return myval;
  }
}