import { Get, Route } from "tsoa";
import { getConfig } from '../lib/config.js';

export interface IStringToStringDictionary { [key: string]: string|number|undefined; }
@Route("/bridge-api/v1/config")
export class ConfigController {
  @Get("/")
  public getAllParam(): IStringToStringDictionary {
    const config = getConfig();
    config.btcRpcPwd = '*****'
    config.btcRpcUser = '*****'
    return config
  }

  @Get("/:param")
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