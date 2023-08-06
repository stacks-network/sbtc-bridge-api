import { Get, Route } from "tsoa";
import { countEvents, indexSbtcEvent, findSbtcEvents, saveSbtcEvents, saveAllSbtcEvents } from './utils/StacksApi.js';

export interface BalanceI {
  balance: number;
}

@Route("/signer-api/:network/v1/events")

export class EventsController {
  
  @Get("/save")
  public async saveAllSbtcEvents(): Promise<any> {
    return await saveAllSbtcEvents();
  }

  @Get("/index/stacks/:txid")
  public async indexSbtcEvent(txid:string): Promise<any> {
    return await indexSbtcEvent(txid);
  }

  @Get("/save/:page")
  public async saveSbtcEvents(page:number): Promise<any> {
    return await saveSbtcEvents(page);
  }

  @Get("/count")
  public async countEvents(): Promise<any> {
    return await countEvents();
  }
  @Get("/:page")
  public async findSbtcEvents(page:number): Promise<any> {
    return await findSbtcEvents(page);
  }
}