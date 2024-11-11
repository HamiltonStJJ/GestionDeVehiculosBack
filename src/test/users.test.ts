import { getAllUsers, updateUser, deleteUser } from "../controllers/users";
import { getUsers, deleteUserByCedula, getUserById } from "../db/usersBd";
import { Request, Response } from "express";

jest.mock("../db/usersBd");

describe("Controlador de usuarios", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      end: jest.fn(),
    };
  });

  describe("Usuarios", () => {
    it("Debería retornar una lista de usuarios", async () => {
      const usersMock = [{ id: 1, nombre: "Test User" }];
      (getUsers as jest.Mock).mockResolvedValue(usersMock);

      await getAllUsers(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(usersMock);
    });

    it("Debería manejar errores y retornar status 400", async () => {
      (getUsers as jest.Mock).mockRejectedValue(new Error("Error"));

      await getAllUsers(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Error al obtener los usuarios",
      });
    });
  });

  describe("Actualización de usuario", () => {
    let req: Partial<Request>;
    let res: Partial<Response>;

    beforeEach(() => {
      req = { params: { id: "1" }, body: {} };
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
    });

    it("Debería retornar 400 si no se proporcionan datos para actualizar", async () => {
      await updateUser(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "No hay datos para actualizar",
      });
    });

    it("Debería retornar 404 si el usuario no se encuentra", async () => {
      (getUserById as jest.Mock).mockResolvedValue(null);
      req.body = { nombre: "Nuevo Nombre" };

      await updateUser(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "Usuario no encontrado",
      });
    });

    it("Debería actualizar el usuario y retornar status 200", async () => {
      const userMock = {
        nombre: "Old Name",
        save: jest.fn().mockResolvedValue(true),
      };
      (getUserById as jest.Mock).mockResolvedValue(userMock);
      req.body = { nombre: "Nuevo Nombre" };

      await updateUser(req as Request, res as Response);

      expect(userMock.nombre).toBe("Nuevo Nombre");
      expect(userMock.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(userMock);
    });

    it("Debería capturar errores y retornar status 400", async () => {
      req.body = { nombre: "Nuevo Nombre" };

      (getUserById as jest.Mock).mockRejectedValue(new Error("Error"));

      await updateUser(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Error al actualizar el usuario",
      });
    });
  });

  describe("Eliminación de usuario", () => {
    let req: Partial<Request>;
    let res: Partial<Response>;

    beforeEach(() => {
      req = { params: { id: "1" } };
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
    });

    it("Debería eliminar un usuario y retornar status 200", async () => {
      const deleteUserMock = { message: "Usuario eliminado" };
      (deleteUserByCedula as jest.Mock).mockResolvedValue(deleteUserMock);

      await deleteUser(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith(deleteUserMock);
    });

    it("Debería capturar errores y retornar status 400", async () => {
      (deleteUserByCedula as jest.Mock).mockRejectedValue(new Error("Error"));

      await deleteUser(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Error al eliminar el usuario",
      });
    });
  });
});
