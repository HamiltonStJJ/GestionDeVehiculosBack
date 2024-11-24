import express from "express";
import { isAuthenticated, isAuthorized } from "../middlewares";
import { createByEmployee, getRentals, getRental, updateRental, getRentalsByClient, updateRentalStatus, createByClient, setStatusRental } from "../controllers/rentals";

export default (router: express.Router) => {
  router.get("/rentals", isAuthenticated, isAuthorized(["admin", "empleado"]), getRentals);
  router.get("/rentals/:id", isAuthenticated, isAuthorized(["admin", "empleado"]), getRental);
  router.get("/rentals/cliente/:clienteId", isAuthenticated, isAuthorized(["admin", "empleado", "cliente"]), getRentalsByClient);
  router.post("/rentals", isAuthenticated, isAuthorized(["admin", "empleado"]), createByEmployee);
  router.post("/rentals/cliente", isAuthenticated, isAuthorized(["cliente"]), createByClient);
  router.put("/rentals/:id", isAuthenticated, isAuthorized(["admin", "empleado"]), updateRental);
  router.put("/rentals/status/:id", isAuthenticated, isAuthorized(["admin", "empleado"]), updateRentalStatus);
  router.put("/rentals/autorizar/:id", isAuthenticated, isAuthorized(["admin", "empleado"]), setStatusRental);
};
