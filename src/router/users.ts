import express from "express";
import { deleteUser, getAllUsers, getUser, updateUser } from "../controllers/users";
import { isAuthenticated, isAuthorized, isOwner } from "../middlewares";

export default (router: express.Router) => {
  router.get("/users", isAuthenticated, isAuthorized(["admin","empleado"]), getAllUsers);
  router.get("/users/:cedula", isAuthenticated, getUser);
  router.put("/users/:cedula", isAuthenticated, updateUser);
  router.delete("/users/:cedula", isAuthenticated, isOwner, deleteUser);
};
