import express from "express";
import { capturePayment, cancelPayment } from "../controllers/payments";

export default (router: express.Router) => {
  router.get("/payments/capture/", capturePayment);
  router.get("/payments/cancel/", cancelPayment);
};
