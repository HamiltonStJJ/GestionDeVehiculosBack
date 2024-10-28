import express from "express";
import { CarModel } from "db/carsBd";


export const getCars = () => CarModel.find();

export const getCarByPlaca = (placa: string) => CarModel.findOne({ placa });

export const getCarDisponibleByPlaca = (placa: string) =>
    CarModel.findOne({ placa, estado: "Dispobible" });

export const getCarVendido = (placa: string) =>
    CarModel.findOne({ placa, estado: "Vendido" });


export const createCar = async (values: Record<string, any>) => {
    try 
    {
        const car = await new CarModel(values).save();
        return car.toObject();
    } catch (error) 
    {
        throw new Error("Errorcito al crear un carrito :(");        
    }
}

export const deleteCar = (placa: string) =>
    CarModel.findByIdAndUpdate( placa, { estado: "Vendido" });

export const updateUser = (placa: string, values:Record<string, any>) =>
    CarModel.findByIdAndUpdate(placa, values);

export const getAllCars = async (
    response: express.Response
) => 
    {
        try 
        {
            const cars = await getCars();
            response.status(200).json(cars).end();
            return;   
        } catch (error) {
            response.sendStatus(400);
            return;
        }
    }
