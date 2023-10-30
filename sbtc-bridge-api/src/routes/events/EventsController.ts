import { Get, Route } from "tsoa";
import { countSbtcEvents, findSbtcEvents, findSbtcEventsByFilter, indexSbtcEvent, saveAllSbtcEvents, saveSbtcEvents } from './events_helper.js';
import { SbtcClarityEvent } from "sbtc-bridge-lib/dist/types/sbtc_types.js";
import { findContractEventsByPage } from "../../lib/data/db_models.js";

export interface BalanceI {
  balance: number;
}

@Route("/bridge-api/:network/v1/events")
export class EventsController {

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

  @Get("/find-all")
  public async findAllSbtcEvents(): Promise<{results: Array<SbtcClarityEvent>, events:number} > {
    const results = await findSbtcEvents();
    const events = await countSbtcEvents();
    return { results, events }
  }

  @Get("/find-by/page/:page/:limit")
  public async findSbtcEventsByPage(page:number, limit:number): Promise<{results: Array<SbtcClarityEvent>, events:number}> {
    const results = await findContractEventsByPage({}, page, limit);
    const events = await countSbtcEvents();
    return { results, events }
  }

  @Get("/find-by/filter-and-page/:filter/:page/:limit")
  public async findSbtcEventsByFilterAndPage(filter:any, page:number, limit:number): Promise<{results: Array<SbtcClarityEvent>, events:number}> {
    const results = await findContractEventsByPage(filter, page, limit);
    const events = await countSbtcEvents();
    return { results, events }
  }

  @Get("/count")
  public async countSbtcEvents():Promise<{events: number}> {
    return { events: await countSbtcEvents() };
  }

}