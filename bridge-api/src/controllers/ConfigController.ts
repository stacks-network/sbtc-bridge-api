import { Get, Route } from "tsoa";
import { dumpConfig } from '../lib/config';

export interface IStringToStringDictionary { [key: string]: string|undefined; }
@Route("/bridge-api/v1/config")
export class ConfigController {
  @Get("/")
  public getAllParam(): IStringToStringDictionary {
    dumpConfig();
    return dumpConfig();
  }

  @Get("/:param")
  public getParam(param:string): string {
    return process.env[param] || '';
  }
}