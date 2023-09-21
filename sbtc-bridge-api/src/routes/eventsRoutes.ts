import express from "express";
import { EventsController } from "./events/EventsController.js";

const router = express.Router();

router.get("/read", async (req, res, next) => {
  try {
    const controller = new EventsController();
    const response = await controller.readAllEvents();
    return res.send(response);
  } catch (error) {
    console.log('Error in routes: ', error)
    next('An error occurred fetching sbtc data.') 
  }
});

export { router as eventsRoutes }
