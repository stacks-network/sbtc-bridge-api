import { Get, Route } from "tsoa";
import { dumpConfig } from '../lib/config';

@Route("/bridge-api/v1/config")
export class ConfigController {
  @Get("/")
  public getAllParam(): object {
    dumpConfig();
    return dumpConfig();
  }

  @Get("/:param")
  public getParam(param:string): string {
    return process.env[param] || '';
  }
}