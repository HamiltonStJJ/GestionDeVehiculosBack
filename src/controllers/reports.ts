import express from "express";
import { RentalModel } from "../db/rentalsBd";
import { CarModel } from "../db/carsBd";

const getDateFilter = (period: string, startDate?: string, endDate?: string) => {
  const now = new Date();
  switch (period) {
    case "diario":
      return { fechaInicio: { $gte: new Date(now.setHours(0, 0, 0, 0)), $lte: now } };
    case "semanal":
      const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
      return { fechaInicio: { $gte: startOfWeek, $lte: now } };
    case "mensual":
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      return { fechaInicio: { $gte: startOfMonth, $lte: now } };
    case "rango":
      if (startDate && endDate) {
        return { fechaInicio: { $gte: new Date(startDate), $lte: new Date(endDate) } };
      }
      throw new Error("Debe proporcionar startDate y endDate para el rango de fechas");
    default:
      throw new Error("Periodo no válido");
  }
};

export const getRentalReports = async (req: express.Request, res: express.Response) => {
  try {
    const { period, startDate, endDate } = req.query;

    if (!period) {
      res.status(400).json({ message: "Debes proporcionar un periodo válido (diario, semanal, mensual, rango)." });
      return;
    }

    const dateFilter = getDateFilter(period as string, startDate as string, endDate as string);

    const rentals = await RentalModel.find(dateFilter).populate({ path: "auto", model: CarModel, select: "nombre marca modelo placa estadoActual kilometraje" }).populate({ path: "cliente", select: "nombre" }).populate("tarifaAplicada");

    const report = {
      rangoFechas: dateFilter.fechaInicio,
      rentas: [] as {
        _id: string;
        cliente: string;
        auto: string;
        fechaInicio: Date;
        fechaFin: Date;
        estado: string;
        diasAlquilado: number;
        subtotal: number;
        penalizacion: number;
        total: number;
      }[],
      totales: {
        cantidadRentas: rentals.length,
        ingresosTotales: 0,
        penalizacionesTotales: 0,
        diasTotalesAlquilados: 0,
        promedioIngresoPorRenta: 0,
        rentasPendientes: rentals.filter((r) => r.estado === "Pendiente").length,
        rentasFinalizadas: rentals.filter((r) => r.estado === "Finalizado").length,
        rentasCanceladas: rentals.filter((r) => r.estado === "Cancelado").length,
      },
    };

    for (const rental of rentals) {
      const diasAlquilado = Math.ceil((new Date(rental.fechaFin).getTime() - new Date(rental.fechaInicio).getTime()) / (1000 * 60 * 60 * 24));

      report.rentas.push({
        _id: rental._id.toString(),
        cliente: (rental.cliente as any)?.nombre || "Desconocido",
        auto: (rental.auto as any)?.nombre || "Desconocido",
        fechaInicio: rental.fechaInicio,
        fechaFin: rental.fechaFin,
        estado: rental.estado,
        diasAlquilado,
        subtotal: rental.subtotal,
        penalizacion: rental.penalizacionPorDias + rental.penalizacionPorDanios,
        total: rental.total,
      });

      report.totales.ingresosTotales += rental.total;
      report.totales.penalizacionesTotales += rental.penalizacionPorDias + rental.penalizacionPorDanios;
      report.totales.diasTotalesAlquilados += diasAlquilado;
    }

    report.totales.promedioIngresoPorRenta = report.totales.cantidadRentas > 0 ? report.totales.ingresosTotales / report.totales.cantidadRentas : 0;

    res.status(200).json(report);
  } catch (error) {
    console.error("Error generando el reporte de rentas:", error);
    res.status(500).json({ message: "Error generando el reporte de rentas." });
  }
};

export const getCarReports = async (req: express.Request, res: express.Response) => {
  try {
    const { period, startDate, endDate } = req.query;

    if (!period) {
      res.status(400).json({ message: "Debes proporcionar un periodo válido (diario, semanal, mensual, rango)." });
      return;
    }

    const dateFilter = getDateFilter(period as string, startDate as string, endDate as string);

    const cars = await CarModel.find();

    const report = {
      rangoFechas: dateFilter.fechaInicio,
      autos: [] as {
        _id: string;
        nombre: string;
        marca: string;
        modelo: string;
        placa: string;
        estadoActual: string;
        kilometraje: number;
        ingresosGenerados: number;
        frecuenciaAlquiler: number;
        diasAlquilado: number;
        promedioDiarioIngreso: number;
      }[],
      totales: {
        autosAlquilados: 0,
        ingresosTotales: 0,
        diasTotalesAlquilados: 0,
        promedioIngresoPorAuto: 0,
        autosEnMantenimiento: cars.filter((car) => car.estado === "Mantenimiento").length,
      },
    };

    for (const car of cars) {
      const rentals = await RentalModel.find({
        auto: car._id,
        ...dateFilter,
      });

      let ingresosGenerados = 0;
      let diasAlquilado = 0;

      rentals.forEach((rental) => {
        ingresosGenerados += rental.total;
        const days = Math.ceil((new Date(rental.fechaFin).getTime() - new Date(rental.fechaInicio).getTime()) / (1000 * 60 * 60 * 24));
        diasAlquilado += days;
      });

      report.autos.push({
        _id: car._id.toString(),
        nombre: car.nombre,
        marca: car.marca,
        modelo: car.modelo,
        placa: car.placa,
        estadoActual: car.estado,
        kilometraje: car.kilometraje,
        ingresosGenerados,
        frecuenciaAlquiler: rentals.length,
        diasAlquilado,
        promedioDiarioIngreso: diasAlquilado > 0 ? ingresosGenerados / diasAlquilado : 0,
      });

      if (rentals.length > 0) report.totales.autosAlquilados++;
      report.totales.ingresosTotales += ingresosGenerados;
      report.totales.diasTotalesAlquilados += diasAlquilado;
    }

    report.totales.promedioIngresoPorAuto = report.autos.length > 0 ? report.totales.ingresosTotales / report.autos.length : 0;

    res.status(200).json(report);
  } catch (error) {
    console.error("Error generando el reporte de autos:", error);
    res.status(500).json({ message: "Error generando el reporte de autos." });
  }
};
