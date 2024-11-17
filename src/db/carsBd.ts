import mongoose from "mongoose";

//ESQUEMA PARA LOS CARROS EN LA BD
const CarSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  marca: { type: String, required: true },
  modelo: { type: String, required: true },
  anio: { type: Number, required: true },
  color: { type: String, required: true },
  imagen: { type: String, required: true },
  placa: { type: String, required: true },
  kilometraje: { type: Number, default: 0 },
  tipoCombustible: {
    type: String,
    enum: ["Gasolina", "Diesel", "Hibrido", "Electrico"],
    required: true,
  },
  transmision: {
    type: String,
    enum: ["Manual", "Automatica"],
    required: true,
  },
  numeroPuertas: { type: Number, default: 4 },
  estado: {
    type: String,
    enum: ["Disponible", "Alquilado", "Eliminado"],
    default: "Disponible",
  },
  UltimoChequeo: { type: Date, required: false },
  tarifas: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tarifas",
    },
  ],
  mantenimientos: [
    {
      fecha: { type: Date, required: true },
      descripcion: { type: String, required: true },
    },
  ],
});

export const CarModel = mongoose.model("Carros", CarSchema);
