import express from "express";
import { getAllRentals, getRentalById, getRentalsByCliente, updateRentalById, RentalModel } from "../db/rentalsBd";
import { CarModel } from "../db/carsBd";
import { getUserById } from "../db/usersBd";
import { piezaPenalizaciones } from "../helpers/damagedParts";
import { createPayment } from "./payments";
import { RateModel } from "../db/RatesBd";

export const createByEmployee = async (req: express.Request, res: express.Response) => {
  try {
    const { cliente, auto, fechaInicio, fechaFin, tarifaAplicada } = req.body;

    if (!cliente || !auto || !fechaInicio || !fechaFin || !tarifaAplicada) {
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

    const valorTarifa = await RateModel.findById(tarifaAplicada);
    const subtotal = valorTarifa.tarifa * Math.ceil((new Date(fechaFin).getTime() - new Date(fechaInicio).getTime()) / (1000 * 60 * 60 * 24));

    const garantia = subtotal * 0.3;

    const datosRenta = { cliente, auto, fechaInicio: new Date(fechaInicio), fechaFin: new Date(fechaFin), tarifaAplicada, estado: "En curso", subtotal, garantia };

    const responsePayment = await createPayment(garantia, "USD", `Pago inicial por el alquiler del vehículo ${autoData.nombre}`, datosRenta);

    if (!responsePayment) {
      res.status(500).json({ message: "Error al procesar el pago" });
      return;
    }

    res.status(200).json(responsePayment.links[1].href);
  } catch (error) {
    console.error("Error al crear el alquiler:", error);
    res.status(500).json({ message: "Error al crear el alquiler" });
  }
};

export const createByClient = async (req: express.Request, res: express.Response) => {
  try {
    const { cliente, auto, fechaInicio, fechaFin, tarifaAplicada } = req.body;

    if (!cliente || !auto || !fechaInicio || !fechaFin || !tarifaAplicada) {
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

    const valorTarifa = await RateModel.findById(tarifaAplicada);
    const subtotal = valorTarifa.tarifa * Math.ceil((new Date(fechaFin).getTime() - new Date(fechaInicio).getTime()) / (1000 * 60 * 60 * 24));

    const garantia = subtotal * 0.3;

    const datosRenta = { cliente, auto, fechaInicio: new Date(fechaInicio), fechaFin: new Date(fechaFin), tarifaAplicada, estado: "Pendiente", subtotal, garantia };

    const createRental = await RentalModel.create(datosRenta);

    res.status(200).json(createRental);
  } catch (error) {
    console.error("Error al crear el alquiler:", error);
    res.status(500).json({ message: "Error al crear el alquiler" });
  }
};

export const setAuthorized = async (req: express.Request, res: express.Response) => {
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

    const datosRentaID = { _id: rental._id, estado: rental.estado, auto: rental.auto };

    const responsePayment = await createPayment(rental.garantia, "USD", `Pago inicial por el alquiler del vehículo ${auto.nombre}`, datosRentaID);

    if (!responsePayment) {
      res.status(500).json({ message: "Error al procesar el pago" });
      return;
    }
    res.status(200).json(responsePayment.links[1].href);
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
    if (!["Cancelado", "Finalizado"].includes(estado)) {
      res.status(400).json({ error: "Estado inválido. Usa 'Cancelado' o 'Finalizado'." });
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

    let valorDanios = 0;

    const piezasActualizadas = piezasRevisadas.map((pieza) => {
      let penalizacionPorPieza = 0;

      if (pieza.estado === "Dañado") {
        const porcentaje = piezaPenalizaciones[pieza.pieza] || 0;
        penalizacionPorPieza = (auto.valor * porcentaje) / 100;
        valorDanios += penalizacionPorPieza;
      }

      return {
        pieza: pieza.pieza,
        estado: pieza.estado,
        penalizacion: penalizacionPorPieza,
      };
    });

    let valorDias = 0;

    const fechaDevolucionEsperada = rental.fechaFin;
    const fechaDevolucionActual = new Date();
    const diferenciaDias = Math.ceil((fechaDevolucionActual.getTime() - fechaDevolucionEsperada.getTime()) / (1000 * 60 * 60 * 24));
    let penalizacionPorDiasExtra = 0;

    if (diferenciaDias > 0) {
      const costoPorDiaExtra = auto.valor * 0.05;
      penalizacionPorDiasExtra = diferenciaDias * costoPorDiaExtra;
      valorDias += penalizacionPorDiasExtra;
    }

    const restante = rental.subtotal + valorDanios + valorDias - rental.garantia;

    const datosDevolucion = {
      idDevolucion: id,
      piezasRevisadas: piezasActualizadas,
      fechaDevolucion: fechaDevolucionActual,
      valorDanios: valorDanios,
      valorDias: valorDias,
      estado: "Finalizado",
      total: rental.subtotal + valorDanios + valorDias,
    };

    const responsePayment = await createPayment(restante, "USD", `Pago final por el alquiler del vehículo ${auto.nombre}`, datosDevolucion);

    if (!responsePayment) {
      res.status(500).json({ message: "Error al procesar el pago" });
      return;
    }
    res.status(200).json(responsePayment.links[1].href);
  } catch (error) {
    console.error("Error al procesar la devolución del vehículo:", error);
    res.status(500).json({ message: "Error al procesar la devolución" });
  }
};
