import express from "express";
import { getUsers, deleteUserById, getUserById } from "../db/users";

export const getAllUsers = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const users = await getUsers();
    res.status(200).json(users).end();
    return;
  } catch (error) {
    console.log(error);
    res.sendStatus(400);
    return;
  }
};

export const updateUser = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { id } = req.body;
    const { username } = req.params;

    if (!username) {
      res.sendStatus(400);
      return;
    }

    const user = await getUserById(id);

    user.username = username;
    await user.save();

    res.json(user).end();
    return;
  } catch (error) {
    console.log(error);
    res.sendStatus(400);
    return;
  }
};

export const deleteUser = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { id } = req.params;
    const deleteUser = await deleteUserById(id);

    res.json(deleteUser).end();
    return;
  } catch (error) {
    console.log(error);
    res.sendStatus(400);
    return;
  }
};
