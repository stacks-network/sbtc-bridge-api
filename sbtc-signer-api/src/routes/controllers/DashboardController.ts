import {Get,Post,Route,Body,Query,Header,Path,SuccessResponse,Controller as Router } from "tsoa"
import { getAlphaCollection } from '../../lib/database/db_models.js'

@Route("/signer-api/{network}/v1/alpha/dashboard")

export class DashboardController extends Router {
  
  @Get("/info")
  public async getAlphaDashboardInfo(): Promise<any> {
    const col = getAlphaCollection();
    const countTotal = await col.countDocuments();
    //const totalDeposited = await col.countDocuments({'payloadData.payload.opcode': '3E'});
    //const totalWithdrawn = await col.countDocuments({'payloadData.payload.opcode': '3C'});
    const sumRequests = await col.aggregate([{ $match: {'payloadData.payload.opcode': {$regex: "3.*"}}},{$group: { _id: "$payloadData.payload.opcode", total: { $sum: "$payloadData.payload.amountSats"}, count: { $count: {}}}}, { $sort: { total: -1 } }]).toArray();
    return {
      countTotal,
      //totalDeposited,
      //totalWithdrawn,
      sumRequests
    };
  }

  @Get("/events")
  public async getAlphaDashboardEvents(): Promise<any> {
    const col = getAlphaCollection();
    const results = await col.find({}).toArray();
    return results;
  }

}
