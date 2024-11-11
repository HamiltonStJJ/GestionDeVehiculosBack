import express from "express";
import { getUsers, deleteUserByCedula, getUserById } from "../db/usersBd";

export const getAllUsers = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const users = await getUsers();
    res.status(200).json(users);
    return;
  } catch (error) {
    res.status(400).json({ message: "Error al obtener los usuarios" });
    return;
  }
};

export const updateUser = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { id } = req.params;
    const { nombre, apellido, direccion, telefono, email, rol, estado } =
      req.body;

    if (
      !nombre &&
      !apellido &&
      !direccion &&
      !telefono &&
      !email &&
      !rol &&
      !estado
    ) {
      res.status(400).json({ message: "No hay datos para actualizar" });
      return;
    }

    const user = await getUserById(id);

    if (!user) {
      res.status(404).json({ message: "Usuario no encontrado" });
      return;
    }

    if (nombre) user.nombre = nombre;
    if (apellido) user.apellido = apellido;
    if (direccion) user.direccion = direccion;
    if (telefono) user.telefono = telefono;
    if (email) user.email = email;
    if (rol) user.rol = rol;
    if (estado) user.estado = estado;

    await user.save();

    res.status(200).json(user);
  } catch (error) {
    res.status(400).json({ message: "Error al actualizar el usuario" });
  }
};

export const deleteUser = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { id } = req.params;
    const deleteUser = await deleteUserByCedula(id);
    deleteUser;
    res.json({ message: "Usuario eliminado" });
    return;
  } catch (error) {
    res.status(400).json({ message: "Error al eliminar el usuario" });
    return;
  }
};
