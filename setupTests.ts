import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

beforeAll(async () => {
  const url = process.env.URL_MONGODB;

  if (!url) {
    throw new Error("La variable de entorno URL_MONGODB no está definida.");
  }

  await mongoose
    .connect(url)
    .then(() => console.log("Conectado a MongoDB para test"))
    .catch((error: Error) => {
      console.error("Error conectando a MongoDB para test:", error);
      process.exit(1);
    });
});

afterAll(async () => {
  await mongoose.connection.close();
});
