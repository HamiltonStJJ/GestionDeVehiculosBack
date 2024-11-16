import express from "express";
import { RateModel } from "../db/RatesBd";

export const getAllRates = async (req: express.Request, res: express.Response) => {
  try {
    const rates = await RateModel.find();
    res.status(200).json(rates);
    return;
  } catch (error) {
    res.status(400).json({ message: "Error al obtener las tarifas" });
    return;
  }
};

export const getRate = async (req: express.Request, res: express.Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ message: "No se envia el valor id" });
      return;
    }
    const rate = RateModel.findById(id);
    if (!rate) {
      res.status(404).json({ message: "No se encontró la tarifa" });
      return;
    }
    res.status(200).json(rate);
    return;
  } catch (error) {
    res.status(400).json({ message: "Error al obtener la tarifa" });
    return;
  }
};

export const createRate = async (req: express.Request, res: express.Response) => {
  try {
    const newRate = req.body;
    const rate = await new RateModel(newRate).save();
    res.status(200).json(rate.toObject());
  } catch (error) {
    res.status(400).json({ message: "Error al crear la tarifa" });
  }
};

export const deleteRate = async (req: express.Request, res: express.Response) => {
  const { id } = req.params;
  if (!id) {
    res.status(400).json({ message: "No se ha encontrado la tarifa" });
    return;
  }
  await RateModel.findByIdAndDelete(id);
  res.status(200).json({ message: "La tarifa se elimino con éxito" });
  return;
};

export const updateRate = async (req: express.Request, res: express.Response) => {
  const { id } = req.params;
  if (!id) {
    res.status(400).json({ message: "Falta el valor de id" });
    return;
  }
  const { tipoVehiculo, duracion, temporada, tarifa } = req.body;

  if (!tipoVehiculo && !duracion && !temporada && !tarifa) {
    res.status(400).json({ message: "No hay datos para actualizar " });
    return;
  }

  const rate = await RateModel.findById(id);

  if (!rate) {
    res.status(400).json({ message: "No se ha encontrado la tarifa" });
    return;
  }

  if (tipoVehiculo) rate.tipoVehiculo = tipoVehiculo;
  if (duracion) rate.duracion = duracion;
  if (temporada) rate.temporada = temporada;
  if (tarifa) rate.tarifa = tarifa;

  await rate.save();

  res.status(200).json({ message: "La tarifa se actualizo con éxito" });
  return;
};
