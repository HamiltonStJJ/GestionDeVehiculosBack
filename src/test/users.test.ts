import { getAllUsers, updateUser, deleteUser } from "../controllers/users";
import { getUsers, deleteUserById, getUserById } from "../db/usersBd";
import { Request, Response } from "express";

jest.mock("../db/usersBd");

describe("getAllUsers", () => {
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

  it("should return a list of users", async () => {
    const usersMock = [{ id: 1, nombre: "Test User" }];
    (getUsers as jest.Mock).mockResolvedValue(usersMock);

    await getAllUsers(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(usersMock);
  });

  it("should handle errors and return status 400", async () => {
    (getUsers as jest.Mock).mockRejectedValue(new Error("Error"));

    await getAllUsers(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Error al obtener los usuarios",
    });
  });

  describe("updateUser", () => {
    let req: Partial<Request>;
    let res: Partial<Response>;

    beforeEach(() => {
      req = { params: { id: "1" }, body: {} };
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
    });

    it("should return 400 if no data to update is provided", async () => {
      await updateUser(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "No hay datos para actualizar",
      });
    });

    it("should return 404 if user is not found", async () => {
      (getUserById as jest.Mock).mockResolvedValue(null);
      req.body = { nombre: "Nuevo Nombre" };

      await updateUser(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "Usuario no encontrado",
      });
    });

    it("should update the user and return status 200", async () => {
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

    it("should handle errors and return status 400", async () => {
      req.body = { nombre: "Nuevo Nombre" };

      (getUserById as jest.Mock).mockRejectedValue(new Error("Error"));

      await updateUser(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Error al actualizar el usuario",
      });
    });
  });

  describe("deleteUser", () => {
    let req: Partial<Request>;
    let res: Partial<Response>;

    beforeEach(() => {
      req = { params: { id: "1" } };
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
    });

    it("should delete a user and return status 200", async () => {
      const deleteUserMock = { message: "Usuario eliminado" };
      (deleteUserById as jest.Mock).mockResolvedValue(deleteUserMock);

      await deleteUser(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith(deleteUserMock);
    });

    it("should handle errors and return status 400", async () => {
      (deleteUserById as jest.Mock).mockRejectedValue(new Error("Error"));

      await deleteUser(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Error al eliminar el usuario",
      });
    });
  });
});
