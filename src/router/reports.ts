import express from "express";
import { isAuthenticated, isAuthorized } from "../middlewares";
import { getRentalReports, getCarReports } from "../controllers/reports";

export default (router: express.Router) => {
  router.get("/reports/rentals", isAuthenticated, getRentalReports);
  router.get("/reports/cars", isAuthenticated, getCarReports);
};
