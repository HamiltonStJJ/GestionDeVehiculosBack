import { Router } from "express";
import {
  register,
  login,
  requestPasswordReset,
  changePassword,
} from "../controllers/authentication";
import { isAuthenticated } from "../middlewares";

export default (router: Router) => {
  router.post("/auth/register", register);
  router.post("/auth/login", login);
  router.post("/auth/forgot", requestPasswordReset);
  router.post("/auth/change", isAuthenticated, changePassword);
};
