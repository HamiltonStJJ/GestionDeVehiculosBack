import { createByEmployee, returnRental } from "../controllers/rentals";
import { RentalModel } from "../db/rentalsBd";
import { CarModel } from "../db/carsBd";
import { getUserById } from "../db/usersBd";
import { RateModel } from "../db/RatesBd";
import { sendEmail } from "../helpers/mailer";
import { createPayment } from "../controllers/payments";
import { Response } from "express";

jest.mock("../db/rentalsBd");
jest.mock("../db/carsBd");
jest.mock("../db/usersBd");
jest.mock("../db/RatesBd");
jest.mock("../helpers/mailer");
jest.mock("../controllers/payments");

describe("Rental Controller", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const mockResponse = () => {
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;
    return res;
  };

  describe("createByEmployee", () => {
    it("debería devolver error si faltan datos obligatorios", async () => {
      const req = { body: {} } as any;
      const res = mockResponse();

      await createByEmployee(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Faltan datos obligatorios" });
    });

    it("debería devolver error si el cliente no existe", async () => {
      const req = { body: { cliente: "123", auto: "456", fechaInicio: "2023-01-01", fechaFin: "2023-01-10", tarifaAplicada: "789" } } as any;
      const res = mockResponse();

      (getUserById as jest.Mock).mockResolvedValue(null);

      await createByEmployee(req, res);

      expect(getUserById).toHaveBeenCalledWith("123");
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Cliente no encontrado" });
    });

    it("debería devolver error si el auto no está disponible", async () => {
      const req = { body: { cliente: "123", auto: "456", fechaInicio: "2023-01-01", fechaFin: "2023-01-10", tarifaAplicada: "789" } } as any;
      const res = mockResponse();

      (getUserById as jest.Mock).mockResolvedValue({ id: "123" });
      (CarModel.findById as jest.Mock).mockResolvedValue(null);

      await createByEmployee(req, res);

      expect(CarModel.findById).toHaveBeenCalledWith("456");
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "El vehículo no se encuentra en" });
    });

    it("debería crear el pago y enviar el email al cliente", async () => {
      const req = {
        body: {
          cliente: "123",
          auto: "456",
          fechaInicio: "2023-01-01",
          fechaFin: "2023-01-10",
          tarifaAplicada: "789",
        },
      } as any;
      const res = mockResponse();

      (getUserById as jest.Mock).mockResolvedValue({ id: "123", email: "cliente@email.com" });
      (CarModel.findById as jest.Mock).mockResolvedValue({ id: "456", nombre: "Auto Test" });
      (RentalModel.find as jest.Mock).mockResolvedValue([]);
      (RateModel.findById as jest.Mock).mockResolvedValue({ tarifa: 100 });
      (createPayment as jest.Mock).mockResolvedValue({ links: [{}, { href: "payment-link" }] });
      (sendEmail as jest.Mock).mockResolvedValue("Email enviado");

      await createByEmployee(req, res);

      expect(createPayment).toHaveBeenCalledWith(270, "USD", "Pago inicial por el alquiler del vehículo Auto Test", {
        cliente: "123",
        auto: "456",
        estado: "En curso",
        fechaFin: new Date("2023-01-10"),
        fechaInicio: new Date("2023-01-01"),
        garantia: 270,
        subtotal: 900,
        tarifaAplicada: "789",
      });
      expect(sendEmail).toHaveBeenCalledWith("cliente@email.com", "Pago inicial por alquiler del auto Auto Test", "Enlace para el pago inicial: payment-link");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: "Pago inicial enviado al cliente Email enviado" });
    });
  });

  describe("returnRental", () => {
    it("debería devolver error si el alquiler no existe", async () => {
      const req = { params: { id: "123" }, body: { piezasRevisadas: [] } } as any;
      const res = mockResponse();

      (RentalModel.findById as jest.Mock).mockResolvedValue(null);

      await returnRental(req, res);

      expect(RentalModel.findById).toHaveBeenCalledWith("123");
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Alquiler no encontrado" });
    });

    it("debería calcular daños y días adicionales correctamente", async () => {
      const req = {
        params: { id: "123" },
        body: {
          piezasRevisadas: [
            { pieza: "motor", estado: "Dañado" },
            { pieza: "puerta", estado: "Correcto" },
          ],
        },
      } as any;
      const res = mockResponse();

      (RentalModel.findById as jest.Mock).mockResolvedValue({
        _id: "123",
        cliente: "456",
        auto: "789",
        fechaFin: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        subtotal: 1000,
        garantia: 300,
        estado: "En curso",
      });
      (CarModel.findById as jest.Mock).mockResolvedValue({ id: "789", nombre: "Auto Test", valor: 20000, estado: "Alquilado" });
      (getUserById as jest.Mock).mockResolvedValue({ email: "cliente@email.com" });
      (createPayment as jest.Mock).mockResolvedValue({ links: [{}, { href: "payment-link" }] });
      (sendEmail as jest.Mock).mockResolvedValue("Email enviado");

      await returnRental(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.any(String),
          rentalDetails: expect.objectContaining({
            valorDanios: 0,
            valorDias: 3000,
            restante: 3700,
          }),
        })
      );
    });
  });
});
