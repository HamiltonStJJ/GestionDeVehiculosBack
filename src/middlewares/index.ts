import express from "express";
import { get, identity, merge } from "lodash";
import { getUserBySessionToken } from "../db/usersBd";

export const isAuthenticated = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const sessionToken = req.cookies["auth"];

    if (!sessionToken) {
      res.sendStatus(403);
      return;
    }

    const existingUser = await getUserBySessionToken(sessionToken);

    if (!existingUser) {
      res.sendStatus(403);
      return;
    }

    merge(req, { identity: existingUser });

    return next();
  } catch (error) {
    console.log(error);
    res.sendStatus(400);
    return;
  }
};

export const isOwner = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const { id } = req.params;
    const currentUser = get(req, "identity._id") as string;

    if (!currentUser) {
      res.sendStatus(403);
      return;
    }

    if (currentUser.toString() !== id) {
      res.sendStatus(403);
      return;
    }

    next();
  } catch (error) {
    console.log(error);
    res.sendStatus(400);
    return;
  }
};

export const isAuthorized = (roles: string[]) => {
  return async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    try {
      const currentUserRole = get(req, "identity.rol") as string;

      if (!currentUserRole) {
        res.sendStatus(403);
        return;
      }

      if (!roles.includes(currentUserRole)) {
        res.sendStatus(403);
        return;
      }

      next();
    } catch (error) {
      console.log(error);
      res.sendStatus(400);
      return;
    }
  };
};
