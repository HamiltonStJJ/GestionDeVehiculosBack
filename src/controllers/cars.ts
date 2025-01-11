import express from "express";
import { CarModel } from "../db/carsBd";
import { RentalModel } from "../db/rentalsBd";

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
    const existe = await CarModel.findOne({ placa: newCar.placa });

    if (existe) {
      res.status(400).json({ message: "El carro ya existe" });
      return;
    }

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
    res.status(400).json({ message: "No se ha proporcionado la placa" });
    return;
  }

  try {
    const car = await CarModel.findOne({ placa });

    if (!car) {
      res.status(404).json({ message: "Carro no encontrado" });
      return;
    }

    if (car.estado === "Alquilado") {
      res.status(400).json({ message: "No se puede eliminar un carro en estado 'Alquilado'" });
      return;
    }

    await CarModel.findOneAndUpdate({ placa }, { estado: "Eliminado" });
    res.status(200).json({ message: "El carro se eliminó con éxito" });
  } catch (error) {
    console.error("Error al eliminar el carro:", error);
    res.status(400).json({ message: "Error al eliminar el carro" });
  }
};

export const updateCar = async (req: express.Request, res: express.Response) => {
  const { placa } = req.params;

  if (!placa) {
    res.status(400).json({ message: "Falta la placa" });
    return;
  }

  const { nombre, marca, modelo, anio, color, imagen, kilometraje, tipoCombustible, transmision, numeroAsientos, tarifas, UltimoChequeo, estado } = req.body;

  if (!nombre && !marca && !modelo && !anio && !color && !imagen && !kilometraje && !tipoCombustible && !transmision && !numeroAsientos && !tarifas && !UltimoChequeo && !estado) {
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
    if (UltimoChequeo) car.UltimoChequeo = UltimoChequeo;

    const estadosValidos = ["Disponible", "Alquilado", "Eliminado", "Mantenimiento"];
    if (!estadosValidos.includes(estado)) {
      res.status(400).json({ message: "Estado inválido. Los valores válidos son: 'Disponible', 'Alquilado', 'Eliminado' o 'Mantenimiento'" });
      return;
    }

    if (estado) car.estado = estado;

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

export const getCarsByStateAndDate = async (req: express.Request, res: express.Response) => {
  try {
    const { fechaInicio, fechaFin, estado } = req.query;

    if (!fechaInicio || !fechaFin) {
      res.status(400).json({ message: "Los parámetros 'fechaInicio' y 'fechaFin' son obligatorios." });
    }

    const fechaInicioDate = new Date(fechaInicio as string);
    const fechaFinDate = new Date(fechaFin as string);
    fechaFinDate.setHours(23, 59, 59, 999);

    if (isNaN(fechaInicioDate.getTime()) || isNaN(fechaFinDate.getTime())) {
      res.status(400).json({ message: "Las fechas proporcionadas no son válidas." });
    }

    const estadoFiltro = estado ? (estado as string).split(",") : ["Disponible", "Alquilado"];

    const rentedCars = await RentalModel.find({
      $and: [{ fechaInicio: { $lt: fechaFinDate } }, { fechaFin: { $gt: fechaInicioDate } }, { estado: { $in: ["En curso"] } }],
    })
      .populate("auto")
      .distinct("auto");

    let cars;
    if (estadoFiltro.includes("Disponible")) {
      cars = await CarModel.find({
        _id: { $nin: rentedCars },
        // estado: "Disponible",
      }).populate("tarifas");
    } else if (estadoFiltro.includes("Alquilado")) {
      cars = await CarModel.find({
        _id: { $in: rentedCars },
      }).populate("tarifas");
    } else {
      res.status(400).json({ message: "El parámetro 'estado' debe ser 'Disponible' o 'Alquilado'." });
    }

    res.status(200).json(cars);
  } catch (error) {
    console.error("Error al obtener los autos:", error);
    res.status(500).json({ message: "Error al obtener los autos." });
  }
};
