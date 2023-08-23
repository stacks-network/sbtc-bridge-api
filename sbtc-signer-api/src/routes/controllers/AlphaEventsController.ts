import { Get, Route } from "tsoa";
import { countEvents, indexAlphaEvent, findAlphaEvents, saveAlphaEvents, saveAllAlphaEvents } from './utils/AlphaEventsApi.js';

export interface BalanceI {
  balance: number;
}

@Route("/signer-api/:network/v1/events/alpha")

export class AlphaEventsController {
  
  @Get("/read-all")
  public async saveAllAlphaEvents(): Promise<any> {
    return await saveAllAlphaEvents();
  }

  @Get("/read/:page")
  public async saveAlphaEvents(page:number): Promise<any> {
    return await saveAlphaEvents(page);
  }

  @Get("/index/stacks/:txid")
  public async indexAlphaEvent(txid:string): Promise<any> {
    return await indexAlphaEvent(txid);
  }

  @Get("/count")
  public async countEvents(): Promise<any> {
    return await countEvents();
  }
  @Get("/:page")
  public async findAlphaEvents(page:number): Promise<any> {
    return await findAlphaEvents(page);
  }
}