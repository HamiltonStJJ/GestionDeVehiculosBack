import express from "express";
import { deleteUser, getAllUsers, updateUser } from "../controllers/users";
import { isAuthenticated, isAuthorized, isOwner } from "../middlewares";

export default (router: express.Router) => {
  router.get("/users", isAuthenticated, isAuthorized(["admin"]), getAllUsers);
  router.put("/users/:id", isAuthenticated, updateUser);
  router.delete("/users/:id", isAuthenticated, isOwner, deleteUser);
};
