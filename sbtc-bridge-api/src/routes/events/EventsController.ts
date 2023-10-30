import { Get, Route } from "tsoa";
import { findSbtcEvents, findSbtcEventsByFilter, indexSbtcEvent, saveAllSbtcEvents, saveSbtcEvents } from './events_helper.js';
import { SbtcClarityEvent } from "sbtc-bridge-lib/dist/types/sbtc_types.js";
import { findContractEventsByPage } from "../../lib/data/db_models.js";

export interface BalanceI {
  balance: number;
}

@Route("/bridge-api/:network/v1/contract")
export class EventsController {

  //@Get("/events/save")
  public async readAllEvents(): Promise<Array<SbtcClarityEvent>> {
    return await findSbtcEvents(0);
  }

  /**
   */
  @Get("/index/stacks/:txid")
  public async indexSbtcEvent(txid:string): Promise<any> {
    return await indexSbtcEvent(txid);
  }

  @Get("/save/:page")
  public async saveSbtcEvents(page:number): Promise<Array<SbtcClarityEvent>> {
    return await saveSbtcEvents(page);
  }

  @Get("/filter/:name/:value")
  public async findSbtcEventsByFilter(name:string, value:string): Promise<Array<SbtcClarityEvent>> {
    return await findSbtcEventsByFilter({name: value});
  }

  @Get("/:page")
  public async findSbtcEvents(page:number): Promise<Array<SbtcClarityEvent>> {
    return await findSbtcEvents(page);
  }

  @Get("/:page/:limit")
  public async findSbtcEventsByPage(filter:any, page:number, limit:number): Promise<Array<SbtcClarityEvent>> {
    return await findContractEventsByPage(filter, page, limit);
  }

}