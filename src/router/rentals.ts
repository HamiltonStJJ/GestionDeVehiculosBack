import express from "express";
import { isAuthenticated, isAuthorized } from "../middlewares";
import { createByEmployee, getRentals, getRental, updateRental, getRentalsByClient, updateRentalStatus, createByClient, setStatusRental } from "../controllers/rentals";

export default (router: express.Router) => {
  // Obtener todos los alquileres
  router.get("/rentals", isAuthenticated, isAuthorized(["admin", "empleado"]), getRentals);

  // Obtener un alquiler por ID
  router.get("/rentals/:id", isAuthenticated, isAuthorized(["admin", "empleado"]), getRental);

  // Obtener alquileres por cliente
  router.get("/rentals/cliente/:clienteId", isAuthenticated, isAuthorized(["admin", "empleado", "cliente"]), getRentalsByClient);

  // Crear un nuevo alquiler desde empleado
  router.post("/rentals", isAuthenticated, isAuthorized(["admin", "empleado"]), createByEmployee);

  // Crear un nuevo alquiler desde cliente
  router.post("/rentals/cliente", isAuthenticated, isAuthorized(["cliente"]), createByClient);

  // Actualizar un alquiler existente
  router.put("/rentals/:id", isAuthenticated, isAuthorized(["admin", "empleado"]), updateRental);

  // Cancelar un alquiler
  router.put("/rentals/status/:id", isAuthenticated, isAuthorized(["admin", "empleado"]), updateRentalStatus);

  // Autorizar un alquiler
  router.put("/rentals/autorizar/:id", isAuthenticated, isAuthorized(["admin", "empleado"]), setStatusRental);
};
