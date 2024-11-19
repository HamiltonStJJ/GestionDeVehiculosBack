import express from "express";
import { CarModel } from "../db/carsBd";

export const getMaintenance = async (req: express.Request, res: express.Response) => {
  try {
    const { placa } = req.params;
    const car = await CarModel.findOne({ placa });

    if (!car) {
      res.status(404).json({ message: "El vehículo no existe" });
    }

    res.status(200).json({ mantenimientos: car.mantenimientos });
  } catch (error) {
    console.error("Error al obtener mantenimientos:", error);
    res.status(500).json({ message: "Error al obtener mantenimientos" });
  }
};

export const addMaintenance = async (req: express.Request, res: express.Response) => {
  try {
    const { placa } = req.params;
    const { fecha, descripcion } = req.body;

    if (!fecha || !descripcion) {
      res.status(400).json({ message: "La fecha y descripción son obligatorias" });
    }

    const car = await CarModel.findOne({ placa });

    if (!car) {
      res.status(404).json({ message: "El vehículo no existe" });
    }

    car.mantenimientos.push({ fecha: new Date(fecha), descripcion });
    await car.save();

    res.status(200).json({ message: "Mantenimiento agregado con éxito", mantenimientos: car.mantenimientos });
  } catch (error) {
    console.error("Error al agregar mantenimiento:", error);
    res.status(500).json({ message: "Error al agregar mantenimiento" });
  }
};

export const updateMaintenance = async (req: express.Request, res: express.Response) => {
  try {
    const { placa } = req.params;
    const { index, fecha, descripcion } = req.body;

    if (index === undefined || (fecha === undefined && descripcion === undefined)) {
      res.status(400).json({ message: "Falta el índice o los datos para actualizar" });
    }

    const car = await CarModel.findOne({ placa });

    if (!car) {
      res.status(404).json({ message: "El vehículo no existe" });
    }

    if (index < 0 || index >= car.mantenimientos.length) {
      res.status(400).json({ message: "Índice de mantenimiento no válido" });
    }

    if (fecha) car.mantenimientos[index].fecha = new Date(fecha);
    if (descripcion) car.mantenimientos[index].descripcion = descripcion;

    await car.save();

    res.status(200).json({ message: "Mantenimiento actualizado con éxito", mantenimientos: car.mantenimientos });
  } catch (error) {
    console.error("Error al actualizar mantenimiento:", error);
    res.status(500).json({ message: "Error al actualizar mantenimiento" });
  }
};

export const deleteMaintenance = async (req: express.Request, res: express.Response) => {
  try {
    const { placa } = req.params;
    const { index } = req.body;

    if (index === undefined) {
      res.status(400).json({ message: "Falta el índice del mantenimiento a eliminar" });
    }

    const car = await CarModel.findOne({ placa });

    if (!car) {
      res.status(404).json({ message: "El vehículo no existe" });
    }

    if (index < 0 || index >= car.mantenimientos.length) {
      res.status(400).json({ message: "Índice de mantenimiento no válido" });
    }

    car.mantenimientos.splice(index, 1);
    await car.save();

    res.status(200).json({ message: "Mantenimiento eliminado con éxito", mantenimientos: car.mantenimientos });
  } catch (error) {
    console.error("Error al eliminar mantenimiento:", error);
    res.status(500).json({ message: "Error al eliminar mantenimiento" });
  }
};
