import express from "express";
import { getCarByPlaca, createCar, deleteCar, updateCar, getAllCars } from "../controllers/cars";

import { isAuthenticated, isAuthorized } from "../middlewares";
import { addMaintenance, deleteMaintenance, getMaintenance, updateMaintenance } from "../controllers/maintenance";

export default (router: express.Router) => {
  router.get("/cars", isAuthenticated, getAllCars);
  router.get("/cars/:placa", isAuthenticated, getCarByPlaca);
  router.post("/cars", isAuthenticated, isAuthorized(["admin"]), createCar);
  router.put("/cars/:placa", isAuthenticated, updateCar);
  router.delete("/cars/:placa", isAuthenticated, isAuthorized(["admin", "empleado"]), deleteCar);

  router.get("/cars/maintenance/:placa", isAuthenticated, isAuthorized(["admin", "empleado"]), getMaintenance);
  router.post("/cars/maintenance/:placa", isAuthenticated, isAuthorized(["admin", "empleado"]), addMaintenance);
  router.put("/cars/maintenance/:placa", isAuthenticated, isAuthorized(["admin", "empleado"]), updateMaintenance);
  router.delete("/cars/maintenance/:placa", isAuthenticated, isAuthorized(["admin", "empleado"]), deleteMaintenance);
};
