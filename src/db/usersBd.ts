import mongoose from "mongoose";

//ESQUEMA DE USUARIO PARA LA BD

const UsersSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  cedula: {
    type: String,
    required: true,
    unique: true,
  },
  apellido: { type: String, required: true },
  direccion: { type: String, required: true },
  telefono: { type: String, required: true },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  authentication: {
    password: {
      type: String,
      required: true,
      select: false,
    },
    isTemporaryPassword: {
      type: Boolean,
      default: false,
    },
    salt: {
      type: String,
      select: false,
    },
    sessionToken: {
      type: String,
      select: false,
    },
  },
  isLoggedIn: {
    type: Boolean,
    default: false,
  },
  rol: {
    type: String,
    enum: ["admin", "empleado", "cliente"],
    default: "cliente",
  },
  estado: {
    type: String,
    enum: ["activo", "desactivado"],
    default: "activo",
  },
});

export const UserModel = mongoose.model("Usuarios", UsersSchema);

//? Métodos de selección

export const getUsers = () => UserModel.find();

export const getUserByEmail = (email: string) => UserModel.findOne({ email, estado: "activo" });

export const getUserBySessionToken = (sessionToken: string) =>
  UserModel.findOne({
    "authentication.sessionToken": sessionToken,
  });

export const getUserById = (id: string) => UserModel.findById(id);

export const getUserByCedula = (cedula: string) => UserModel.findOne({ cedula, estado: "activo" });

export const getUserByCedulaSinEstado = (cedula: string) => UserModel.findOne({ cedula });

//? Métodos de inserción

export const createUser = async (values: Record<string, any>) => {
  try {
    const user = await new UserModel(values).save();
    return user.toObject();
  } catch (error) {
    throw new Error("Error al crear el usuario");
  }
};

export const deleteUserByCedula = (cedula: string) => UserModel.findOneAndUpdate({ cedula }, { estado: "desactivado" });

export const updateUserByCedula = (cedula: string, values: Record<string, any>) => UserModel.findOneAndUpdate({ cedula }, values);
