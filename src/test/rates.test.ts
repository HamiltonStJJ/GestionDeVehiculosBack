import { getAllRates, getRate, createRate, deleteRate, updateRate } from "../controllers/rates";
import { RateModel } from "../db/RatesBd";
import { Request, Response } from "express";

jest.mock("../db/RatesBd");

describe("Controladores de tarifas", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  describe("getAllRates", () => {
    it("Debería devolver todas las tarifas", async () => {
      const ratesMock = [{ id: "1", tipoVehiculo: "Carro", tarifa: 100 }];
      (RateModel.find as jest.Mock).mockResolvedValue(ratesMock);

      await getAllRates(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(ratesMock);
    });

    it("Debería manejar errores y devolver status 400", async () => {
      (RateModel.find as jest.Mock).mockRejectedValue(new Error("Error"));

      await getAllRates(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Error al obtener las tarifas" });
    });
  });

  describe("getRate", () => {
    it("Debería devolver una tarifa específica", async () => {
      const rateMock = { id: "1", tipoVehiculo: "Carro", tarifa: 100 };
      (RateModel.findById as jest.Mock).mockResolvedValue(rateMock);
      req.params = { id: "1" };

      await getRate(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(rateMock);
    });

    it("Debería devolver 404 si la tarifa no existe", async () => {
      (RateModel.findById as jest.Mock).mockResolvedValue(null);
      req.params = { id: "1" };

      await getRate(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "No se encontró la tarifa" });
    });

    it("Debería manejar errores y devolver status 400", async () => {
      (RateModel.findById as jest.Mock).mockRejectedValue(new Error("Error"));
      req.params = { id: "1" };

      await getRate(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Error al obtener la tarifa" });
    });
  });

  describe("createRate", () => {
    it("Debería crear una nueva tarifa", async () => {
      const rateMock = {
        tipoVehiculo: "Sedán",
        duracion: "Diario",
        temporada: "Alta",
        tarifa: 70,
      };
      req.body = rateMock;

      (RateModel.prototype.save as jest.Mock).mockResolvedValue(rateMock);

      await createRate(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(200);
    });

    it("Debería manejar errores y devolver status 400", async () => {
      req.body = { tipoVehiculo: "Carro" };
      (RateModel.prototype.save as jest.Mock).mockRejectedValue(new Error("Error"));

      await createRate(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Error al crear la tarifa" });
    });
  });

  describe("deleteRate", () => {
    it("Debería eliminar una tarifa y devolver status 200", async () => {
      req.params = { id: "1" };
      (RateModel.findByIdAndDelete as jest.Mock).mockResolvedValue(true);

      await deleteRate(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: "La tarifa se elimino con éxito" });
    });

    it("Debería devolver 400 si no se encuentra la tarifa", async () => {
      req.params = { id: null };

      await deleteRate(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "No se ha encontrado la tarifa" });
    });
  });

  describe("updateRate", () => {
    it("Debería actualizar una tarifa y devolver status 200", async () => {
      const rateMock = { id: "1", tipoVehiculo: "Carro", tarifa: 100, save: jest.fn() };
      (RateModel.findById as jest.Mock).mockResolvedValue(rateMock);
      req.params = { id: "1" };
      req.body = { tipoVehiculo: "Moto", tarifa: 50 };

      await updateRate(req as Request, res as Response);

      expect(rateMock.tipoVehiculo).toBe("Moto");
      expect(rateMock.tarifa).toBe(50);
      expect(rateMock.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: "La tarifa se actualizo con éxito" });
    });

    it("Debería devolver 400 si no hay datos para actualizar", async () => {
      req.params = { id: "1" };
      req.body = {};

      await updateRate(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "No hay datos para actualizar " });
    });

    it("Debería devolver 400 si la tarifa no existe", async () => {
      (RateModel.findById as jest.Mock).mockResolvedValue(null);
      req.params = { id: "1" };
      req.body = { tipoVehiculo: "Moto" };

      await updateRate(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "No se ha encontrado la tarifa" });
    });
  });
});
