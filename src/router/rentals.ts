import express from "express";
import { isAuthenticated, isAuthorized } from "../middlewares";
import { create, getRentals, getRental, updateRental, getRentalsByClient, updateRentalStatus } from "../controllers/rentals";

export default (router: express.Router) => {
  // Obtener todos los alquileres
  router.get("/rentals", isAuthenticated, isAuthorized(["admin", "empleado"]), getRentals);

  // Obtener un alquiler por ID
  router.get("/rentals/:id", isAuthenticated, isAuthorized(["admin", "empleado"]), getRental);

  // Obtener alquileres por cliente
  router.get("/rentals/cliente/:clienteId", isAuthenticated, isAuthorized(["admin", "empleado"]), getRentalsByClient);

  // Crear un nuevo alquiler
  router.post("/rentals", isAuthenticated, isAuthorized(["admin", "empleado"]), create);

  // Actualizar un alquiler existente
  router.put("/rentals/:id", isAuthenticated, isAuthorized(["admin", "empleado"]), updateRental);

  // Cancelar un alquiler
  router.put("/rentals/status/:id", isAuthenticated, isAuthorized(["admin", "empleado"]), updateRentalStatus);
};
