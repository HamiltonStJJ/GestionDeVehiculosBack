import request from "supertest";
import app from "../index";
import { CarModel } from "../db/carsBd";

// Mock de la base de datos
jest.mock("../db/carsBd");

describe("API de Autos", () => {
  // Test para obtener todos los autos
  describe("GET /cars", () => {
    it("debería obtener todos los autos", async () => {
      (CarModel.find as jest.Mock).mockResolvedValueOnce([
        { placa: "ABC123", nombre: "Toyota" },
      ]);

      const response = await request(app).get("/cars");

      expect(response.status).toBe(200);
      expect(response.body).toEqual([{ placa: "ABC123", nombre: "Toyota" }]);
    });
  });

  // Test para obtener un auto por su placa
  describe("GET /cars/:placa", () => {
    it("debería obtener un auto por su placa", async () => {
      const placa = "ABC123";
      (CarModel.findOne as jest.Mock).mockResolvedValueOnce({
        placa,
        nombre: "Toyota",
      });

      const response = await request(app).get(`/cars/${placa}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ placa: "ABC123", nombre: "Toyota" });
    });
  });

  // Test para crear un nuevo auto
  describe("POST /cars", () => {
    it("debería crear un nuevo auto", async () => {
      const newCar = {
        placa: "DEF456",
        nombre: "Honda",
        marca: "Honda",
        modelo: "Civic",
        anio: 2020,
        color: "Rojo",
        tipoCombustible: "Gasolina",
        transmision: "Automatica",
      };
      
      (CarModel.prototype.save as jest.Mock).mockResolvedValueOnce(newCar);

      const response = await request(app).post("/cars").send(newCar);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(newCar);
    });
  });

  // Test para eliminar un auto por su placa
  describe("DELETE /cars/:placa", () => {
    it("debería eliminar un auto por su placa", async () => {
      const placa = "ABC123";
      (CarModel.findByIdAndUpdate as jest.Mock).mockResolvedValueOnce({ placa });

      const response = await request(app).delete(`/cars/${placa}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: "El carro se elimino con éxito" });
    });
  });

  // Test para actualizar un auto por su placa
  describe("PUT /cars/:placa", () => {
    it("debería actualizar un auto", async () => {
      const placa = "ABC123";
      const updatedData = { nombre: "Toyota Actualizado", color: "Azul" };
      (CarModel.findOne as jest.Mock).mockResolvedValueOnce({ placa });

      const response = await request(app).put(`/cars/${placa}`).send(updatedData);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("El carro se actualizo con éxito");
    });
  });
});