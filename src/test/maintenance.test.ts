import { getMaintenance, addMaintenance, updateMaintenance, deleteMaintenance } from "../controllers/maintenance";
import { CarModel } from "../db/carsBd";
import { Request, Response } from "express";

jest.mock("../db/carsBd");

describe("Controladores de mantenimiento", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  describe("getMaintenance", () => {
    it("Debería retornar los mantenimientos de un vehículo", async () => {
      const carMock = {
        placa: "ABC123",
        mantenimientos: [{ fecha: new Date(), descripcion: "Cambio de aceite" }],
      };

      (CarModel.findOne as jest.Mock).mockResolvedValue(carMock);
      req.params = { placa: "ABC123" };

      await getMaintenance(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ mantenimientos: carMock.mantenimientos });
    });

    it("Debería retornar 404 si el vehículo no existe", async () => {
      (CarModel.findOne as jest.Mock).mockResolvedValue(null);
      req.params = { placa: "XYZ999" };

      await getMaintenance(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "El vehículo no existe" });
    });

    it("Debería manejar errores y retornar 500", async () => {
      (CarModel.findOne as jest.Mock).mockRejectedValue(new Error("Error"));
      req.params = { placa: "ABC123" };

      await getMaintenance(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "Error al obtener mantenimientos" });
    });
  });

  describe("addMaintenance", () => {
    it("Debería agregar un mantenimiento y retornar status 200", async () => {
      const carMock = {
        placa: "ABC123",
        mantenimientos: [] as { fecha: Date; descripcion: string }[],
        save: jest.fn().mockResolvedValue(true),
      };

      (CarModel.findOne as jest.Mock).mockResolvedValue(carMock);
      req.params = { placa: "ABC123" };
      req.body = { fecha: "2024-01-01", descripcion: "Cambio de aceite" };

      await addMaintenance(req as Request, res as Response);

      expect(carMock.mantenimientos).toHaveLength(1);
      expect(carMock.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Mantenimiento agregado con éxito",
        mantenimientos: carMock.mantenimientos,
      });
    });

    it("Debería retornar 400 si faltan datos obligatorios", async () => {
      req.params = { placa: "ABC123" };
      req.body = {};

      await addMaintenance(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "La fecha y descripción son obligatorias",
      });
    });

    it("Debería manejar errores y retornar 500", async () => {
      (CarModel.findOne as jest.Mock).mockRejectedValue(new Error("Error"));
      req.params = { placa: "ABC123" };
      req.body = { fecha: "2024-01-01", descripcion: "Cambio de aceite" };

      await addMaintenance(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "Error al agregar mantenimiento" });
    });
  });

  describe("updateMaintenance", () => {
    it("Debería actualizar un mantenimiento y retornar status 200", async () => {
      const carMock = {
        mantenimientos: [{ _id: "123", fecha: new Date(), descripcion: "Cambio de aceite" }],
      };

      (CarModel.findOneAndUpdate as jest.Mock).mockResolvedValue(carMock);
      req.params = { _id: "123" };
      req.body = { descripcion: "Cambio de filtro" };

      await updateMaintenance(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Mantenimiento actualizado con éxito",
        mantenimientos: carMock.mantenimientos,
      });
    });

    it("Debería retornar 404 si el mantenimiento no existe", async () => {
      (CarModel.findOneAndUpdate as jest.Mock).mockResolvedValue(null);
      req.params = { _id: "123" };
      req.body = { descripcion: "Cambio de filtro" };

      await updateMaintenance(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "No se encontró el mantenimiento con el ID proporcionado",
      });
    });

    it("Debería manejar errores y retornar 500", async () => {
      (CarModel.findOneAndUpdate as jest.Mock).mockRejectedValue(new Error("Error"));
      req.params = { _id: "123" };
      req.body = { descripcion: "Cambio de filtro" };

      await updateMaintenance(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Error al actualizar mantenimiento",
      });
    });
  });

  describe("deleteMaintenance", () => {
    it("Debería eliminar un mantenimiento y retornar status 200", async () => {
      const carMock = {
        mantenimientos: [] as { fecha: Date; descripcion: string }[],
      };

      (CarModel.findOneAndUpdate as jest.Mock).mockResolvedValue(carMock);
      req.params = { _id: "123" };

      await deleteMaintenance(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Mantenimiento eliminado con éxito",
        mantenimientos: carMock.mantenimientos,
      });
    });

    it("Debería retornar 404 si el mantenimiento no existe", async () => {
      (CarModel.findOneAndUpdate as jest.Mock).mockResolvedValue(null);
      req.params = { _id: "123" };

      await deleteMaintenance(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "No se encontró el mantenimiento con el ID proporcionado",
      });
    });

    it("Debería manejar errores y retornar 500", async () => {
      (CarModel.findOneAndUpdate as jest.Mock).mockRejectedValue(new Error("Error"));
      req.params = { _id: "123" };

      await deleteMaintenance(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Error al eliminar mantenimiento",
      });
    });
  });
});
