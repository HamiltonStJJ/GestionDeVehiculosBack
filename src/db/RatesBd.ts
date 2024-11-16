import mongoose from "mongoose";

const rateSchema = new mongoose.Schema({
  tipoVehiculo: { type: String, required: true },
  duracion: { type: String, enum: ["Diario", "Semanal", "Mensual"], required: true },
  temporada: { type: String, enum: ["Alta", "Media", "Baja"], required: true },
  tarifa: { type: Number, required: true },
});

export const RateModel = mongoose.model("Tarifas", rateSchema);
