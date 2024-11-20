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
    const { _id } = req.params;
    const { fecha, descripcion } = req.body;

    if (!_id || (fecha === undefined && descripcion === undefined)) {
      res.status(400).json({ message: "Falta el ID o los datos para actualizar" });
    }

    const updateFields: any = {};
    if (fecha) updateFields["mantenimientos.$.fecha"] = new Date(fecha);
    if (descripcion) updateFields["mantenimientos.$.descripcion"] = descripcion;

    const updatedCar = await CarModel.findOneAndUpdate({ "mantenimientos._id": _id }, { $set: updateFields }, { new: true });

    if (!updatedCar) {
      res.status(404).json({ message: "No se encontró el mantenimiento con el ID proporcionado" });
    }

    res.status(200).json({
      message: "Mantenimiento actualizado con éxito",
      mantenimientos: updatedCar.mantenimientos,
    });
  } catch (error) {
    console.error("Error al actualizar mantenimiento:", error);
    res.status(500).json({ message: "Error al actualizar mantenimiento" });
  }
};

export const deleteMaintenance = async (req: express.Request, res: express.Response) => {
  try {
    const { _id } = req.params;

    if (!_id) {
      res.status(400).json({ message: "Falta el ID del mantenimiento a eliminar" });
    }

    const updatedCar = await CarModel.findOneAndUpdate({ "mantenimientos._id": _id }, { $pull: { mantenimientos: { _id } } }, { new: true });

    if (!updatedCar) {
      res.status(404).json({ message: "No se encontró el mantenimiento con el ID proporcionado" });
    }

    res.status(200).json({
      message: "Mantenimiento eliminado con éxito",
      mantenimientos: updatedCar.mantenimientos,
    });
  } catch (error) {
    console.error("Error al eliminar mantenimiento:", error);
    res.status(500).json({ message: "Error al eliminar mantenimiento" });
  }
};
