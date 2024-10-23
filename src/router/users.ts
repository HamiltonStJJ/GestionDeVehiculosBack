import express from "express";
import { deleteUser, getAllUsers, updateUser } from "../controllers/users";
import { isAuthenticated, isOwner } from "../middlewares";

export default (router: express.Router) => {
  router.get("/users", isAuthenticated, getAllUsers);
  router.put("/users/:username", isAuthenticated, updateUser);
  router.delete("/users/:id", isAuthenticated, isOwner, deleteUser);
};
