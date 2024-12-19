import express from "express";
import { createRental, getAllRentals, getRentalById, getRentalsByCliente, updateRentalById, RentalModel } from "../db/rentalsBd";
import { CarModel } from "../db/carsBd";
import { getUserById } from "../db/usersBd";
import { piezaPenalizaciones } from "../helpers/damagedParts";

export const createByEmployee = async (req: express.Request, res: express.Response) => {
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

    if (!autoData) {
      res.status(404).json({ message: "El vehículo no se encuentra en" });
      return;
    }

    const conflictingRentals = await RentalModel.find({
      auto,
      $or: [
        {
          fechaInicio: { $lte: new Date(fechaFin) },
          fechaFin: { $gte: new Date(fechaInicio) },
        },
      ],
      estado: { $in: ["En curso", "Pendiente"] },
    });

    if (conflictingRentals.length > 0) {
      res.status(400).json({ message: "El vehículo no está disponible en las fechas seleccionadas" });
      return;
    }

    const newRental = await createRental({
      cliente,
      auto,
      fechaInicio: new Date(fechaInicio),
      fechaFin: new Date(fechaFin),
      tarifaAplicada,
      estado: "En curso",
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

export const createByClient = async (req: express.Request, res: express.Response) => {
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

    if (!autoData) {
      res.status(404).json({ message: "Vehículo no encontrado" });
      return;
    }

    const conflictingRentals = await RentalModel.find({
      auto,
      $or: [
        {
          fechaInicio: { $lte: new Date(fechaFin) },
          fechaFin: { $gte: new Date(fechaInicio) },
        },
      ],
      estado: { $in: ["En curso", "Pendiente"] },
    });

    if (conflictingRentals.length > 0) {
      res.status(400).json({ message: "El vehículo no está disponible en las fechas seleccionadas" });
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

    res.status(201).json(newRental);
  } catch (error) {
    res.status(500).json({ message: "Error al crear el alquiler" });
  }
};

export const setStatusRental = async (req: express.Request, res: express.Response) => {
  const { id } = req.params;
  try {
    const rental = await RentalModel.findById(id);
    if (!rental) {
      res.status(404).json({ message: "No se encontró el alquiler" });
      return;
    }

    if (rental.estado !== "Pendiente") {
      res.status(400).json({ message: "El alquiler no está en estado pendiente" });
      return;
    }

    const auto = await CarModel.findById(rental.auto);
    if (!auto) {
      res.status(404).json({ message: "No se encontró el vehículo" });
      return;
    }

    auto.estado = "Alquilado";
    await auto.save();

    rental.estado = "En curso";
    await rental.save();

    res.status(200).json({ message: "El alquiler se ha actualizado con éxito" });
  } catch (error) {
    console.error("Error al obtener el alquiler:", error);
    res.status(500).json({ message: "Error al obtener el alquiler" });
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

export const updateRentalStatus = async (req: express.Request, res: express.Response) => {
  const { id } = req.params;
  const { estado } = req.body;

  try {
    if (!["cancelado", "finalizado"].includes(estado)) {
      res.status(400).json({ error: "Estado inválido. Usa 'cancelado' o 'finalizado'." });
      return;
    }

    const rental = await RentalModel.findByIdAndUpdate(id, { estado }, { new: true });

    if (!rental) {
      res.status(404).json({ error: "No se encontró la renta especificada." });
      return;
    }

    const auto = await CarModel.findById(rental.auto);
    if (auto) {
      auto.estado = "Disponible";
      await auto.save();
    }

    res.status(200).json({ message: "Estado de la renta actualizado exitosamente.", rental });
  } catch (error) {
    console.error("Error al actualizar el estado de la renta:", error);
    res.status(500).json({ error: "Ocurrió un error al actualizar el estado de la renta." });
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

export const returnRental = async (req: express.Request, res: express.Response) => {
  type Piezas = keyof typeof piezaPenalizaciones;
  const { id } = req.params;
  const { piezasRevisadas }: { piezasRevisadas: { pieza: Piezas; estado: "Correcto" | "Dañado" }[] } = req.body;

  try {
    const rental = await RentalModel.findById(id);
    if (!rental) {
      res.status(404).json({ message: "Alquiler no encontrado" });
      return;
    }

    if (rental.estado !== "En curso") {
      res.status(400).json({ message: "El vehículo ya fue devuelto o no está en uso." });
      return;
    }

    const auto = await CarModel.findById(rental.auto);
    if (!auto) {
      res.status(404).json({ message: "Vehículo no encontrado" });
      return;
    }

    let penalizacionTotal = 0;

    const piezasActualizadas = piezasRevisadas.map((pieza) => {
      let penalizacionPorPieza = 0;

      if (pieza.estado === "Dañado") {
        const porcentaje = piezaPenalizaciones[pieza.pieza] || 0;
        penalizacionPorPieza = (auto.valor * porcentaje) / 100;
        penalizacionTotal += penalizacionPorPieza;
      }

      return {
        pieza: pieza.pieza,
        estado: pieza.estado,
        penalizacion: penalizacionPorPieza,
      };
    });

    rental.set("piezasRevisadas", piezasActualizadas);

    rental.fechaDevolucion = new Date();
    rental.penalizacionPorDanios = penalizacionTotal;
    rental.estado = "Finalizado";
    rental.total += penalizacionTotal;

    await rental.save();

    res.status(200).json({
      message: "Vehículo devuelto exitosamente",
      rental,
      penalizacionTotal,
    });
  } catch (error) {
    console.error("Error al procesar la devolución del vehículo:", error);
    res.status(500).json({ message: "Error al procesar la devolución" });
  }
};
