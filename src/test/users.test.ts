import { getAllUsers, updateUser, deleteUser, getUser } from "../controllers/users";
import { getUsers, deleteUserByCedula, getUserByCedula } from "../db/usersBd";
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
      const usersMock = [{ cedula: "1", nombre: "Test User" }];
      (getUsers as jest.Mock).mockResolvedValue(usersMock);

      await getAllUsers(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(usersMock);
    });

    it("Debería retornar un usuario si se encuentra en la base de datos", async () => {
      const userMock = {
        cedula: "1",
        nombre: "Test User",
        apellido: "Test Apellido",
        direccion: "Test Address",
        telefono: "123456789",
        email: "testuser@example.com",
      };

      (getUserByCedula as jest.Mock).mockResolvedValue(userMock);
      req.params = { cedula: "1" };

      await getUser(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(userMock);
    });

    it("Debería manejar errores y retornar status 400", async () => {
      (getUsers as jest.Mock).mockRejectedValue(new Error("Error"));

      await getAllUsers(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Error al obtener los usuarios",
      });
    });

    it("Debería retornar 404 si el usuario no se encuentra", async () => {
      (getUserByCedula as jest.Mock).mockResolvedValue(null);
      req.params = { cedula: "999" };

      await getUser(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "Usuario no encontrado",
      });
    });
  });

  describe("Actualización de usuario", () => {
    it("Debería retornar 400 si no se proporcionan datos para actualizar", async () => {
      req = { params: { cedula: "1" }, body: {} };

      await updateUser(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "No hay datos para actualizar",
      });
    });

    it("Debería retornar 404 si el usuario no se encuentra", async () => {
      (getUserByCedula as jest.Mock).mockResolvedValue(null);
      req = { params: { cedula: "1" }, body: { nombre: "Nuevo Nombre" } };

      await updateUser(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "Usuario no encontrado",
      });
    });

    it("Debería actualizar el usuario y retornar status 200", async () => {
      const userMock = {
        nombre: "Old Name",
        apellido: "Old Last Name",
        save: jest.fn().mockResolvedValue(true),
      };
      (getUserByCedula as jest.Mock).mockResolvedValue(userMock);
      req = {
        params: { cedula: "1" },
        body: { nombre: "Nuevo Nombre", apellido: "Nuevo Apellido" },
      };

      await updateUser(req as Request, res as Response);

      expect(userMock.nombre).toBe("Nuevo Nombre");
      expect(userMock.apellido).toBe("Nuevo Apellido");
      expect(userMock.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(userMock);
    });

    it("Debería capturar errores y retornar status 400", async () => {
      req = { params: { cedula: "1" }, body: { nombre: "Nuevo Nombre" } };

      (getUserByCedula as jest.Mock).mockRejectedValue(new Error("Error"));

      await updateUser(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Error al actualizar el usuario",
      });
    });
  });

  describe("Eliminación de usuario", () => {
    it("Debería eliminar un usuario y retornar status 200", async () => {
      const deleteUserMock = { message: "Usuario eliminado" };
      (deleteUserByCedula as jest.Mock).mockResolvedValue(deleteUserMock);
      req = { params: { cedula: "1" } };

      await deleteUser(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith(deleteUserMock);
    });

    it("Debería capturar errores y retornar status 400", async () => {
      (deleteUserByCedula as jest.Mock).mockRejectedValue(new Error("Error"));
      req = { params: { cedula: "1" } };

      await deleteUser(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Error al eliminar el usuario",
      });
    });
  });
});
