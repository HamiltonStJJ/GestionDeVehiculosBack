import express from "express";
import {getCarByPlaca,createCar,deleteCar,updateCar,getAllCars} from "../controllers/cars";
import { isAuthenticated, isAuthorized } from "../middlewares";

export default (router: express.Router) => 
{
  router.get("/cars", isAuthenticated, getAllCars);
  router.get("/cars/:placa", isAuthenticated, getCarByPlaca);
  router.post("/cars", isAuthenticated, isAuthorized(["admin"]), createCar);
  router.put("/cars/:placa", isAuthenticated, updateCar);
  router.delete("/cars/:placa",isAuthenticated,isAuthorized(["admin", "empleado"]),deleteCar);
};
