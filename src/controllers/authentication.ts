import express from "express";
import { authentication, random } from "../helpers/password";
import { getUserByEmail, createUser } from "../db/users";

export const register = async (req: express.Request, res: express.Response) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      res.sendStatus(400);
      return;
    }

    const existingUser = await getUserByEmail(email);

    if (existingUser) {
      res.sendStatus(400);
      return;
    }

    const salt = random();
    const user = await createUser({
      email,
      username,
      authentication: {
        salt,
        password: authentication(salt, password),
      },
    });

    res.status(200).json(user).end();
    return;
  } catch (error) {
    console.log(error);
    res.sendStatus(400);
    return;
  }
};

export const login = async (req: express.Request, res: express.Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.sendStatus(400);
      return;
    }

    const user = await getUserByEmail(email).select(
      "+authentication.salt +authentication.password"
    );

    if (!user) {
      console.log("No se ha encontrado el usuario");
      res.sendStatus(400);
      return;
    }

    const expectedHash = authentication(user.authentication.salt, password);

    if (user.authentication.password !== expectedHash) {
      res.sendStatus(403);
      return;
    }

    const salt = random();

    user.authentication.sessionToken = authentication(
      salt,
      user._id.toString()
    );

    await user.save();

    res.cookie("auth", user.authentication.sessionToken, {
      domain: "localhost",
      path: "/",
    });

    res.status(200).json(user).end();
    return;
  } catch (error) {
    console.log(error);
    res.sendStatus(400);
    return;
  }
};
