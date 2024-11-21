import express from "express";
import { CarModel } from "../db/carsBd";

export const getAllCars = async (req: express.Request, res: express.Response) => {
  try {
    const cars = await CarModel.find().populate("tarifas");
    res.status(200).json(cars);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: "Error al obtener los carros" });
  }
};

export const getCarByPlaca = async (req: express.Request, res: express.Response) => {
  const { placa } = req.params;

  if (!placa) {
    res.status(400).json({ message: "No se ha proporcionado la placa" });
    return;
  }

  try {
    const car = await CarModel.findOne({ placa }).populate("tarifas");
    if (!car) {
      res.status(404).json({ message: "No se encontró el carro" });
      return;
    }
    res.status(200).json(car);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: "Error al obtener el carro" });
  }
};

export const createCar = async (req: express.Request, res: express.Response) => {
  try {
    const newCar = req.body;
    const car = await new CarModel(newCar).save();
    res.status(200).json(car);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: "Error al crear el carro" });
  }
};

export const deleteCar = async (req: express.Request, res: express.Response) => {
  const { placa } = req.params;
  if (!placa) {
    res.status(400).json({ message: "No se ha encontrado el placa" });
    return;
  }
  await CarModel.findOneAndUpdate({ placa }, { estado: "Eliminado" });
  res.status(200).json({ message: "El carro se elimino con éxito" });
};

export const updateCar = async (req: express.Request, res: express.Response) => {
  const { placa } = req.params;

  if (!placa) {
    res.status(400).json({ message: "Falta la placa" });
    return;
  }

  const { nombre, marca, modelo, anio, color, imagen, kilometraje, tipoCombustible, transmision, numeroAsientos, tarifas } = req.body;

  if (!nombre && !marca && !modelo && !anio && !color && !imagen && !kilometraje && !tipoCombustible && !transmision && !numeroAsientos && !tarifas) {
    res.status(400).json({ message: "No hay datos para actualizar" });
    return;
  }

  try {
    const car = await CarModel.findOne({ placa });

    if (!car) {
      res.status(404).json({ message: "No se ha encontrado el carro" });
      return;
    }

    if (nombre) car.nombre = nombre;
    if (marca) car.marca = marca;
    if (modelo) car.modelo = modelo;
    if (anio) car.anio = anio;
    if (color) car.color = color;
    if (imagen) car.imagen = imagen;
    if (kilometraje) car.kilometraje = kilometraje;
    if (tipoCombustible) car.tipoCombustible = tipoCombustible;
    if (transmision) car.transmision = transmision;
    if (numeroAsientos) car.numeroAsientos = numeroAsientos;

    if (tarifas) {
      if (!Array.isArray(tarifas)) {
        res.status(400).json({ message: "Las tarifas deben ser un arreglo de IDs válidos" });
        return;
      }
      car.tarifas = tarifas;
    }

    await car.save();

    res.status(200).json({ message: "El carro se actualizó con éxito", car });
  } catch (error) {
    console.error("Error al actualizar el carro:", error);
    res.status(500).json({ message: "Error al actualizar el carro" });
  }
};

export const updateCarStatus = async (req: express.Request, res: express.Response) => {
  const { placa } = req.params;
  const { estado } = req.body;

  if (!placa || !estado) {
    res.status(400).json({ message: "Falta la placa o el estado" });
    return;
  }

  const estadosValidos = ["Disponible", "Alquilado", "Eliminado", "Mantenimiento"];
  if (!estadosValidos.includes(estado)) {
    res.status(400).json({ message: "Estado inválido. Los valores válidos son: 'Disponible', 'Alquilado', 'Eliminado' o 'Mantenimiento'" });
    return;
  }

  try {
    const car = await CarModel.findOne({ placa });

    if (!car) {
      res.status(404).json({ message: "No se ha encontrado el carro" });
      return;
    }

    car.estado = estado;

    await car.save();

    res.status(200).json({ message: "Estado actualizado con éxito", car });
  } catch (error) {
    console.error("Error al actualizar el estado del carro:", error);
    res.status(500).json({ message: "Error al actualizar el estado del carro" });
  }
};
