import express from "express";
import { CarModel } from "../db/carsBd";


export const getAllCars = async (req: express.Request,res: express.Response) => 
{
  try {
    const cars = await CarModel.find();
    res.status(200).json(cars).end();
    return;
  } catch (error) {
    console.log(error.getMessage());
    res.status(400).json({ message: "Error al obtener los carros" });
    return;
  }
};

export const getCarByPlaca = (req: express.Request, res: express.Response) => {
  const { placa } = req.params;
  if (!placa) {
    res.status(400).json({ message: "No se hay placa" });
    return;
  }
  const car = CarModel.findOne({ placa });
  if (!car) {
    res.status(404).json({ message: "No se encontró el carro" });
    return;
  }
  res.status(200).json(car);
  return;
};

export const createCar = async (req: express.Request,res: express.Response) => 
{
  try {
    const newCar = req.body;
    const car = await new CarModel(newCar).save();
    res.status(200).json(car.toObject());
  } catch (error) {
    res.status(400).json({ message: "Error al crear el carro" });
  }
};

export const deleteCar = async (req: express.Request,res: express.Response) => 
{
  const { placa } = req.params;
  if (!placa) {
    res.status(400).json({ message: "No se ha encontrado el placa" });
    return;
  }
  await CarModel.findByIdAndUpdate(placa, { estado: "Alquilado" });
  res.status(200).json({ message: "El carro se elimino con éxito" });
};

export const updateUser = async (req: express.Request,res: express.Response) => 
{
  const { placa } = req.params;
  if (!placa) {
    res.status(400).json({ message: "Falta la placa" });
    return;
  }
  const {nombre,marca,modelo,anio,color,imagen,kilometrage,tipoCombustible,} = req.body;

  if (!nombre && !marca && !modelo && !anio && !color && !imagen && !kilometrage && !tipoCombustible) 
    {
      res.status(400).json({ message: "No hay datos para actualizar " });
      return;
    }

  const car = await CarModel.findOne({ placa });

  if (!car) 
    {
      res.status(400).json({ message: "No se ha encontrado el carro" });
      return;
    }

  if (nombre) car.nombre = nombre;
  if (marca) car.marca = marca;
  if (modelo) car.modelo = modelo;
  if (anio) car.anio = anio;
  if (color) car.color = color;
  if (imagen) car.imagen = imagen;
  if (kilometrage) car.kilometrage = kilometrage;
  if (tipoCombustible) car.tipoCombustible = tipoCombustible;

  await car.save();

  res.status(200).json({ message: "El carro se actualizo con éxito" });
  return;
};
