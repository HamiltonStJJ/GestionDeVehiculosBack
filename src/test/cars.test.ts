import { getAllCars, getCarByPlaca, createCar, deleteCar, updateCar, updateCarStatus } from "../controllers/cars";
import { CarModel } from "../db/carsBd";
import { Request, Response } from "express";

jest.mock("../db/carsBd");

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

  describe("Obtener autos", () => {
    it("Debería retornar una lista de autos", async () => {
      const carsMock = [
        { placa: "AAA111", nombre: "Carro 1", marca: "Toyota" },
        { placa: "BBB222", nombre: "Carro 2", marca: "Honda" },
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

  describe("Obtener auto por placa", () => {
    it("Debería retornar un auto si existe", async () => {
      const carMock = { placa: "AAA111", nombre: "Carro 1", marca: "Toyota" };
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

  describe("Crear auto", () => {
    it("Debería crear un auto nuevo y retornar status 200", async () => {
      const newCarMock = { placa: "AAA111", nombre: "Carro 1" };
      req.body = newCarMock;

      (CarModel.findOne as jest.Mock).mockResolvedValue(null);
      (CarModel.prototype.save as jest.Mock).mockResolvedValue(newCarMock);

      await createCar(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(newCarMock);
    });

    it("Debería retornar 400 si el auto ya existe", async () => {
      const existingCarMock = { placa: "AAA111", nombre: "Carro 1" };
      req.body = existingCarMock;

      (CarModel.findOne as jest.Mock).mockResolvedValue(existingCarMock);

      await createCar(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "El carro ya existe",
      });
    });
  });

  describe("Eliminar auto", () => {
    it("Debería retornar error 400 si el carro está en estado 'Alquilado'", async () => {
      req.params = { placa: "AAA111" };

      const carMock = {
        estado: "Alquilado",
      };

      (CarModel.findOne as jest.Mock).mockResolvedValue(carMock);

      await deleteCar(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "No se puede eliminar un carro en estado 'Alquilado'",
      });
    });

    it("Debería retornar error 404 si el carro no se encuentra", async () => {
      req.params = { placa: "AAA111" };

      (CarModel.findOne as jest.Mock).mockResolvedValue(null);

      await deleteCar(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "Carro no encontrado",
      });
    });

    it("Debería eliminar un carro en estado válido y retornar status 200", async () => {
      req.params = { placa: "AAA111" };

      const carMock = {
        estado: "Disponible",
      };

      (CarModel.findOne as jest.Mock).mockResolvedValue(carMock);
      (CarModel.findOneAndUpdate as jest.Mock).mockResolvedValue({});

      await deleteCar(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "El carro se eliminó con éxito",
      });
    });
  });
});
