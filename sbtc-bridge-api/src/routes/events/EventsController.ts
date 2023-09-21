import { Route } from "tsoa";
import { saveAllSbtcEvents } from './events_helper.js';

export interface BalanceI {
  balance: number;
}

@Route("/bridge-api/:network/v1/contract")
export class EventsController {

  //@Get("/events/save")
  public async readAllEvents(): Promise<any> {
    return await saveAllSbtcEvents();
  }

  /**
  //@Get("/events/index/stacks/:txid")
  public async indexSbtcEvent(txid:string): Promise<any> {
    return await indexSbtcEvent(txid);
  }

  //@Get("/events/save/:page")
  public async saveSbtcEvents(page:number): Promise<any> {
    return await saveSbtcEvents(page);
  }

  //@Get("/events/:page")
  public async findSbtcEvents(page:number): Promise<any> {
    return await findSbtcEvents(page);
  }
   */

}