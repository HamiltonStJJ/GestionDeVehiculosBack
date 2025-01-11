import express from "express";
import { getCarByPlaca, createCar, deleteCar, updateCar, getAllCars, updateCarStatus, getCarsByStateAndDate } from "../controllers/cars";

import { isAuthenticated, isAuthorized } from "../middlewares";
import { addMaintenance, deleteMaintenance, getMaintenance, updateMaintenance } from "../controllers/maintenance";

export default (router: express.Router) => {
  router.get("/cars/estados/", isAuthenticated, isAuthorized(["admin", "empleado","cliente"]), getCarsByStateAndDate);
  router.get("/cars", getAllCars);
  router.get("/cars/:placa", isAuthenticated, getCarByPlaca);
  router.post("/cars", isAuthenticated, isAuthorized(["admin"]), createCar);
  router.put("/cars/:placa", isAuthenticated, updateCar);
  router.delete("/cars/:placa", isAuthenticated, isAuthorized(["admin", "empleado"]), deleteCar);
  router.put("/cars/estado/:placa", isAuthenticated, isAuthorized(["admin", "empleado"]), updateCarStatus);
  router.get("/cars/maintenance/:placa", isAuthenticated, isAuthorized(["admin"]), getMaintenance);
  router.post("/cars/maintenance/:placa", isAuthenticated, isAuthorized(["admin"]), addMaintenance);
  router.put("/cars/maintenance/:_id", isAuthenticated, isAuthorized(["admin"]), updateMaintenance);
  router.delete("/cars/maintenance/:_id", isAuthenticated, isAuthorized(["admin"]), deleteMaintenance);
};
