import express from "express";
import { isAuthenticated, isAuthorized } from "../middlewares";
import { createRate, deleteRate, getAllRates, getRate, updateRate } from "../controllers/rates";

export default (router: express.Router) => {
  router.get("/rates", isAuthenticated, getAllRates);
  router.get("rates/:id", isAuthenticated, getRate);
  router.post("/rates", isAuthenticated, createRate);
  router.put("/rates", isAuthenticated, updateRate);
  router.delete("rates/:id", isAuthenticated, deleteRate);
};
