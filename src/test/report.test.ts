import { getRentalReports, getCarReports } from "../controllers/reports";
import { RentalModel } from "../db/rentalsBd";
import { CarModel } from "../db/carsBd";
import { Response } from "express";

jest.mock("../db/rentalsBd");
jest.mock("../db/carsBd");

describe("Report Controllers", () => {
  const mockRequest = (query: Record<string, string>) =>
    ({
      query,
    } as any);

  const mockResponse = () => {
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;
    return res;
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getRentalReports", () => {
    it("debería devolver un error 400 si no se proporciona el periodo", async () => {
      const req = mockRequest({});
      const res = mockResponse();

      await getRentalReports(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Debes proporcionar un periodo válido (diario, semanal, mensual, rango).",
      });
    });
  });

  describe("getCarReports", () => {
    it("debería devolver un error 400 si no se proporciona el periodo", async () => {
      const req = mockRequest({});
      const res = mockResponse();

      await getCarReports(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Debes proporcionar un periodo válido (diario, semanal, mensual, rango).",
      });
    });

    it("debería devolver un reporte de autos correctamente", async () => {
      const req = mockRequest({ period: "mensual" });
      const res = mockResponse();

      (CarModel.find as jest.Mock).mockResolvedValue([
        {
          _id: "car123",
          nombre: "Toyota Corolla",
          marca: "Toyota",
          modelo: "2020",
          placa: "ABC-123",
          estado: "Disponible",
          kilometraje: 15000,
        },
      ]);

      (RentalModel.find as jest.Mock).mockResolvedValue([
        {
          auto: "car123",
          fechaInicio: new Date("2024-01-01"),
          fechaFin: new Date("2024-01-05"),
          total: 400,
        },
      ]);

      await getCarReports(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        rangoFechas: expect.any(Object),
        autos: [
          {
            _id: "car123",
            nombre: "Toyota Corolla",
            marca: "Toyota",
            modelo: "2020",
            placa: "ABC-123",
            estadoActual: "Disponible",
            kilometraje: 15000,
            ingresosGenerados: 400,
            frecuenciaAlquiler: 1,
            diasAlquilado: 4,
            promedioDiarioIngreso: 100,
          },
        ],
        totales: {
          autosAlquilados: 1,
          ingresosTotales: 400,
          diasTotalesAlquilados: 4,
          promedioIngresoPorAuto: 400,
          autosEnMantenimiento: 0,
        },
      });
    });
  });
});
