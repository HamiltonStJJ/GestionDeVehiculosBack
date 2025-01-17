import mongoose from "mongoose";

// Esquema para gestionar alquileres de autos
const RentalSchema = new mongoose.Schema({
  cliente: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Usuarios",
    required: true,
  },
  auto: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Carros",
    required: true,
  },
  fechaInicio: { type: Date, required: true },
  fechaFin: { type: Date, required: true },
  tarifaAplicada: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Tarifas",
    required: true,
  },
  estado: {
    type: String,
    enum: ["Pendiente", "En curso", "Finalizado", "Cancelado"],
    default: "Pendiente",
  },
  garantia: { type: Number, required: true },
  subtotal: { type: Number, required: true },
  fechaDevolucion: { type: Date, default: null },
  penalizacionPorDias: { type: Number, default: 0 },
  penalizacionPorDanios: { type: Number, default: 0 },
  piezasRevisadas: [
    {
      pieza: { type: String, required: true },
      estado: { type: String, enum: ["Correcto", "Dañado"], required: true },
      penalizacion: { type: Number, default: 0 },
    },
  ],
  total: { type: Number, required: false, default: 0 },
});

export const RentalModel = mongoose.model("Alquileres", RentalSchema);

// Métodos de selección
export const getAllRentals = () => RentalModel.find().populate("cliente auto tarifaAplicada");

export const getRentalById = (id: string) => RentalModel.findById(id).populate("cliente auto tarifaAplicada");

export const getRentalsByCliente = async (clienteId: string) => {
  try {
    return await RentalModel.find({ cliente: clienteId }).populate("auto tarifaAplicada cliente");
  } catch (error) {
    console.error("Error al buscar los alquileres por cliente:", error);
    throw new Error("Error al buscar los alquileres por cliente");
  }
};

// Métodos de inserción
export const createRental = (values: Record<string, any>) => new RentalModel(values).save();

// Métodos de actualización
export const updateRentalById = (id: string, values: Record<string, any>) => RentalModel.findByIdAndUpdate(id, values, { new: true });
