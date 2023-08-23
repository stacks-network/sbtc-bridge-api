import { DashboardController } from "./controllers/DashboardController.js";

import express from 'express';
const router = express.Router();

router.get("/alpha/info", async (req, res, next) => {
  try {
    console.log('v1/dashboard/info ')
    const controller = new DashboardController();
    const dashboard = await controller.getAlphaDashboardInfo();
    return res.send(dashboard);
  } catch (error) {
    console.log('Error in routes: ', error)
    next('An error occurred fetching sbtc data.')
  }
});

router.get("/alpha/events", async (req, res, next) => {
  try {
    console.log('v1/dashboard/info ')
    const controller = new DashboardController();
    const dashboard = await controller.getAlphaDashboardEvents();
    return res.send(dashboard);
  } catch (error) {
    console.log('Error in routes: ', error)
    next('An error occurred fetching sbtc data.')
  }
});

export { router as dashboardRoutes }
