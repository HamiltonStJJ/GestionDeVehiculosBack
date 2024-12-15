import express from "express";
import authentication from "./authentication";
import users from "./users";
import cars from "./cars";
import rates from "./rates";
import rentals from "./rentals";
import payment from "./payments";

const router = express.Router();

export default (): express.Router => {
  authentication(router);
  users(router);
  cars(router);
  rates(router);
  rentals(router);
  payment(router);
  return router;
};
