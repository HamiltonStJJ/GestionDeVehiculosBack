import { getAllCars, getCarByPlaca, createCar, deleteCar, updateCar, updateCarStatus } from "../controllers/cars";
import { CarModel } from "../db/carsBd";
import { RentalModel } from "../db/rentalsBd";
import { Request, Response } from "express";

jest.mock("../db/carsBd");
jest.mock("../db/rentalsBd");

describe("Controlador de autos", () => {
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

  describe("getAllCars", () => {
    it("Debería retornar todos los autos con estado 200", async () => {
      const carsMock = [
        { placa: "AAA111", nombre: "Carro 1" },
        { placa: "BBB222", nombre: "Carro 2" },
      ];
      (CarModel.find as jest.Mock).mockReturnValue({
        populate: jest.fn().mockResolvedValue(carsMock),
      });

      await getAllCars(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(carsMock);
    });

    it("Debería manejar errores y retornar status 400", async () => {
      (CarModel.find as jest.Mock).mockReturnValue({
        populate: jest.fn().mockRejectedValue(new Error("Error")),
      });

      await getAllCars(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Error al obtener los carros",
      });
    });
  });

  describe("getCarByPlaca", () => {
    it("Debería retornar un auto si existe", async () => {
      const carMock = { placa: "AAA111", nombre: "Carro 1" };
      (CarModel.findOne as jest.Mock).mockReturnValue({
        populate: jest.fn().mockResolvedValue(carMock),
      });
      req.params = { placa: "AAA111" };

      await getCarByPlaca(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(carMock);
    });

    it("Debería retornar 404 si el auto no existe", async () => {
      (CarModel.findOne as jest.Mock).mockReturnValue({
        populate: jest.fn().mockResolvedValue(null),
      });
      req.params = { placa: "ZZZ999" };

      await getCarByPlaca(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "No se encontró el carro",
      });
    });

    it("Debería manejar errores y retornar status 400", async () => {
      (CarModel.findOne as jest.Mock).mockReturnValue({
        populate: jest.fn().mockRejectedValue(new Error("Error")),
      });
      req.params = { placa: "AAA111" };

      await getCarByPlaca(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Error al obtener el carro",
      });
    });
  });

  describe("createCar", () => {
    it("Debería crear un auto y retornar estado 200", async () => {
      const newCarMock = { placa: "CCC333", nombre: "Carro 3" };
      req.body = newCarMock;

      (CarModel.findOne as jest.Mock).mockResolvedValue(null);
      (CarModel.prototype.save as jest.Mock).mockResolvedValue(newCarMock);

      await createCar(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(newCarMock);
    });

    it("Debería retornar estado 400 si el auto ya existe", async () => {
      const existingCarMock = { placa: "CCC333", nombre: "Carro 3" };
      req.body = existingCarMock;

      (CarModel.findOne as jest.Mock).mockResolvedValue(existingCarMock);

      await createCar(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "El carro ya existe",
      });
    });
  });

  describe("deleteCar", () => {
    it("Debería retornar error si el auto está en estado 'Alquilado'", async () => {
      req.params = { placa: "AAA111" };
      const carMock = { estado: "Alquilado" };

      (CarModel.findOne as jest.Mock).mockResolvedValue(carMock);

      await deleteCar(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "No se puede eliminar un carro en estado 'Alquilado'",
      });
    });

    it("Debería eliminar el auto y retornar estado 200", async () => {
      req.params = { placa: "AAA111" };
      const carMock = { estado: "Disponible" };

      (CarModel.findOne as jest.Mock).mockResolvedValue(carMock);
      (CarModel.findOneAndUpdate as jest.Mock).mockResolvedValue({});

      await deleteCar(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "El carro se eliminó con éxito",
      });
    });
  });

  describe("updateCarStatus", () => {
    it("Debería actualizar el estado del carro y retornar 200", async () => {
      req.params = { placa: "AAA111" };
      req.body = { estado: "Mantenimiento" };

      const carMock = { placa: "AAA111", estado: "Disponible", save: jest.fn() };
      (CarModel.findOne as jest.Mock).mockResolvedValue(carMock);

      await updateCarStatus(req as Request, res as Response);

      expect(carMock.estado).toBe("Mantenimiento");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Estado actualizado con éxito",
        car: carMock,
      });
    });

    it("Debería retornar error si el estado es inválido", async () => {
      req.params = { placa: "AAA111" };
      req.body = { estado: "Desconocido" };

      await updateCarStatus(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Estado inválido. Los valores válidos son: 'Disponible', 'Alquilado', 'Eliminado' o 'Mantenimiento'",
      });
    });
  });
});
