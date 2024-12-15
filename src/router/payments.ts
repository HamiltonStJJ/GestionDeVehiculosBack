import express from "express";
import { isAuthenticated } from "../middlewares";
import { createPayment, capturePayment } from "../controllers/payments";

export default (router: express.Router) => {
  router.post("/payments", isAuthenticated, createPayment);
  router.post("/payments/capture/:orderId", isAuthenticated, capturePayment);
};
