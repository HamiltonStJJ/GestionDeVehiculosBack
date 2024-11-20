import express from "express";
import { createRental, getAllRentals, getRentalById, getRentalsByCliente, updateRentalById, cancelRentalById } from "../db/rentalsBd";
import { CarModel } from "../db/carsBd";
import { getUserById } from "../db/usersBd";

export const create = async (req: express.Request, res: express.Response) => {
  try {
    const { cliente, auto, fechaInicio, fechaFin, tarifaAplicada, total } = req.body;

    if (!cliente || !auto || !fechaInicio || !fechaFin || !tarifaAplicada || !total) {
      res.status(400).json({ message: "Faltan datos obligatorios" });
      return;
    }

    const clienteData = await getUserById(cliente);
    const autoData = await CarModel.findById(auto);

    if (!clienteData) {
      res.status(404).json({ message: "Cliente no encontrado" });
      return;
    }

    if (!autoData || autoData.estado !== "Disponible") {
      res.status(404).json({ message: "El vehículo no está disponible" });
      return;
    }

    const newRental = await createRental({
      cliente,
      auto,
      fechaInicio: new Date(fechaInicio),
      fechaFin: new Date(fechaFin),
      tarifaAplicada,
      total,
    });

    autoData.estado = "Alquilado";
    await autoData.save();

    res.status(201).json(newRental);
  } catch (error) {
    console.error("Error al crear el alquiler:", error);
    res.status(500).json({ message: "Error al crear el alquiler" });
  }
};

export const getRentals = async (req: express.Request, res: express.Response) => {
  try {
    const rentals = await getAllRentals();
    res.status(200).json(rentals);
  } catch (error) {
    console.error("Error al obtener los alquileres:", error);
    res.status(500).json({ message: "Error al obtener los alquileres" });
  }
};

export const getRental = async (req: express.Request, res: express.Response) => {
  try {
    const { id } = req.params;

    const rental = await getRentalById(id);

    if (!rental) {
      res.status(404).json({ message: "Alquiler no encontrado" });
      return;
    }

    res.status(200).json(rental);
  } catch (error) {
    console.error("Error al obtener el alquiler:", error);
    res.status(500).json({ message: "Error al obtener el alquiler" });
  }
};

export const cancelRental = async (req: express.Request, res: express.Response) => {
  try {
    const { id } = req.params;

    const rental = await cancelRentalById(id);

    if (!rental) {
      res.status(404).json({ message: "Alquiler no encontrado" });
      return;
    }

    const auto = await CarModel.findById(rental.auto);
    if (auto) {
      auto.estado = "Disponible";
      await auto.save();
    }

    res.status(200).json({ message: "Alquiler cancelado con éxito" });
  } catch (error) {
    console.error("Error al cancelar el alquiler:", error);
    res.status(500).json({ message: "Error al cancelar el alquiler" });
  }
};

export const updateRental = async (req: express.Request, res: express.Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updatedRental = await updateRentalById(id, updates);

    if (!updatedRental) {
      res.status(404).json({ message: "Alquiler no encontrado" });
      return;
    }

    res.status(200).json(updatedRental);
  } catch (error) {
    console.error("Error al actualizar el alquiler:", error);
    res.status(500).json({ message: "Error al actualizar el alquiler" });
  }
};

export const getRentalsByClient = async (req: express.Request, res: express.Response) => {
  try {
    const { clienteId } = req.params;

    if (!clienteId) {
      res.status(400).json({ message: "El ID del cliente es obligatorio" });
      return;
    }

    const rentals = await getRentalsByCliente(clienteId);

    if (!rentals || rentals.length === 0) {
      res.status(404).json({ message: "No se encontraron alquileres para este cliente" });
      return;
    }

    res.status(200).json(rentals);
  } catch (error) {
    console.error("Error al obtener los alquileres del cliente:", error);
    res.status(500).json({ message: "Error al obtener los alquileres del cliente" });
  }
};
